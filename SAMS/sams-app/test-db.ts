import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testDb() {
    console.log("URL:", process.env.DATABASE_URL ? "Exists" : "Missing");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
    });

    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected, running query...");
        const res = await client.query('SELECT email FROM users LIMIT 1');
        console.log("Query result:", res.rows);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
        console.log("Done");
    }
}
testDb();
