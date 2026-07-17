"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateUserRole(formData: FormData) {
  // 1. SECURITY CHECK: Verify the requester is actually an Admin
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const requester = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (requester?.role !== "ADMIN") {
    throw new Error("Insufficient permissions");
  }

  // 2. Extract the target user's ID and their new role from the form
  const targetUserId = formData.get("userId") as string;
  const newRole = formData.get("role") as string;

  if (!targetUserId || !newRole) {
    throw new Error("Missing required fields");
  }

  // Prevent an admin from accidentally demoting themselves
  if (targetUserId === session.user.id && newRole !== "ADMIN") {
    throw new Error("You cannot demote yourself. Ask another admin to do it.");
  }

  // 3. Update the database
  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  // 4. Refresh the page so the table updates instantly
  revalidatePath("/admin");
}