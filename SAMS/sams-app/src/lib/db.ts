/**
 * Shared raw pg helper for Next.js server actions.
 *
 * The Neon WebSocket Pool adapter (PrismaNeon) fails inside Next.js server
 * actions with PrismaClientInitializationError. Raw pg with SSL is the
 * reliable alternative, consistent with auth.ts.
 */
import { Client } from "pg";

export async function withDb<T>(
    fn: (client: Client) => Promise<T>
): Promise<T> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
        return await fn(client);
    } finally {
        await client.end();
    }
}
