import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if URL is present. If not, try to load it.
if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config();
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing from environment variables.");
}

/**
 * Initialize Prisma with Neon adapter and WebSocket support for serverless environments.
 */
export const prisma =
  globalForPrisma.prisma ??
  (() => {
    neonConfig.webSocketConstructor = ws;
    const adapter = new PrismaNeon({ connectionString: connectionString! });
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error"] : [],
    });
    return client;
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
