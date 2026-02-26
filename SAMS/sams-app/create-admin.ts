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
            INSERT INTO users (id, email, password_hash, first_name, last_name, role, institution_id, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, 'System', 'Admin', 'SUPER_ADMIN', (SELECT id FROM institutions LIMIT 1), NOW(), NOW())
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                role = 'SUPER_ADMIN',
                updated_at = NOW();
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
