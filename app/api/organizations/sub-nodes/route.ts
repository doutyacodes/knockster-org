import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
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
});

// GET - List sub-nodes of the current admin's organization
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse("Unauthorized");
    }

    const { id, role } = authResult.payload;
    if (role !== "orgadmin") return unauthorizedResponse("Unauthorized");

    // Get admin's node
    const [admin] = await db
      .select({ organizationNodeId: orgAdmin.organizationNodeId })
      .from(orgAdmin)
      .where(eq(orgAdmin.id, id!))
      .limit(1);

    if (!admin) return unauthorizedResponse("Admin not found");

    const subNodes = await db
      .select()
      .from(organizationNode)
      .where(eq(organizationNode.parentId, admin.organizationNodeId));

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
        parentNodeId: orgAdmin.organizationNodeId,
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

    // Check quota
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(organizationNode)
      .where(eq(organizationNode.parentId, adminNodeInfo.parentNodeId));

    if (countResult.count >= adminNodeInfo.maxSubNodes) {
      return errorResponse(`Quota exceeded. You can only create up to ${adminNodeInfo.maxSubNodes} sub-nodes.`, 400);
    }

    const { name, type } = validation.data;
    const newId = crypto.randomUUID();

    await db.insert(organizationNode).values({
      id: newId,
      name,
      type,
      parentId: adminNodeInfo.parentNodeId,
      status: "active",
    });

    // Log the action
    await db.insert(auditLog).values({
      actorType: "OrgAdmin",
      actorId: id!,
      action: "SUB_NODE_CREATED",
      metadata: { nodeId: newId, name, type },
    });

    return successResponse({ id: newId, name, type }, "Sub-node created successfully");
  } catch (error) {
    console.error("Create sub-node error:", error);
    return errorResponse("An error occurred", 500);
  }
}
