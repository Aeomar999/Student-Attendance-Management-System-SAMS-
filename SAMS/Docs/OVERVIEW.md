# SAMS - Smart Attendance Management System

## Project Overview

A comprehensive attendance management system for educational institutions with facial recognition, role-based access control, MFA, and real-time tracking.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js App Router, Server Actions, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Auth**: NextAuth.js v5, Argon2, TOTP MFA

## User Roles

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full system access, manage institutions |
| ADMIN | Institution-level administration |
| LECTURER | Manage attendance and courses |

## Key Features

- Magic link authentication + password setup
- Multi-factor authentication (TOTP QR codes)
- Student management with face enrollment
- Course & department management
- Room management with capacity
- Attendance sessions with grace periods
- Audit logging
- CSV bulk import

## Project Structure

```
SAMS/
├── Docs/                  # Documentation
│   ├── API_Design.md
│   ├── TechStack.md
│   ├── Rule.md
│   ├── Plan.md
│   └── PRD_*.md
├── sams-app/              # Main Next.js application
│   ├── src/
│   │   ├── app/           # Pages & API routes
│   │   │   ├── (auth)/    # Login, setup-account
│   │   │   ├── (dashboard)/dashboard/
│   │   │   └── api/       # REST endpoints
│   │   ├── components/    # UI components
│   │   └── lib/           # Utilities (auth, db, rbac)
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
└── sams-fr-engine/        # Facial recognition engine
```

## Database Models

- `User` - Authentication & role data
- `Student` - Student profiles
- `Institution` - Multi-tenant institutions
- `Department` - Department CRUD
- `Course` - Course management
- `Room` - Physical room tracking
- `AttendanceSession` - Session with grace period
- `AttendanceRecord` - Student attendance
- `FaceEnrollment` - Facial recognition data
- `AuditLog` - Action history
- `PasswordHistory` - Security tracking

## Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #1976D2 | Main actions |
| Secondary | #9C27B0 | Accents |
| Success | #4CAF50 | Positive states |
| Warning | #FF9800 | Caution states |
| Error | #F44336 | Error states |

## Getting Started

```bash
cd sams-app
npm install
npm run db:push
npm run dev
```

## Configuration

Environment variables in `sams-app/.env`:
- `DATABASE_URL` - Neon PostgreSQL connection
- `NEXTAUTH_SECRET` - Auth secret
- `NEXTAUTH_URL` - App URL

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth configuration |
| `src/lib/rbac.ts` | Role-based access control |
| `src/lib/prisma.ts` | DB client + queryRaw helper |
| `src/proxy.ts` | Auth middleware |
| `src/app/actions/*.ts` | Server actions (CRUD) |

## Notes

- Next.js 15+ requires awaiting `searchParams`
- Use `queryRaw()` for complex queries (Prisma adapter quirk)
- MFA uses `otpauth` + `qrcode` for real TOTP
- Magic links logged to console (email not implemented)
