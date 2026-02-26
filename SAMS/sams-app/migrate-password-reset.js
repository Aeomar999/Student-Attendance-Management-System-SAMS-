/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        console.log("Connected to database. Creating password_reset_tokens table...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                CONSTRAINT uq_password_reset_user UNIQUE (user_id)
            );
            CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
            CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
        `);

        console.log("✅ password_reset_tokens table created successfully.");

        // Also ensure the users table has the required columns (if not already added)
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
        `);

        console.log("✅ users table columns verified (failed_attempts, locked_until, last_login_at).");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
