import { NextRequest } from "next/server";
import { eq, sql, inArray, isNull, and, not } from "drizzle-orm";
import { db } from "@/db";
import { organizationNode, orgAdmin, auditLog } from "@/db/schema";
import { authenticateRequest } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api-response";
import { z } from "zod";

const createSubNodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["block", "building", "company", "gate", "school", "classroom", "lab", "custom"]),
  parentId: z.string().uuid().optional(),
});

// Recursive function to get all descendant IDs
async function getAllDescendantIds(parentIds: string[]): Promise<string[]> {
  if (parentIds.length === 0) return [];
  
  const children = await db
    .select({ id: organizationNode.id })
    .from(organizationNode)
    .where(inArray(organizationNode.parentId, parentIds));
    
  if (children.length === 0) return [];
  
  const childIds = children.map(c => c.id);
  const grandchildIds = await getAllDescendantIds(childIds);
  
  return [...childIds, ...grandchildIds];
}

// GET - List all sub-nodes in the admin's hierarchy
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse("Unauthorized");
    }

    const { id, role } = authResult.payload;
    if (role !== "orgadmin") return unauthorizedResponse("Unauthorized");

    // Get admin's root node
    const [admin] = await db
      .select({ organizationNodeId: orgAdmin.organizationNodeId })
      .from(orgAdmin)
      .where(eq(orgAdmin.id, id!))
      .limit(1);

    if (!admin) return unauthorizedResponse("Admin not found");

    // Get all descendants recursively
    const descendantIds = await getAllDescendantIds([admin.organizationNodeId]);
    
    if (descendantIds.length === 0) {
      return successResponse([]);
    }

    const subNodes = await db
      .select()
      .from(organizationNode)
      .where(inArray(organizationNode.id, descendantIds));

    return successResponse(subNodes);
  } catch (error) {
    console.error("Get sub-nodes error:", error);
    return errorResponse("An error occurred", 500);
  }
}

// POST - Create a sub-node within the quota
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse("Unauthorized");
    }

    const { id, role } = authResult.payload;
    if (role !== "orgadmin") return unauthorizedResponse("Unauthorized");

    // Get admin details and their node's quota
    const [adminNodeInfo] = await db
      .select({
        adminId: orgAdmin.id,
        canManageHierarchy: orgAdmin.canManageHierarchy,
        rootNodeId: orgAdmin.organizationNodeId,
        maxSubNodes: organizationNode.maxSubNodes,
      })
      .from(orgAdmin)
      .innerJoin(organizationNode, eq(orgAdmin.organizationNodeId, organizationNode.id))
      .where(eq(orgAdmin.id, id!))
      .limit(1);

    if (!adminNodeInfo) return unauthorizedResponse("Admin or parent node not found");
    if (!adminNodeInfo.canManageHierarchy) {
      return errorResponse("You do not have permission to manage hierarchy", 403);
    }

    // Validate body
    const body = await req.json();
    const validation = createSubNodeSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { name, type, parentId } = validation.data;
    const targetParentId = parentId || adminNodeInfo.rootNodeId;

    // Verify targetParentId is the root or a descendant
    if (targetParentId !== adminNodeInfo.rootNodeId) {
      const allDescendants = await getAllDescendantIds([adminNodeInfo.rootNodeId]);
      if (!allDescendants.includes(targetParentId)) {
        return errorResponse("Invalid parent node", 400);
      }
    }

    // Check quota (total descendants)
    const allDescendantsCurrent = await getAllDescendantIds([adminNodeInfo.rootNodeId]);
    if (allDescendantsCurrent.length >= adminNodeInfo.maxSubNodes) {
      return errorResponse(`Quota exceeded. You can only create up to ${adminNodeInfo.maxSubNodes} nodes in total.`, 400);
    }

    const newId = crypto.randomUUID();

    await db.insert(organizationNode).values({
      id: newId,
      name,
      type,
      parentId: targetParentId,
      status: "active",
    });

    // Log the action
    await db.insert(auditLog).values({
      actorType: "OrgAdmin",
      actorId: id!,
      action: "SUB_NODE_CREATED",
      metadata: { nodeId: newId, name, type, parentId: targetParentId },
    });

    return successResponse({ id: newId, name, type, parentId: targetParentId }, "Node created successfully");
  } catch (error) {
    console.error("Create sub-node error:", error);
    return errorResponse("An error occurred", 500);
  }
}

// DELETE - Remove a node (and its entire subtree via DB cascade)
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse("Unauthorized");
    }

    const { id: adminId, role } = authResult.payload;
    if (role !== "orgadmin") return unauthorizedResponse("Unauthorized");

    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("id");

    if (!nodeId) return errorResponse("Node ID is required");

    // Get admin's root node
    const [admin] = await db
      .select({ organizationNodeId: orgAdmin.organizationNodeId })
      .from(orgAdmin)
      .where(eq(orgAdmin.id, adminId!))
      .limit(1);

    if (!admin) return unauthorizedResponse("Admin not found");

    // Verify node is a descendant (you can't delete your own root node)
    const descendantIds = await getAllDescendantIds([admin.organizationNodeId]);
    if (!descendantIds.includes(nodeId)) {
      return errorResponse("Node not found or access denied", 404);
    }

    // Delete the node - DB cascade handles children, admins, and staff
    await db.delete(organizationNode).where(eq(organizationNode.id, nodeId));

    // Log the action
    await db.insert(auditLog).values({
      actorType: "OrgAdmin",
      actorId: adminId!,
      action: "NODE_DELETED",
      metadata: { nodeId },
    });

    return successResponse(null, "Node and all its contents deleted successfully");
  } catch (error) {
    console.error("Delete node error:", error);
    return errorResponse("An error occurred", 500);
  }
}
