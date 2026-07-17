import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. ARCHITECTURAL THEORY: The Session Check
  // We grab the incoming HTTP request headers and pass them to Better Auth.
  // Better Auth reads the secure cookie, queries Supabase, and returns the User.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. PRACTICAL EXECUTION: The Bounce
  // If the user has no active session in the database, they are an intruder.
  if (!session) {
    // redirect() instantly stops the server render and throws a 307 status code
    redirect("/login");
  }

  // 2. Fetch the user's strict role from the database
  // (We do this to guarantee we have the freshest data, in case an admin just upgraded them!)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  // 3. THE RBAC GUARDRAIL
  // If they are just a standard BUYER (or if the user record is missing), kick them out!
  if (dbUser?.role !== "SELLER" && dbUser?.role !== "ADMIN") {
    redirect("/"); 
  }

  // 4. If they pass the check, render the requested page
  return <>{children}</>;
}