import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyPassword } from '@/lib/password';
import { authConfig } from '@/lib/auth.config';
import { Client } from 'pg';

/**
 * Use a raw pg Client with SSL for the authorize lookup.
 * The Neon WebSocket adapter (PrismaNeon) crashes inside Next.js
 * Node.js API route handlers — this is the reliable alternative.
 */
async function withRawClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
    });
    try {
        console.log("[SAMS Auth] Connecting to DB...");
        await client.connect();
        console.log("[SAMS Auth] DB Connected!");
        return await fn(client);
    } finally {
        await client.end();
    }
}

async function lookupUser(email: string) {
    return withRawClient(async (client) => {
        const result = await client.query(
            `SELECT id, email, password_hash, first_name, last_name, role,
                    status, failed_attempts, locked_until
             FROM users WHERE email = $1 LIMIT 1`,
            [email]
        );
        return result.rows[0] ?? null;
    });
}

/** Progressive lockout: doubles each cycle (15m, 30m, 60m, ...) */
function getLockoutMinutes(failedAttempts: number): number {
    const cycles = Math.floor((failedAttempts - 5) / 5) + 1;
    return 15 * Math.pow(2, Math.max(0, cycles - 1));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            credentials: {
                email: { type: 'email' },
                password: { type: 'password' },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async authorize(credentials: any) {
                console.log("[SAMS Auth] authorize called with emails:", credentials?.email);
                try {
                    if (!credentials?.email || !credentials?.password) return null;

                    console.log("[SAMS Auth] Looking up user...");
                    const user = await lookupUser(credentials.email as string);
                    console.log("[SAMS Auth] Lookup user result:", user ? "found" : "not found");
                    if (!user?.password_hash) return null;

                    // Block suspended accounts
                    if (user.status === 'SUSPENDED') return null;

                    // Check account lockout
                    if (user.locked_until && new Date(user.locked_until) > new Date()) {
                        console.warn(`[SAMS Auth] Account locked until ${user.locked_until}: ${user.email}`);
                        return null;
                    }

                    const isValid = await verifyPassword(
                        credentials.password as string,
                        user.password_hash
                    );

                    if (!isValid) {
                        // Increment failed attempts and potentially lock the account
                        const newAttempts = (user.failed_attempts || 0) + 1;
                        const lockUntil = newAttempts >= 5
                            ? new Date(Date.now() + getLockoutMinutes(newAttempts) * 60_000).toISOString()
                            : null;

                        await withRawClient(async (client) => {
                            await client.query(
                                `UPDATE users SET failed_attempts = $1, locked_until = $2, updated_at = NOW() WHERE id = $3`,
                                [newAttempts, lockUntil, user.id]
                            );
                        });

                        if (lockUntil) {
                            console.warn(`[SAMS Auth] Account locked after ${newAttempts} failures: ${user.email}`);
                        }

                        // Audit: failed login
                        await withRawClient(async (auditClient) => {
                            await auditClient.query(
                                `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, created_at)
                                 VALUES (gen_random_uuid(), $1, 'FAILED_LOGIN', 'USER', $1, $2, NOW())`,
                                [user.id, JSON.stringify({ email: user.email, attempt: newAttempts })]
                            );
                        });

                        return null;
                    }

                    // Successful login — reset failed attempts and update last_login
                    await withRawClient(async (client) => {
                        await client.query(
                            `UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
                            [user.id]
                        );
                    });

                    // Audit: successful login
                    await withRawClient(async (auditClient) => {
                        await auditClient.query(
                            `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, created_at)
                             VALUES (gen_random_uuid(), $1, 'LOGIN', 'USER', $1, $2, NOW())`,
                            [user.id, JSON.stringify({ email: user.email })]
                        );
                    });

                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: `${user.first_name} ${user.last_name}`,
                    };
                } catch (err) {
                    console.error('[SAMS Auth] authorize error:', err);
                    return null;
                }
            },
        }),
    ],
});
