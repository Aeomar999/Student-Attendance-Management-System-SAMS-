/**
 * One-shot migration script: adds columns that were defined in schema.prisma
 * but missing from the initial migration SQL file.
 *
 * Run once: node scripts/add-missing-columns.mjs
 */
import pg from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from .env if dotenv-style file exists
const envPath = resolve(__dirname, "../.env");
try {
    const envFile = readFileSync(envPath, "utf8");
    for (const line of envFile.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] ??= value;
    }
} catch {
    // .env not found; rely on environment variables already set
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("ERROR: DATABASE_URL is not set. Set it in your environment or .env file.");
    process.exit(1);
}

const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const alterStatements = [
    {
        label: "grace_period → attendance_sessions",
        sql: `ALTER TABLE "attendance_sessions" ADD COLUMN IF NOT EXISTS "grace_period" INTEGER NOT NULL DEFAULT 15`,
    },
    {
        label: "manual_reason → attendance_records",
        sql: `ALTER TABLE "attendance_records" ADD COLUMN IF NOT EXISTS "manual_reason" TEXT`,
    },
    {
        label: "credit_hours → courses",
        sql: `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "credit_hours" INTEGER NOT NULL DEFAULT 3`,
    },
    {
        label: "details → audit_logs",
        sql: `ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "details" TEXT`,
    },
];

async function run() {
    await client.connect();
    process.stdout.write("Connected to database.\n\n");

    for (const { label, sql } of alterStatements) {
        try {
            await client.query(sql);
            process.stdout.write(`✅  ${label}\n`);
        } catch (err) {
            console.error(`❌  ${label}: ${err.message}`);
        }
    }

    await client.end();
    process.stdout.write("\nDone.\n");
}

run().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
