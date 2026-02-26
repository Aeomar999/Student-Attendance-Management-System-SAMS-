import { Client } from "pg";

async function main() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    
    const result = await client.query(`
        INSERT INTO institutions (id, name, code, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'SAMS University', 'SAMS', 'ACTIVE', NOW(), NOW())
        RETURNING id, name, code
    `);
    
    console.log("Created institution:", result.rows[0]);
    
    await client.end();
}

main().catch(console.error);
