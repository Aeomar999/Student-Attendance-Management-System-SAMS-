import { Client } from "pg";
import * as argon2 from "@node-rs/argon2";
import process from "node:process";

async function main() {
    const email = "admin@sams.edu";
    const password = "Password123!";

    console.log(`Creating/Updating admin user: ${email}`);
    const hash = await argon2.hash(password);

    // Connect directly utilizing pg without WebSockets
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();

    try {
        // Direct SQL Upsert using Neon
        const query = `
            INSERT INTO "User" ("id", "email", "passwordHash", "firstName", "lastName", "role", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), $1, $2, 'System', 'Admin', 'SUPER_ADMIN', NOW(), NOW())
            ON CONFLICT ("email") 
            DO UPDATE SET 
                "passwordHash" = EXCLUDED."passwordHash",
                "role" = 'SUPER_ADMIN',
                "updatedAt" = NOW();
        `;

        await client.query(query, [email, hash]);

        console.log(`✅ Success! You can now log in with:`);
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
    } catch (e) {
        console.error("❌ Failed to upsert user:", e);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
