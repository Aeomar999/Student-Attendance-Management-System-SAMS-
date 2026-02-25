import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

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
    if (!process.env.DATABASE_URL) {
        throw new Error('[SAMS] DATABASE_URL is not set. Check your .env file.');
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
