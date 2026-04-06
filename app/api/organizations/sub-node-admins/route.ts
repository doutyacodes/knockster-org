import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { orgAdmin, organizationNode, auditLog } from "@/db/schema";
import { authenticateRequest, hashPassword } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api-response";
import { z } from "zod";

const createAdminSchema = z.object({
  organizationNodeId: z.string().uuid("Invalid organization node ID"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// GET - List admins for a specific sub-node
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse("Unauthorized");
    }

    const { id: adminId, role } = authResult.payload;
    if (role !== "orgadmin") return unauthorizedResponse("Unauthorized");

    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("organizationNodeId");

    if (!nodeId) return errorResponse("Node ID is required", 400);

    // Get current admin's node
    const [currentAdmin] = await db
      .select({ organizationNodeId: orgAdmin.organizationNodeId })
      .from(orgAdmin)
      .where(eq(orgAdmin.id, adminId!))
      .limit(1);

    if (!currentAdmin) return unauthorizedResponse("Admin not found");

    // Verify sub-node belongs to current admin's hierarchy
    const [node] = await db
      .select()
      .from(organizationNode)
      .where(
        and(
          eq(organizationNode.id, nodeId),
          eq(organizationNode.parentId, currentAdmin.organizationNodeId)
        )
      )
      .limit(1);

    if (!node) return unauthorizedResponse("Node not found or access denied");

    const admins = await db
      .select({
        id: orgAdmin.id,
        email: orgAdmin.email,
        status: orgAdmin.status,
        createdAt: orgAdmin.createdAt,
      })
      .from(orgAdmin)
      .where(eq(orgAdmin.organizationNodeId, nodeId));

    return successResponse(admins);
  } catch (error) {
    console.error("Get sub-node admins error:", error);
    return errorResponse("An error occurred", 500);
  }
}

// POST - Create a new admin for a sub-node
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse("Unauthorized");
    }

    const { id: adminId, role } = authResult.payload;
    if (role !== "orgadmin") return unauthorizedResponse("Unauthorized");

    // Validate body
    const body = await req.json();
    const validation = createAdminSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { organizationNodeId, email, password } = validation.data;

    // Get current admin's details (check canManageHierarchy)
    const [currentAdmin] = await db
      .select({ 
        organizationNodeId: orgAdmin.organizationNodeId,
        canManageHierarchy: orgAdmin.canManageHierarchy 
      })
      .from(orgAdmin)
      .where(eq(orgAdmin.id, adminId!))
      .limit(1);

    if (!currentAdmin || !currentAdmin.canManageHierarchy) {
      return unauthorizedResponse("Permission denied to manage hierarchy");
    }

    // Verify sub-node belongs to current admin's hierarchy
    const [node] = await db
      .select()
      .from(organizationNode)
      .where(
        and(
          eq(organizationNode.id, organizationNodeId),
          eq(organizationNode.parentId, currentAdmin.organizationNodeId)
        )
      )
      .limit(1);

    if (!node) return errorResponse("Target node not found or access denied", 403);

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(orgAdmin)
      .where(eq(orgAdmin.email, email))
      .limit(1);

    if (existing) return errorResponse("Email already in use", 400);

    // Create admin
    const passwordHash = await hashPassword(password);
    const newAdminId = crypto.randomUUID();

    await db.insert(orgAdmin).values({
      id: newAdminId,
      email,
      passwordHash,
      organizationNodeId,
      status: "active",
      canManageHierarchy: false, // Default: sub-node admins can't further manage hierarchy unless explicitly granted later
    });

    // Log the action
    await db.insert(auditLog).values({
      actorType: "OrgAdmin",
      actorId: adminId!,
      action: "SUB_NODE_ADMIN_CREATED",
      metadata: { adminId: newAdminId, email, organizationNodeId },
    });

    return successResponse({ id: newAdminId, email }, "Admin created successfully");
  } catch (error) {
    console.error("Create sub-node admin error:", error);
    return errorResponse("An error occurred", 500);
  }
}
