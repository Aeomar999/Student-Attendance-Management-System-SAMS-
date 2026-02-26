import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { Client } from 'pg';

/**
 * In Node.js (Next.js server actions / server components), the Neon
 * serverless driver needs a WebSocket constructor polyfill.
 * This must be set before any Pool is created.
 */
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
    
    if (!connectionString) {
        throw new Error('[SAMS] DATABASE_URL or DIRECT_URL is not set. Check your .env file.');
    }
    
    const finalConnectionString = connectionString.includes('uselibpqcompat') 
        ? connectionString 
        : `${connectionString}${connectionString.includes('?') ? '&' : '?'}uselibpqcompat=true`;
    
    const pool = new Pool({ 
        connectionString: finalConnectionString,
        ssl: { rejectUnauthorized: false }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

/**
 * Raw pg client for direct database access.
 * Use this when Prisma Neon adapter fails.
 */
export async function queryRaw<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
    
    if (!connectionString) {
        throw new Error('[SAMS] DATABASE_URL or DIRECT_URL is not set.');
    }
    
    const finalConnectionString = connectionString.includes('uselibpqcompat') 
        ? connectionString 
        : `${connectionString}${connectionString.includes('?') ? '&' : '?'}uselibpqcompat=true`;
    
    const client = new Client({
        connectionString: finalConnectionString,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await client.connect();
        const result = await client.query(sql, params);
        return result.rows as T[];
    } finally {
        await client.end();
    }
}

export default prisma;
