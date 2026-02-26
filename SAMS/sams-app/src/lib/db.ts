/**
 * Shared raw pg helper for Next.js server actions.
 *
 * The Neon WebSocket Pool adapter (PrismaNeon) fails inside Next.js server
 * actions with PrismaClientInitializationError. Raw pg with SSL is the
 * reliable alternative, consistent with auth.ts.
 *
 * OPTIMIZATION: Uses connection pooling to avoid creating new connections
 * for each database operation, significantly improving performance.
 */
import { Pool, PoolClient } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

export async function withDb<T>(
    fn: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        return await fn(client);
    } finally {
        client.release();
    }
}

export { pool };
