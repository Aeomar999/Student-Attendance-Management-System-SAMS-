# SAMS - Smart Attendance Management System

A comprehensive smart attendance management system for educational institutions featuring facial recognition, role-based access control, real-time attendance tracking, and detailed reporting.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)

---

## Features

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC)**: Three-tier system (SUPER_ADMIN, ADMIN, LECTURER)
- **Multi-Factor Authentication (MFA)**: TOTP-based 2FA with QR code enrollment
- **Account Lockout**: Progressive lockout after failed login attempts (5, 10, 20, 40 minutes)
- **Password Security**: Argon2 hashing with password history tracking
- **Magic Link Setup**: Secure account creation via email tokens
- **Session Management**: JWT-based authentication

### 👥 User Management
- **User Roles**:
  - SUPER_ADMIN: Full system access, can manage institutions
  - ADMIN: Institution-level administration
  - LECTURER: Can manage attendance and courses
- **User Operations**: Create, update, suspend, activate, delete users
- **Bulk User Import**: CSV-based student import with validation
- **Password Reset**: Admin-initiated or self-service password reset

### 👨‍🎓 Student Management
- **Student Registration**: Individual and bulk import
- **Face Enrollment**: Webcam capture for facial recognition
- **Student Details**: ID, name, email, program, year of study
- **Status Management**: Active, inactive, suspended states

### 📚 Course Management
- **Course CRUD**: Create, read, update, delete courses
- **Course Details**: Code, name, description, capacity, credit hours
- **Enrollment**: Student course registration
- **Lecturer Assignment**: Assign lecturers to courses

### 📅 Schedule Management
- **Weekly Schedules**: Day, start time, end time
- **Room Assignment**: Link courses to physical rooms
- **Schedule Overview**: Weekly timetable view

### ✅ Attendance Tracking
- **Session Management**: Create attendance sessions with grace periods
- **Real-time Tracking**: Mark present/absent students
- **Manual Attendance**: Override attendance records
- **Face Recognition**: Automated attendance via facial recognition (FR API integration)
- **Attendance Reports**: Detailed session and course reports

### 🏢 Organization Management
- **Institutions**: Multi-institution support
- **Departments**: Department CRUD with user/student/course counts
- **Rooms**: Physical room management with capacity tracking

### 📊 Reporting & Analytics
- **Dashboard Overview**: System statistics (students, staff, sessions)
- **Attendance Reports**: Exportable reports by course, date, student
- **Audit Logs**: Complete history of system actions

### 🎨 UI/UX
- **Design System**: SAMS brand colors (#1976D2 Primary, #9C27B0 Secondary)
- **Typography**: Roboto font family
- **Responsive**: Mobile-friendly interface
- **Dark/Light Mode**: System preference-based theming

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: React Server Components + useTransition

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5

### Security
- **Password Hashing**: Argon2
- **MFA**: otpauth + qrcode
- **Validation**: Zod schemas
- **Middleware**: Next.js middleware for auth routing

---

## Project Structure

```
sams-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/             # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   │   ├── login/
│   │   │   ├── setup-account/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/      # Protected dashboard
│   │   │   └── dashboard/
│   │   │       ├── attendance/
│   │   │       ├── audit-logs/
│   │   │       ├── courses/
│   │   │       ├── departments/
│   │   │       ├── reports/
│   │   │       ├── rooms/
│   │   │       ├── schedule/
│   │   │       ├── settings/
│   │   │       ├── students/
│   │   │       └── users/
│   │   ├── api/              # API routes
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── fr/[[...path]]/
│   │   └── actions/           # Server Actions
│   ├── components/
│   │   ├── auth/             # Auth components
│   │   ├── layout/           # Layout components
│   │   ├── students/         # Student components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth config
│   │   ├── db.ts             # Database utilities
│   │   ├── prisma.ts         # Prisma client
│   │   ├── rbac.ts           # RBAC utilities
│   │   └── password.ts       # Password utilities
│   └── types/                # TypeScript types
├── .env                       # Environment variables
├── package.json
└── README.md
```

---

## Database Schema

### Core Entities

| Model | Description |
|-------|-------------|
| **Institution** | Organizations/schools |
| **Department** | Academic departments within institutions |
| **User** | Staff, admins, lecturers |
| **Student** | Enrolled students |
| **Course** | Academic courses |
| **Schedule** | Weekly class schedules |
| **Room** | Physical classrooms |
| **AttendanceSession** | Attendance sessions |
| **AttendanceRecord** | Individual attendance entries |
| **FaceEnrollment** | Facial recognition data |
| **AuditLog** | System action history |
| **MfaCredential** | MFA configuration |
| **SetupToken** | Account setup tokens |

### User Roles
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Institution admin
- `LECTURER` - Teaching staff

### Enums
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **UserRole**: SUPER_ADMIN, ADMIN, LECTURER

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd sams-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Create Super Admin**
   ```bash
   npx tsx create-admin.ts
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-auth-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Build Commands

```bash
npm run dev        # Development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # Linting
npm run db:push   # Push schema to database
```

---

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Face Recognition (FR)
- `POST /api/fr/enroll` - Enroll face
- `POST /api/fr/verify` - Verify face
- `POST /api/fr/compare` - Compare faces

### Server Actions
The application uses Server Actions for data mutations:
- `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`
- `getStudents()`, `createStudent()`, `updateStudent()`, `deleteStudent()`
- `getCourses()`, `createCourse()`, `updateCourse()`, `deleteCourse()`
- `getDepartments()`, `createDepartment()`, `updateDepartment()`, `deleteDepartment()`
- `getRooms()`, `createRoom()`, `updateRoom()`, `deleteRoom()`
- `getAttendanceSessions()`, `createAttendanceSession()`, `markAttendance()`
- `getAuditLogs()`
- `importStudentsCSV()`

---

## Security Features

### Authentication
- JWT-based sessions with NextAuth.js
- Credentials provider with Argon2 password verification
- Account lockout after 5 failed attempts (progressive: 15m, 30m, 60m, ...)

### Authorization
- Role-based access control (RBAC)
- Middleware protection for authenticated routes
- Server-side permission checks

### MFA
- TOTP-based authenticator apps (Google Authenticator, Authy, etc.)
- QR code enrollment with brand colors
- 6-digit verification codes

### Data Protection
- SQL injection prevention via parameterized queries
- XSS prevention via React's automatic escaping
- CSRF protection via Next.js built-in mechanisms

---

## Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | #1976D2 | Main actions, links |
| Secondary | #9C27B0 | Accents, highlights |
| Success | #4CAF50 | Success states |
| Warning | #FF9800 | Warnings |
| Error | #F44336 | Errors, destructive |

### Typography
- **Font**: Roboto
- **H1**: 32px/700
- **H2**: 28px/600
- **Body**: 16px/400

---

## License

MIT License

---

## Support

For issues and questions, please open a GitHub issue.
