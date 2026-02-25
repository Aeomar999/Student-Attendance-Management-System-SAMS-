import { hash, verify } from '@node-rs/argon2';

export async function hashPassword(password: string): Promise<string> {
    return hash(password, {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
    return verify(hashed, password);
}
