import { Client } from "pg";
import process from "node:process";

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();

    try {
        const result = await client.query('SELECT "id", "email", "role" FROM "public"."User"');
        console.log(`Found ${result.rows.length} users in the database.`);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error("❌ Failed to query users:", e);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
