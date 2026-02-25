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
async function lookupUser(email: string) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL!,
        ssl: { rejectUnauthorized: false },
    });
    try {
        await client.connect();
        const result = await client.query(
            `SELECT id, email, password_hash, first_name, last_name, role
             FROM users WHERE email = $1 LIMIT 1`,
            [email]
        );
        return result.rows[0] ?? null;
    } finally {
        await client.end();
    }
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
                try {
                    if (!credentials?.email || !credentials?.password) return null;

                    const user = await lookupUser(credentials.email as string);
                    if (!user?.password_hash) return null;

                    const isValid = await verifyPassword(
                        credentials.password as string,
                        user.password_hash
                    );

                    if (!isValid) return null;

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
