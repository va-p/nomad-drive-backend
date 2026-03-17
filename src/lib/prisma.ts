import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var prisma: PrismaClient | undefined;
}

const rawUrl = (process.env.DATABASE_URL || "").replace(/['"]/g, "").trim();

const parsedUrl = new URL(rawUrl);

const adapter = new PrismaMariaDb({
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port) || 3306,
  user: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.replace("/", ""),
});

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
