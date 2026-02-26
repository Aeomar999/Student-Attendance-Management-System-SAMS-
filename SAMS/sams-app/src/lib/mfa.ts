import * as crypto from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(): string {
    const buffer = crypto.randomBytes(20);
    let bits = '';
    for (const byte of buffer) {
        bits += byte.toString(2).padStart(8, '0');
    }
    
    let secret = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5);
        const index = parseInt(chunk, 2);
        secret += BASE32_CHARS[index];
    }
    
    return secret;
}

export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
}

export function totp(secret: string, counter: number): string {
    const decoded = base32Decode(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter));
    
    const hmac = crypto.createHmac('sha1', decoded);
    hmac.update(buffer);
    const hash = hmac.digest();
    
    const hashLength = hash.length;
    const lastByte = hash[hashLength - 1];
    const offset = (lastByte ?? 0) & 0xf;
    
    const b0 = hash[offset] ?? 0;
    const b1 = hash[offset + 1] ?? 0;
    const b2 = hash[offset + 2] ?? 0;
    const b3 = hash[offset + 3] ?? 0;
    
    const binary = 
        ((b0 & 0x7f) << 24) |
        ((b1 & 0xff) << 16) |
        ((b2 & 0xff) << 8) |
        (b3 & 0xff);
    
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
}

export function verifyTotp(secret: string, token: string, window: number = 1): boolean {
    const counter = Math.floor(Date.now() / 30000);
    
    for (let i = -window; i <= window; i++) {
        if (totp(secret, counter + i) === token) {
            return true;
        }
    }
    return false;
}

function base32Decode(encoded: string): Buffer {
    const clean = encoded.replace(/[^A-Z2-7]/gi, '').toUpperCase();
    let bits = '';
    
    for (const char of clean) {
        const index = BASE32_CHARS.indexOf(char);
        if (index === -1) continue;
        bits += index.toString(2).padStart(5, '0');
    }
    
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        const byte = parseInt(bits.slice(i, i + 8), 2);
        if (!isNaN(byte)) {
            bytes.push(byte);
        }
    }
    
    return Buffer.from(bytes);
}

export function getTotpUri(secret: string, email: string, issuer: string = 'SAMS'): string {
    return `otpauth://totp/${issuer}:${encodeURIComponent(email)}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
