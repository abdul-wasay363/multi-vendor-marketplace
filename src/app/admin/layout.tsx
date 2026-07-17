import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Check if they are logged in at all
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/login");
  }

  // 2. Fetch their strict role from the database
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  // 3. THE ABSOLUTE GUARDRAIL
  // If they are not an ADMIN, kick them out immediately!
  if (dbUser?.role !== "ADMIN") {
    redirect("/"); 
  }

  // 4. If they pass the check, render the admin panel
  return <>{children}</>;
}