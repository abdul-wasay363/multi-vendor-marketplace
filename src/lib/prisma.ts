import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. We grab our Transaction Pooler URL from the .env file
const connectionString = `${process.env.DATABASE_URL}`;

// 2. We create a PostgreSQL connection pool
const pool = new Pool({ connectionString });

// 3. We wrap the pool in Prisma's official adapter
const adapter = new PrismaPg(pool);

// 4. We set up our hot-reload singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 5. THE FIX: We pass the adapter into the constructor!
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;