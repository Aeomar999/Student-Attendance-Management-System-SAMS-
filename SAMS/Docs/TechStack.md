# SAMS Technology Stack Documentation
# Next.js + PostgreSQL + Prisma ORM + Neon

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Stack:** Next.js 14+ | PostgreSQL 15 | Prisma 5+ | Neon Serverless

---

## Table of Contents

1. [Technology Stack Overview](#1-technology-stack-overview)
2. [Next.js Configuration](#2-nextjs-configuration)
3. [Prisma ORM Setup](#3-prisma-orm-setup)
4. [Database Schema Design](#4-database-schema-design)
5. [Performance Optimization](#5-performance-optimization)
6. [Security Best Practices](#6-security-best-practices)
7. [Deployment Guide](#7-deployment-guide)
8. [Development Workflow](#8-development-workflow)
9. [Caching & Monitoring](#9-caching--monitoring)
10. [Technology Comparison](#10-technology-comparison)

---

## 1. Technology Stack Overview

### 1.1 Core Technologies

| Technology | Version | Purpose | License |
|------------|---------|---------|---------|
| **Next.js** | 14.2.x | Full-stack React framework | MIT |
| **React** | 18.3.x | UI component library | MIT |
| **TypeScript** | 5.4.x | Type-safe JavaScript | Apache 2.0 |
| **Tailwind CSS** | 3.4.x | Utility-first CSS framework | MIT |
| **Prisma** | 5.14.x | Type-safe ORM | Apache 2.0 |
| **Neon** | Latest | Serverless PostgreSQL | Proprietary |
| **NextAuth.js** | 5.x | Authentication library | ISC |

### 1.2 Supporting Libraries

| Category | Library | Version | Purpose |
|----------|---------|---------|---------|
| **UI Components** | shadcn/ui | Latest | Accessible component system |
| **Forms** | React Hook Form | 7.x | Form state management |
| **Validation** | Zod | 3.x | Schema validation |
| **Data Fetching** | TanStack Query | 5.x | Server state management |
| **Icons** | Lucide React | Latest | Icon library |
| **Date/Time** | date-fns | 3.x | Date manipulation |

### 1.3 Stack Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js App Router)                │
│  React Server Components │ Client Components │ Server Actions   │
├─────────────────────────────────────────────────────────────────┤
│                         API LAYER                               │
│    Next.js API Routes │ tRPC (optional) │ Server Actions        │
├─────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                              │
│         Prisma ORM │ Neon PostgreSQL │ Upstash Redis           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Next.js Configuration

### 2.1 Project Initialization

```bash
# Create new Next.js project
npx create-next-app@latest sams-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd sams-app

# Install core dependencies
npm install @prisma/client @neondatabase/serverless @prisma/adapter-neon
npm install next-auth@beta @auth/prisma-adapter
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query date-fns lucide-react

# Install dev dependencies
npm install -D prisma @types/node
```

### 2.2 Project Structure

```
sams-app/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/             # Auth routes
│   │   ├── (dashboard)/        # Dashboard routes
│   │   ├── api/                # API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui
│   │   └── features/           # Feature components
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts           # Prisma client
│   │   ├── auth.ts             # Auth config
│   │   └── validations/        # Zod schemas
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # TypeScript types
│   └── actions/                # Server actions
├── prisma/
│   ├── schema.prisma           # Prisma schema
│   └── migrations/             # Migrations
├── .env.local                  # Environment variables
├── next.config.mjs             # Next.js config
└── tailwind.config.ts          # Tailwind config
```

### 2.3 Next.js Configuration

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.neon.tech' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },
};

export default nextConfig;
```

### 2.4 TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 3. Prisma ORM Setup

### 3.1 Environment Variables

```bash
# .env.local

# Neon Database - Pooled connection (for app)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/sams?sslmode=require"

# Direct connection (for migrations)
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/sams?sslmode=require"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3.2 Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  LECTURER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  passwordHash  String?    @map("password_hash")
  firstName     String     @map("first_name")
  lastName      String     @map("last_name")
  role          UserRole   @default(LECTURER)
  status        UserStatus @default(ACTIVE)
  
  mfaEnabled    Boolean    @default(false) @map("mfa_enabled")
  failedAttempts Int       @default(0) @map("failed_attempts")
  lockedUntil   DateTime?  @map("locked_until")
  lastLoginAt   DateTime?  @map("last_login_at")
  
  institutionId String?    @map("institution_id")
  departmentId  String?    @map("department_id")
  
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  sessions      Session[]
  accounts      Account[]

  @@index([email])
  @@index([institutionId])
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Student {
  id           String     @id @default(cuid())
  studentId    String     @unique @map("student_id")
  firstName    String     @map("first_name")
  lastName     String     @map("last_name")
  email        String     @unique
  yearOfStudy  Int        @map("year_of_study")
  program      String
  status       UserStatus @default(ACTIVE)
  faceEnrolled Boolean    @default(false) @map("face_enrolled")
  
  institutionId String    @map("institution_id")
  departmentId  String    @map("department_id")
  
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  @@index([studentId])
  @@index([email])
  @@map("students")
}

model AttendanceSession {
  id          String   @id @default(cuid())
  courseId    String   @map("course_id")
  lecturerId  String   @map("lecturer_id")
  sessionDate DateTime @map("session_date") @db.Date
  startTime   DateTime @map("start_time")
  endTime     DateTime? @map("end_time")
  status      String   @default("SCHEDULED")
  
  totalPresent Int @default(0) @map("total_present")
  totalAbsent  Int @default(0) @map("total_absent")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([courseId])
  @@index([lecturerId])
  @@index([sessionDate])
  @@map("attendance_sessions")
}

model AttendanceRecord {
  id              String   @id @default(cuid())
  sessionId       String   @map("session_id")
  studentId       String   @map("student_id")
  status          String   @default("ABSENT")
  recognizedAt    DateTime? @map("recognized_at")
  confidenceScore Float?   @map("confidence_score")
  isManual        Boolean  @default(false) @map("is_manual")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([sessionId, studentId])
  @@index([sessionId])
  @@index([studentId])
  @@map("attendance_records")
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?  @map("user_id")
  action     String
  entityType String   @map("entity_type")
  entityId   String?  @map("entity_id")
  oldValues  Json?    @map("old_values")
  newValues  Json?    @map("new_values")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([entityType])
  @@map("audit_logs")
}
```

### 3.3 Prisma Client with Neon Adapter

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter, log: ['error'] });
  }
  
  return new PrismaClient({ log: ['query', 'error', 'warn'] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### 3.4 Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

---

## 4. Database Schema Design

### 4.1 Neon Optimization Principles

| Principle | Implementation |
|-----------|----------------|
| Minimize cold starts | Use connection pooling |
| Optimize for serverless | Keep queries simple and fast |
| Index strategically | Index FKs and filtered columns |
| Denormalize carefully | Store computed values |
| Leverage Neon features | Use branching for previews |

### 4.2 Index Strategy

```sql
-- Performance-critical indexes
CREATE INDEX CONCURRENTLY idx_users_email_lower ON users (LOWER(email));
CREATE INDEX CONCURRENTLY idx_students_search ON students 
  USING gin (to_tsvector('english', first_name || ' ' || last_name));
CREATE INDEX CONCURRENTLY idx_sessions_date ON attendance_sessions (session_date DESC);
CREATE INDEX CONCURRENTLY idx_records_session ON attendance_records (session_id, status);
```

### 4.3 Query Best Practices

```typescript
// Efficient pagination with cursor
export async function getStudents(cursor?: string, limit = 20) {
  const students = await prisma.student.findMany({
    take: limit + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  const hasMore = students.length > limit;
  const data = hasMore ? students.slice(0, -1) : students;

  return {
    data,
    nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
  };
}

// Parallel queries with transaction
export async function getDashboardStats(userId: string) {
  const [students, sessions, records] = await prisma.$transaction([
    prisma.student.count(),
    prisma.attendanceSession.count({ where: { lecturerId: userId } }),
    prisma.attendanceRecord.count({ where: { status: 'PRESENT' } }),
  ]);

  return { students, sessions, records };
}
```

---

## 5. Performance Optimization

### 5.1 React Server Components

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { DashboardStats } from '@/components/dashboard-stats';
import { Skeleton } from '@/components/ui/skeleton';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Suspense fallback={<Skeleton className="h-32" />}>
        <DashboardStats userId={session!.user.id} />
      </Suspense>
    </div>
  );
}

export const revalidate = 60; // ISR: revalidate every 60s
```

### 5.2 Data Caching

```typescript
// Using unstable_cache for expensive queries
import { unstable_cache } from 'next/cache';

const getCachedStats = unstable_cache(
  async (userId: string) => {
    return prisma.attendanceSession.count({
      where: { lecturerId: userId },
    });
  },
  ['dashboard-stats'],
  { revalidate: 30, tags: ['dashboard'] }
);
```

### 5.3 Edge Caching with Upstash Redis

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await redis.setex(key, ttl, data);
  return data;
}
```

---

## 6. Security Best Practices

### 6.1 Authentication with NextAuth.js v5

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;
        
        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
});
```

### 6.2 Password Hashing

```typescript
// src/lib/password.ts
import { hash, verify } from '@node-rs/argon2';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return verify(hash, password);
}
```

### 6.3 Input Validation

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(12)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});
```

### 6.4 Middleware Protection

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard');

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 7. Deployment Guide

### 7.1 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 7.2 Environment Variables (Vercel)

```bash
# Required environment variables
DATABASE_URL          # Neon pooled connection string
DIRECT_URL            # Neon direct connection (for migrations)
NEXTAUTH_SECRET       # Random secret (openssl rand -base64 32)
NEXTAUTH_URL          # https://your-domain.vercel.app
```

### 7.3 Neon Database Branching

```bash
# Create preview branch for each PR
# In vercel.json or Vercel dashboard:
{
  "build": {
    "env": {
      "DATABASE_URL": "@neon_database_url"
    }
  }
}
```

### 7.4 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run build
```

---

## 8. Development Workflow

### 8.1 Local Development

```bash
# Start development server
npm run dev

# Run Prisma Studio
npx prisma studio

# Generate types after schema change
npx prisma generate

# Create migration
npx prisma migrate dev --name description
```

### 8.2 Git Workflow

```bash
# Branch naming
feature/add-attendance-module
fix/login-error
chore/update-deps

# Commit format
feat(auth): add MFA support
fix(dashboard): correct stats calculation
```

### 8.3 Code Quality

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

---

## 9. Caching & Monitoring

### 9.1 Caching Strategy

| Layer | Tool | TTL | Use Case |
|-------|------|-----|----------|
| Browser | Cache-Control | 1hr | Static assets |
| Edge | Vercel Edge | 60s | API responses |
| Application | unstable_cache | 30s | DB queries |
| Database | Prisma Accelerate | 60s | Frequent queries |
| Session | Upstash Redis | 24hr | User sessions |

### 9.2 Monitoring Setup

```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 9.3 Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

---

## 10. Technology Comparison

### 10.1 Why This Stack?

| Choice | Alternative | Reasoning |
|--------|-------------|-----------|
| **Next.js** | Remix, Nuxt | Best React ecosystem, Vercel integration |
| **Prisma** | Drizzle, Kysely | Type safety, migrations, studio |
| **Neon** | Supabase, PlanetScale | Serverless PostgreSQL, branching |
| **NextAuth** | Clerk, Auth0 | Open source, customizable |
| **Tailwind** | CSS Modules, styled-components | Utility-first, fast development |
| **Zod** | Yup, Joi | TypeScript-first validation |

### 10.2 Stack Benefits

```
┌─────────────────────────────────────────────────────────────────┐
│                      STACK BENEFITS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Type Safety: End-to-end TypeScript                          │
│  ✅ Performance: RSC, ISR, Edge Functions                       │
│  ✅ Scalability: Serverless, auto-scaling                       │
│  ✅ DX: Hot reload, Prisma Studio, great tooling               │
│  ✅ Cost: Pay-per-use, generous free tiers                      │
│  ✅ Security: Built-in protections, best practices              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 When to Consider Alternatives

| Scenario | Recommendation |
|----------|----------------|
| Need real-time | Add Supabase Realtime or Pusher |
| Complex queries | Consider raw SQL with Kysely |
| Heavy writes | Consider dedicated PostgreSQL |
| Multi-region | Add read replicas |
| File storage | Add Vercel Blob or S3 |

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev                    # Start dev server
npx prisma studio              # Open DB GUI
npx prisma migrate dev         # Create migration

# Production
npm run build                  # Build for production
npx prisma migrate deploy      # Apply migrations
vercel --prod                  # Deploy to production

# Database
npx prisma generate            # Generate client
npx prisma db push             # Push schema (no migration)
npx prisma migrate reset       # Reset DB (dev only)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/auth.ts` | NextAuth configuration |
| `prisma/schema.prisma` | Database schema |
| `next.config.mjs` | Next.js configuration |
| `.env.local` | Environment variables |

---

**Document Control**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 23, 2026 | Initial version |

---

*This technology stack is optimized for the SAMS project requirements and follows modern best practices for full-stack Next.js applications.*
