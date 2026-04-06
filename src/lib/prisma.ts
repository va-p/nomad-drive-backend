import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

// ── URL validation ─────────────────────────────────────────────────────────────

const rawUrl = (process.env.DATABASE_URL ?? "").trim();

if (!rawUrl) {
  throw new Error(
    "❌ DATABASE_URL is not defined. Make sure it is set in your .env file.",
  );
}

let parsedUrl: URL;

try {
  parsedUrl = new URL(rawUrl);
} catch {
  throw new Error(
    "❌ DATABASE_URL is not a valid URL. " +
      "If your password contains special characters such as #, ?, [ or ], " +
      "they must be percent-encoded (e.g. # → %23). " +
      `Received value starts with: "${rawUrl.slice(0, 20)}…"`,
  );
}

if (!["postgresql:", "postgres:"].includes(parsedUrl.protocol)) {
  throw new Error(
    `❌ DATABASE_URL must use the "postgresql://" scheme. ` +
      `Got "${parsedUrl.protocol}" instead.`,
  );
}

if (!parsedUrl.hostname) {
  throw new Error(
    "❌ DATABASE_URL is missing a hostname (e.g. localhost or a remote host).",
  );
}

// ── pg Pool & Adapter ─────────────────────────────────────────────────────────

// The pg driver expects plain strings, not percent-encoded URL components,
// so we decode the username and password before passing them in.
const pool = new Pool({
  connectionString: rawUrl,
});

const adapter = new PrismaPg(pool);

// ── Prisma client singleton ───────────────────────────────────────────────────

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
