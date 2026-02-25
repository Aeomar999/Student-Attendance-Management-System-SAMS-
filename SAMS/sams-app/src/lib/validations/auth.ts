import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').transform(v => v.toLowerCase()),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address').transform(v => v.toLowerCase()),
    password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
