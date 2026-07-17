import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma"; // This is our existing database bridge!

export const auth = betterAuth({
  // 1. Tell Better Auth to save data directly into our PostgreSQL Supabase
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // 2. Enable native email and password handling
  // This single block completely replaces our old bcrypt hashing and custom bridge!
  emailAndPassword: {
    enabled: true,
  },
});