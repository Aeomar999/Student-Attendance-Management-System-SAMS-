# SAMS API Design Document
# Smart Attendance Management System - REST API Specification

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**API Version:** v1  
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [API Conventions](#2-api-conventions)
3. [Authentication API](#3-authentication-api)
4. [User Management API](#4-user-management-api)
5. [Student Management API](#5-student-management-api)
6. [Course Management API](#6-course-management-api)
7. [Attendance API](#7-attendance-api)
8. [Face Recognition API](#8-face-recognition-api)
9. [Reports API](#9-reports-api)
10. [Integration API](#10-integration-api)
11. [Webhook API](#11-webhook-api)
12. [Error Handling](#12-error-handling)
13. [Rate Limiting](#13-rate-limiting)
14. [OpenAPI Specification](#14-openapi-specification)

---

## 1. Overview

### 1.1 API Base URL

```
Production:  https://api.sams.university.edu/api/v1
Staging:     https://api-staging.sams.university.edu/api/v1
Development: http://localhost:3000/api/v1
```

### 1.2 API Versioning Strategy

SAMS uses URL path versioning (`/api/v1/`) to ensure backward compatibility.

| Version | Status | Deprecation | Sunset |
|---------|--------|-------------|--------|
| v1 | Current | N/A | N/A |
| v2 | Planned | v1 deprecated +12 months | v1 sunset +18 months |

### 1.3 Content Types

| Direction | Content-Type | Notes |
|-----------|--------------|-------|
| Request | `application/json` | Default for all requests |
| Request | `multipart/form-data` | File uploads |
| Response | `application/json` | All responses |

### 1.4 Authentication Methods

All endpoints (except `/auth/login` and `/auth/refresh`) require authentication via JWT Bearer token.

```http
Authorization: Bearer <access_token>
```

---

## 2. API Conventions

### 2.1 HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resource(s) | Yes |
| POST | Create resource | No |
| PUT | Full update resource | Yes |
| PATCH | Partial update resource | Yes |
| DELETE | Remove resource | Yes |

### 2.2 Standard Response Format

#### Success Response (Single Resource)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "...": "..."
  },
  "meta": {
    "timestamp": "2026-02-23T10:30:00Z"
  }
}
```

#### Success Response (Collection with Pagination)

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "...": "..." }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Must be at least 12 characters"]
    },
    "requestId": "req_abc123xyz"
  }
}
```

### 2.3 Pagination Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-indexed) |
| `limit` | integer | 20 | 100 | Items per page |
| `sort` | string | `createdAt` | - | Sort field |
| `order` | string | `desc` | - | Sort order (`asc`, `desc`) |

### 2.4 Filtering Parameters

Filters are passed as query parameters with the following conventions:

```
# Exact match
?status=active

# Multiple values (OR)
?status=active,inactive

# Range filters
?createdAt[gte]=2026-01-01&createdAt[lte]=2026-12-31

# Search (partial match)
?search=john

# Field-specific search
?firstName[contains]=john
```

### 2.5 Common Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `include` | string | Related resources to include (comma-separated) |
| `fields` | string | Fields to return (comma-separated) |
| `search` | string | Global search term |

---

## 3. Authentication API

### 3.1 Login

Authenticate user with email and password.

```
POST /api/v1/auth/login
```

**Rate Limit:** 10 requests/minute

#### Request Body

```json
{
  "email": "lecturer@university.edu",
  "password": "SecurePassword123!",
  "deviceFingerprint": "abc123xyz"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |
| `password` | string | Yes | User password (12-128 chars) |
| `deviceFingerprint` | string | No | Device identification hash |

#### Response (MFA Not Required)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "lecturer@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "role": "lecturer",
      "institutionId": "inst_xyz789",
      "departmentId": "dept_def456"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    },
    "session": {
      "id": "sess_ghi789",
      "expiresAt": "2026-02-23T22:30:00Z"
    }
  }
}
```

#### Response (MFA Required)

```json
{
  "success": true,
  "data": {
    "mfaRequired": true,
    "mfaToken": "mfa_temp_token_xyz",
    "mfaMethods": ["totp", "sms", "email"],
    "expiresIn": 300
  }
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_CREDENTIALS` | Email or password incorrect |
| 401 | `ACCOUNT_LOCKED` | Account locked due to failed attempts |
| 403 | `ACCOUNT_SUSPENDED` | Account has been suspended |
| 429 | `RATE_LIMITED` | Too many login attempts |

---

### 3.2 MFA Verification

Verify MFA code after successful primary authentication.

```
POST /api/v1/auth/mfa/verify
```

**Rate Limit:** 10 requests/minute

#### Request Body

```json
{
  "mfaToken": "mfa_temp_token_xyz",
  "code": "123456",
  "method": "totp"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mfaToken` | string | Yes | Temporary MFA token from login |
| `code` | string | Yes | 6-digit verification code |
| `method` | string | Yes | MFA method (`totp`, `sms`, `email`, `backup`) |

#### Response

```json
{
  "success": true,
  "data": {
    "user": { "...": "..." },
    "tokens": {
      "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

---

### 3.3 Refresh Token

Exchange refresh token for new access token.

```
POST /api/v1/auth/refresh
```

**Rate Limit:** 10 requests/minute

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

### 3.4 Logout

Invalidate current session and tokens.

```
POST /api/v1/auth/logout
```

**Authorization:** Required

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "allDevices": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | Yes | Current refresh token |
| `allDevices` | boolean | No | Logout from all devices |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

### 3.5 MFA Setup

Initialize MFA setup for user account.

```
POST /api/v1/auth/mfa/setup
```

**Authorization:** Required

#### Request Body

```json
{
  "method": "totp"
}
```

#### Response (TOTP)

```json
{
  "success": true,
  "data": {
    "method": "totp",
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "backupCodes": [
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX",
      "XXXX-XXXX-XXXX"
    ]
  }
}
```

---

### 3.6 Password Reset

#### Request Password Reset

```
POST /api/v1/auth/password/forgot
```

**Rate Limit:** 5 requests/15 minutes

#### Request Body

```json
{
  "email": "user@university.edu"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "If an account exists, a reset email has been sent"
  }
}
```

#### Reset Password

```
POST /api/v1/auth/password/reset
```

#### Request Body

```json
{
  "token": "reset_token_xyz",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

---

### 3.7 Change Password

```
POST /api/v1/auth/password/change
```

**Authorization:** Required

#### Request Body

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

---

## 4. User Management API

### 4.1 List Users

Retrieve paginated list of users.

```
GET /api/v1/users
```

**Authorization:** Required (Super Admin, Admin)  
**Rate Limit:** 100 requests/minute

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | Filter by role (`super_admin`, `admin`, `lecturer`) |
| `status` | string | Filter by status (`active`, `inactive`, `suspended`) |
| `departmentId` | uuid | Filter by department |
| `search` | string | Search by name or email |

#### Example Request

```http
GET /api/v1/users?role=lecturer&status=active&page=1&limit=20&sort=lastName&order=asc
Authorization: Bearer <token>
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "usr_abc123",
      "email": "john.doe@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "role": "lecturer",
      "department": {
        "id": "dept_xyz789",
        "name": "Computer Science"
      },
      "status": "active",
      "mfaEnabled": true,
      "lastLogin": "2026-02-23T08:30:00Z",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 4.2 Get User

Retrieve single user by ID.

```
GET /api/v1/users/:id
```

**Authorization:** Required (Super Admin, Admin, or self)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | User ID |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "john.doe@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "lecturer",
    "phone": "+1234567890",
    "institutionId": "inst_xyz789",
    "institution": {
      "id": "inst_xyz789",
      "name": "State University"
    },
    "departmentId": "dept_def456",
    "department": {
      "id": "dept_def456",
      "name": "Computer Science"
    },
    "status": "active",
    "mfaEnabled": true,
    "mfaMethods": ["totp"],
    "lastLogin": "2026-02-23T08:30:00Z",
    "loginCount": 150,
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-02-20T14:00:00Z",
    "createdBy": "usr_admin123"
  }
}
```

---

### 4.3 Create User

Create a new user account.

```
POST /api/v1/users
```

**Authorization:** Required (Super Admin, Admin)  
**Rate Limit:** 100 requests/minute

#### Request Body

```json
{
  "email": "new.lecturer@university.edu",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "lecturer",
  "phone": "+1234567890",
  "departmentId": "dept_def456",
  "sendInvite": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Unique email address |
| `firstName` | string | Yes | First name (1-100 chars) |
| `lastName` | string | Yes | Last name (1-100 chars) |
| `role` | string | Yes | User role |
| `phone` | string | No | Phone number |
| `departmentId` | uuid | Yes | Department assignment |
| `sendInvite` | boolean | No | Send invitation email (default: true) |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "usr_new789",
    "email": "new.lecturer@university.edu",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "lecturer",
    "status": "pending",
    "inviteSentAt": "2026-02-23T10:30:00Z",
    "createdAt": "2026-02-23T10:30:00Z"
  }
}
```

---

### 4.4 Update User

Update user information.

```
PUT /api/v1/users/:id
```

**Authorization:** Required (Super Admin, Admin, or self for limited fields)

#### Request Body

```json
{
  "firstName": "Jane",
  "lastName": "Smith-Johnson",
  "phone": "+1987654321",
  "departmentId": "dept_new456"
}
```

---

### 4.5 Delete User

Soft delete a user account.

```
DELETE /api/v1/users/:id
```

**Authorization:** Required (Super Admin, Admin)

#### Response

```json
{
  "success": true,
  "data": {
    "message": "User successfully deactivated"
  }
}
```

---

### 4.6 Suspend/Activate User

```
PATCH /api/v1/users/:id/status
```

**Authorization:** Required (Super Admin, Admin)

#### Request Body

```json
{
  "status": "suspended",
  "reason": "Policy violation"
}
```

---

### 4.7 Reset User Password (Admin)

Force password reset for a user.

```
POST /api/v1/users/:id/password/reset
```

**Authorization:** Required (Super Admin, Admin)

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent",
    "resetToken": "reset_xyz123",
    "expiresAt": "2026-02-23T22:30:00Z"
  }
}
```

---

## 5. Student Management API

### 5.1 List Students

```
GET /api/v1/students
```

**Authorization:** Required (Admin, Lecturer for own courses)  
**Rate Limit:** 100 requests/minute

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `departmentId` | uuid | Filter by department |
| `program` | string | Filter by program |
| `yearOfStudy` | integer | Filter by year (1-6) |
| `faceEnrolled` | boolean | Filter by face enrollment status |
| `courseId` | uuid | Filter by course enrollment |
| `search` | string | Search by name or student ID |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "stu_abc123",
      "studentId": "2026CS001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@university.edu",
      "department": {
        "id": "dept_xyz789",
        "name": "Computer Science"
      },
      "program": "BSc Computer Science",
      "yearOfStudy": 2,
      "status": "active",
      "faceEnrolled": true,
      "consentGiven": true,
      "enrollmentDate": "2025-09-01",
      "createdAt": "2025-08-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

### 5.2 Get Student

```
GET /api/v1/students/:id
```

**Authorization:** Required

#### Response

```json
{
  "success": true,
  "data": {
    "id": "stu_abc123",
    "studentId": "2026CS001",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@university.edu",
    "institutionId": "inst_xyz789",
    "departmentId": "dept_def456",
    "department": {
      "id": "dept_def456",
      "name": "Computer Science"
    },
    "program": "BSc Computer Science",
    "yearOfStudy": 2,
    "enrollmentDate": "2025-09-01",
    "status": "active",
    "faceEnrolled": true,
    "faceEnrollmentDate": "2025-09-05T14:30:00Z",
    "faceImageCount": 10,
    "consentGiven": true,
    "consentDate": "2025-09-05T14:25:00Z",
    "courses": [
      {
        "id": "crs_xyz789",
        "code": "CS201",
        "name": "Data Structures"
      }
    ],
    "attendanceStats": {
      "overall": 92.5,
      "present": 185,
      "late": 10,
      "absent": 5,
      "excused": 3
    },
    "createdAt": "2025-08-15T10:00:00Z",
    "updatedAt": "2026-02-20T14:00:00Z"
  }
}
```

---

### 5.3 Create Student

```
POST /api/v1/students
```

**Authorization:** Required (Admin)  
**Rate Limit:** 100 requests/minute

#### Request Body

```json
{
  "studentId": "2026CS050",
  "firstName": "Bob",
  "lastName": "Williams",
  "email": "bob.williams@university.edu",
  "departmentId": "dept_def456",
  "program": "BSc Computer Science",
  "yearOfStudy": 1,
  "enrollmentDate": "2026-09-01"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `studentId` | string | Yes | Unique, alphanumeric, 5-50 chars |
| `firstName` | string | Yes | 1-100 chars |
| `lastName` | string | Yes | 1-100 chars |
| `email` | string | Yes | Valid email, unique |
| `departmentId` | uuid | Yes | Valid department ID |
| `program` | string | Yes | 1-255 chars |
| `yearOfStudy` | integer | Yes | 1-6 |
| `enrollmentDate` | date | Yes | ISO 8601 date |

---

### 5.4 Bulk Import Students

Import multiple students from CSV.

```
POST /api/v1/students/import
```

**Authorization:** Required (Admin)  
**Rate Limit:** 20 requests/minute  
**Content-Type:** `multipart/form-data`

#### Request

| Field | Type | Description |
|-------|------|-------------|
| `file` | file | CSV file (max 10MB) |
| `skipDuplicates` | boolean | Skip existing student IDs |
| `sendNotifications` | boolean | Send welcome emails |

#### CSV Format

```csv
student_id,first_name,last_name,email,department_id,program,year_of_study,enrollment_date
2026CS051,Charlie,Brown,charlie@uni.edu,dept_def456,BSc CS,1,2026-09-01
2026CS052,Diana,Prince,diana@uni.edu,dept_def456,BSc CS,1,2026-09-01
```

#### Response

```json
{
  "success": true,
  "data": {
    "imported": 45,
    "skipped": 3,
    "failed": 2,
    "errors": [
      {
        "row": 48,
        "studentId": "2026CS098",
        "error": "Invalid email format"
      }
    ]
  }
}
```

---

### 5.5 Student Face Enrollment

#### Get Enrollment Status

```
GET /api/v1/students/:id/face
```

#### Response

```json
{
  "success": true,
  "data": {
    "enrolled": true,
    "imageCount": 10,
    "qualityScore": 0.87,
    "enrolledAt": "2025-09-05T14:30:00Z",
    "enrolledBy": "usr_admin123",
    "lastUpdated": "2026-01-15T10:00:00Z"
  }
}
```

#### Enroll Face Data

```
POST /api/v1/students/:id/face/enroll
```

**Authorization:** Required (Admin)  
**Rate Limit:** 20 requests/minute  
**Content-Type:** `multipart/form-data`

#### Request

| Field | Type | Description |
|-------|------|-------------|
| `images` | file[] | 5-15 face images (JPEG/PNG) |
| `consentConfirmed` | boolean | Student consent confirmation |

#### Response

```json
{
  "success": true,
  "data": {
    "studentId": "stu_abc123",
    "enrollmentId": "enr_xyz789",
    "imagesProcessed": 10,
    "imagesAccepted": 10,
    "qualityScore": 0.89,
    "embeddingsGenerated": true,
    "warnings": []
  }
}
```

---

### 5.6 Update Student

```
PUT /api/v1/students/:id
```

**Authorization:** Required (Admin)

---

### 5.7 Delete Student

```
DELETE /api/v1/students/:id
```

**Authorization:** Required (Admin)

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `deleteFaceData` | boolean | Also delete facial data |
| `reason` | string | Deletion reason (required) |

---

## 6. Course Management API

### 6.1 List Courses

```
GET /api/v1/courses
```

**Authorization:** Required  
**Rate Limit:** 100 requests/minute

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `departmentId` | uuid | Filter by department |
| `lecturerId` | uuid | Filter by assigned lecturer |
| `semester` | string | Filter by semester (e.g., "2026-Spring") |
| `status` | string | Filter by status (`active`, `completed`, `archived`) |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "crs_xyz789",
      "code": "CS201",
      "name": "Data Structures",
      "department": {
        "id": "dept_def456",
        "name": "Computer Science"
      },
      "lecturer": {
        "id": "usr_abc123",
        "name": "Dr. John Doe"
      },
      "semester": "2026-Spring",
      "capacity": 50,
      "enrolledCount": 45,
      "schedules": [
        {
          "dayOfWeek": "Monday",
          "startTime": "09:00",
          "endTime": "10:30",
          "room": "CS-101"
        }
      ],
      "status": "active",
      "createdAt": "2026-01-10T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

---

### 6.2 Get Course

```
GET /api/v1/courses/:id
```

**Authorization:** Required

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `include` | string | Related data (`students`, `schedules`, `sessions`) |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "crs_xyz789",
    "code": "CS201",
    "name": "Data Structures",
    "description": "Introduction to data structures and algorithms",
    "department": {
      "id": "dept_def456",
      "name": "Computer Science"
    },
    "lecturer": {
      "id": "usr_abc123",
      "email": "john.doe@university.edu",
      "firstName": "John",
      "lastName": "Doe"
    },
    "semester": "2026-Spring",
    "academicYear": "2025-2026",
    "capacity": 50,
    "enrolledCount": 45,
    "schedules": [
      {
        "id": "sch_abc123",
        "dayOfWeek": "Monday",
        "startTime": "09:00",
        "endTime": "10:30",
        "room": {
          "id": "room_xyz789",
          "name": "CS-101",
          "building": "Engineering Building",
          "capacity": 60
        }
      },
      {
        "id": "sch_def456",
        "dayOfWeek": "Wednesday",
        "startTime": "09:00",
        "endTime": "10:30",
        "room": {
          "id": "room_xyz789",
          "name": "CS-101"
        }
      }
    ],
    "attendanceSettings": {
      "gracePeriod": 15,
      "autoStart": false,
      "recognitionMode": "continuous"
    },
    "status": "active",
    "createdAt": "2026-01-10T10:00:00Z",
    "updatedAt": "2026-02-01T14:00:00Z"
  }
}
```

---

### 6.3 Create Course

```
POST /api/v1/courses
```

**Authorization:** Required (Admin)

#### Request Body

```json
{
  "code": "CS301",
  "name": "Database Systems",
  "description": "Introduction to database design and SQL",
  "departmentId": "dept_def456",
  "lecturerId": "usr_abc123",
  "semester": "2026-Spring",
  "capacity": 40,
  "schedules": [
    {
      "dayOfWeek": "Tuesday",
      "startTime": "14:00",
      "endTime": "15:30",
      "roomId": "room_xyz789"
    },
    {
      "dayOfWeek": "Thursday",
      "startTime": "14:00",
      "endTime": "15:30",
      "roomId": "room_xyz789"
    }
  ],
  "attendanceSettings": {
    "gracePeriod": 15,
    "autoStart": false
  }
}
```

---

### 6.4 Update Course

```
PUT /api/v1/courses/:id
```

**Authorization:** Required (Admin)

---

### 6.5 Delete Course

```
DELETE /api/v1/courses/:id
```

**Authorization:** Required (Admin)

---

### 6.6 Course Enrollment

#### Enroll Students in Course

```
POST /api/v1/courses/:id/students
```

**Authorization:** Required (Admin)

#### Request Body

```json
{
  "studentIds": ["stu_abc123", "stu_def456", "stu_ghi789"]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "enrolled": 3,
    "alreadyEnrolled": 0,
    "failed": 0
  }
}
```

#### Remove Students from Course

```
DELETE /api/v1/courses/:id/students
```

#### Request Body

```json
{
  "studentIds": ["stu_abc123"]
}
```

#### Get Course Roster

```
GET /api/v1/courses/:id/students
```

**Authorization:** Required (Admin, Lecturer of course)

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "stu_abc123",
      "studentId": "2026CS001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice@university.edu",
      "faceEnrolled": true,
      "enrolledAt": "2026-01-15T10:00:00Z",
      "attendanceRate": 92.5
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 45
  }
}
```

---

## 7. Attendance API

### 7.1 List Attendance Sessions

```
GET /api/v1/attendance/sessions
```

**Authorization:** Required  
**Rate Limit:** 500 requests/minute

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | uuid | Filter by course |
| `lecturerId` | uuid | Filter by lecturer |
| `status` | string | Filter by status (`active`, `completed`, `cancelled`) |
| `dateFrom` | date | Start date filter |
| `dateTo` | date | End date filter |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "sess_xyz789",
      "course": {
        "id": "crs_abc123",
        "code": "CS201",
        "name": "Data Structures"
      },
      "lecturer": {
        "id": "usr_def456",
        "name": "Dr. John Doe"
      },
      "room": {
        "id": "room_ghi789",
        "name": "CS-101"
      },
      "sessionDate": "2026-02-23",
      "startTime": "2026-02-23T09:00:00Z",
      "endTime": "2026-02-23T10:30:00Z",
      "status": "completed",
      "statistics": {
        "totalStudents": 45,
        "present": 40,
        "late": 3,
        "absent": 2,
        "excused": 0,
        "attendanceRate": 95.6
      },
      "createdAt": "2026-02-23T08:55:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### 7.2 Get Attendance Session

```
GET /api/v1/attendance/sessions/:id
```

**Authorization:** Required

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `include` | string | Include related data (`records`, `statistics`) |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "sess_xyz789",
    "course": {
      "id": "crs_abc123",
      "code": "CS201",
      "name": "Data Structures"
    },
    "lecturer": {
      "id": "usr_def456",
      "name": "Dr. John Doe"
    },
    "schedule": {
      "id": "sch_jkl012",
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "10:30"
    },
    "room": {
      "id": "room_ghi789",
      "name": "CS-101",
      "building": "Engineering Building"
    },
    "sessionDate": "2026-02-23",
    "startTime": "2026-02-23T09:00:00Z",
    "endTime": "2026-02-23T10:30:00Z",
    "gracePeriod": 15,
    "settings": {
      "recognitionMode": "continuous",
      "alertUnknown": true,
      "duplicateCheck": true
    },
    "status": "completed",
    "statistics": {
      "totalStudents": 45,
      "present": 40,
      "late": 3,
      "absent": 2,
      "excused": 0,
      "attendanceRate": 95.6,
      "recognitionSuccessRate": 97.8
    },
    "notes": "Regular session",
    "createdAt": "2026-02-23T08:55:00Z",
    "updatedAt": "2026-02-23T10:35:00Z"
  }
}
```

---

### 7.3 Start Attendance Session

```
POST /api/v1/attendance/sessions
```

**Authorization:** Required (Lecturer of course, Admin)  
**Rate Limit:** 500 requests/minute

#### Request Body

```json
{
  "courseId": "crs_abc123",
  "scheduleId": "sch_jkl012",
  "roomId": "room_ghi789",
  "gracePeriod": 15,
  "settings": {
    "recognitionMode": "continuous",
    "alertUnknown": true,
    "duplicateCheck": true
  },
  "notes": "Regular lecture session"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | uuid | Yes | Course ID |
| `scheduleId` | uuid | No | Schedule ID (auto-detect if not provided) |
| `roomId` | uuid | No | Room ID |
| `gracePeriod` | integer | No | Late threshold in minutes (default: 15) |
| `settings` | object | No | Session settings |
| `notes` | string | No | Session notes |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "sess_new123",
    "courseId": "crs_abc123",
    "lecturerId": "usr_def456",
    "sessionDate": "2026-02-23",
    "startTime": "2026-02-23T09:00:00Z",
    "gracePeriod": 15,
    "status": "active",
    "websocket": {
      "url": "wss://api.sams.university.edu/ws/sessions/sess_new123",
      "token": "ws_token_xyz789"
    },
    "roster": {
      "totalStudents": 45,
      "faceEnrolled": 43
    },
    "createdAt": "2026-02-23T09:00:00Z"
  }
}
```

---

### 7.4 End Attendance Session

```
POST /api/v1/attendance/sessions/:id/end
```

**Authorization:** Required (Lecturer of session, Admin)

#### Request Body

```json
{
  "markAbsentees": true,
  "notes": "Session completed normally"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "sess_xyz789",
    "status": "completed",
    "endTime": "2026-02-23T10:30:00Z",
    "statistics": {
      "totalStudents": 45,
      "present": 40,
      "late": 3,
      "absent": 2,
      "excused": 0,
      "attendanceRate": 95.6
    },
    "summary": {
      "duration": "1h 30m",
      "recognitionsProcessed": 250,
      "avgRecognitionTime": 120
    }
  }
}
```

---

### 7.5 Get Session Attendance Records

```
GET /api/v1/attendance/sessions/:id/records
```

**Authorization:** Required

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (`present`, `late`, `absent`, `excused`) |
| `isManual` | boolean | Filter manual entries |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "rec_abc123",
      "student": {
        "id": "stu_xyz789",
        "studentId": "2026CS001",
        "firstName": "Alice",
        "lastName": "Johnson"
      },
      "status": "present",
      "recognizedAt": "2026-02-23T09:05:23Z",
      "method": "facial",
      "confidenceScore": 0.96,
      "isManual": false,
      "metadata": {
        "processingTime": 115,
        "livenessScore": 0.98
      }
    },
    {
      "id": "rec_def456",
      "student": {
        "id": "stu_abc123",
        "studentId": "2026CS002",
        "firstName": "Bob",
        "lastName": "Smith"
      },
      "status": "late",
      "recognizedAt": "2026-02-23T09:20:45Z",
      "method": "facial",
      "confidenceScore": 0.94,
      "isManual": false
    },
    {
      "id": "rec_ghi789",
      "student": {
        "id": "stu_def456",
        "studentId": "2026CS003",
        "firstName": "Carol",
        "lastName": "Davis"
      },
      "status": "excused",
      "recognizedAt": null,
      "method": "manual",
      "isManual": true,
      "manualBy": {
        "id": "usr_lec123",
        "name": "Dr. John Doe"
      },
      "manualReason": "Medical appointment"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 45
  }
}
```

---

### 7.6 Manual Attendance Entry

```
POST /api/v1/attendance/sessions/:id/records
```

**Authorization:** Required (Lecturer of session, Admin)  
**Rate Limit:** 500 requests/minute

#### Request Body

```json
{
  "studentId": "stu_xyz789",
  "status": "excused",
  "reason": "Medical appointment - documentation provided"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `studentId` | uuid | Yes | Must be enrolled in course |
| `status` | string | Yes | `present`, `late`, `absent`, `excused` |
| `reason` | string | Yes | Reason for manual entry |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "rec_new123",
    "sessionId": "sess_xyz789",
    "studentId": "stu_xyz789",
    "status": "excused",
    "method": "manual",
    "isManual": true,
    "manualBy": "usr_lec123",
    "manualReason": "Medical appointment - documentation provided",
    "createdAt": "2026-02-23T10:15:00Z"
  }
}
```

---

### 7.7 Update Attendance Record

```
PATCH /api/v1/attendance/records/:id
```

**Authorization:** Required (Lecturer, Admin)

#### Request Body

```json
{
  "status": "excused",
  "reason": "Retroactive excuse - documentation received"
}
```

---

### 7.8 Get Student Attendance History

```
GET /api/v1/students/:id/attendance
```

**Authorization:** Required

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | uuid | Filter by course |
| `dateFrom` | date | Start date |
| `dateTo` | date | End date |
| `status` | string | Filter by status |

#### Response

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "stu_xyz789",
      "studentId": "2026CS001",
      "name": "Alice Johnson"
    },
    "summary": {
      "totalSessions": 50,
      "present": 45,
      "late": 3,
      "absent": 1,
      "excused": 1,
      "attendanceRate": 96.0
    },
    "records": [
      {
        "id": "rec_abc123",
        "session": {
          "id": "sess_xyz789",
          "date": "2026-02-23",
          "course": {
            "code": "CS201",
            "name": "Data Structures"
          }
        },
        "status": "present",
        "recognizedAt": "2026-02-23T09:05:23Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

---

## 8. Face Recognition API

The Face Recognition (FR) API handles facial detection, recognition, and anti-spoofing operations. These endpoints are primarily used by the attendance session system.

### 8.1 Process Face Recognition

Process a single frame for face recognition during an active session.

```
POST /api/v1/fr/recognize
```

**Authorization:** Required  
**Rate Limit:** 1000 requests/minute

#### Request Body

```json
{
  "sessionId": "sess_xyz789",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
  "metadata": {
    "frameNumber": 150,
    "timestamp": "2026-02-23T09:15:30.500Z",
    "cameraId": "cam_001"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | uuid | Yes | Active attendance session ID |
| `image` | string | Yes | Base64 encoded JPEG/PNG image |
| `metadata` | object | No | Additional frame metadata |

#### Response

```json
{
  "success": true,
  "data": {
    "requestId": "fr_req_abc123",
    "processingTime": 185,
    "faces": [
      {
        "faceId": "face_001",
        "bbox": {
          "x": 120,
          "y": 85,
          "width": 180,
          "height": 220
        },
        "recognition": {
          "matched": true,
          "student": {
            "id": "stu_xyz789",
            "studentId": "2026CS001",
            "name": "Alice Johnson"
          },
          "confidence": 0.96,
          "alreadyRecorded": false
        },
        "liveness": {
          "isLive": true,
          "score": 0.98,
          "checks": {
            "texture": 0.97,
            "depth": 0.96,
            "motion": 0.99
          }
        },
        "quality": {
          "score": 0.89,
          "blur": 0.05,
          "lighting": 0.92,
          "pose": 0.88
        }
      },
      {
        "faceId": "face_002",
        "bbox": {
          "x": 450,
          "y": 100,
          "width": 170,
          "height": 210
        },
        "recognition": {
          "matched": false,
          "student": null,
          "confidence": 0,
          "reason": "no_match"
        },
        "liveness": {
          "isLive": true,
          "score": 0.95
        },
        "quality": {
          "score": 0.75,
          "blur": 0.15,
          "lighting": 0.80,
          "pose": 0.72
        }
      }
    ],
    "statistics": {
      "facesDetected": 2,
      "facesMatched": 1,
      "facesUnknown": 1,
      "spoofAttempts": 0
    }
  }
}
```

---

### 8.2 Batch Face Recognition

Process multiple images in batch (for uploaded photos or batch enrollment verification).

```
POST /api/v1/fr/recognize/batch
```

**Authorization:** Required (Admin)  
**Rate Limit:** 50 requests/minute

#### Request Body

```json
{
  "sessionId": "sess_xyz789",
  "images": [
    {
      "id": "img_001",
      "data": "data:image/jpeg;base64,..."
    },
    {
      "id": "img_002",
      "data": "data:image/jpeg;base64,..."
    }
  ],
  "options": {
    "skipLiveness": false,
    "qualityThreshold": 0.7
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "requestId": "fr_batch_xyz789",
    "totalProcessingTime": 1250,
    "results": [
      {
        "imageId": "img_001",
        "processingTime": 180,
        "faces": [ "..." ]
      },
      {
        "imageId": "img_002",
        "processingTime": 165,
        "faces": [ "..." ]
      }
    ],
    "summary": {
      "imagesProcessed": 2,
      "totalFacesDetected": 5,
      "totalFacesMatched": 4,
      "averageConfidence": 0.94
    }
  }
}
```

---

### 8.3 Verify Face Against Student

Verify a face image against a specific student's enrolled face data.

```
POST /api/v1/fr/verify
```

**Authorization:** Required  
**Rate Limit:** 500 requests/minute

#### Request Body

```json
{
  "studentId": "stu_xyz789",
  "image": "data:image/jpeg;base64,...",
  "options": {
    "requireLiveness": true,
    "threshold": 0.45
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "verified": true,
    "confidence": 0.94,
    "threshold": 0.45,
    "liveness": {
      "isLive": true,
      "score": 0.97
    },
    "quality": {
      "score": 0.88
    },
    "processingTime": 145
  }
}
```

---

### 8.4 Detect Faces

Detect faces in an image without recognition (for enrollment preview).

```
POST /api/v1/fr/detect
```

**Authorization:** Required  
**Rate Limit:** 500 requests/minute

#### Request Body

```json
{
  "image": "data:image/jpeg;base64,...",
  "options": {
    "returnLandmarks": true,
    "qualityCheck": true
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "faces": [
      {
        "faceId": "temp_face_001",
        "bbox": {
          "x": 120,
          "y": 85,
          "width": 180,
          "height": 220
        },
        "landmarks": {
          "leftEye": { "x": 165, "y": 135 },
          "rightEye": { "x": 245, "y": 138 },
          "nose": { "x": 205, "y": 180 },
          "leftMouth": { "x": 170, "y": 230 },
          "rightMouth": { "x": 240, "y": 232 }
        },
        "quality": {
          "score": 0.92,
          "blur": 0.03,
          "lighting": 0.95,
          "pose": {
            "yaw": -5.2,
            "pitch": 3.1,
            "roll": 1.5
          },
          "occlusion": false
        },
        "suitable": true,
        "issues": []
      }
    ],
    "processingTime": 85
  }
}
```

---

### 8.5 Generate Face Embedding

Generate face embedding for enrollment (internal use).

```
POST /api/v1/fr/embed
```

**Authorization:** Required (Admin)  
**Rate Limit:** 100 requests/minute

#### Request Body

```json
{
  "studentId": "stu_xyz789",
  "images": [
    "data:image/jpeg;base64,..."
  ],
  "replace": false
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "studentId": "stu_xyz789",
    "embeddingsGenerated": 10,
    "averageQuality": 0.89,
    "enrollmentComplete": true
  }
}
```

---

### 8.6 FR Engine Health

Check FR engine status and performance.

```
GET /api/v1/fr/health
```

**Authorization:** Required (Admin)

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.2.0",
    "models": {
      "detection": {
        "name": "RetinaFace",
        "version": "2.1",
        "loaded": true
      },
      "recognition": {
        "name": "ArcFace",
        "version": "3.0",
        "loaded": true
      },
      "antispoof": {
        "name": "FAS-CNN",
        "version": "1.5",
        "loaded": true
      }
    },
    "gpu": {
      "available": true,
      "device": "NVIDIA RTX 4090",
      "memory": {
        "total": 24576,
        "used": 8192,
        "free": 16384
      }
    },
    "performance": {
      "avgDetectionTime": 45,
      "avgRecognitionTime": 95,
      "avgLivenessTime": 65,
      "requestsProcessed": 15420,
      "uptime": "5d 12h 30m"
    }
  }
}
```

---

## 9. Reports API

### 9.1 List Reports

```
GET /api/v1/reports
```

**Authorization:** Required  
**Rate Limit:** 50 requests/minute

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Report type (`daily`, `weekly`, `monthly`, `custom`) |
| `status` | string | Generation status (`pending`, `processing`, `completed`, `failed`) |
| `dateFrom` | date | Filter by creation date |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "rpt_abc123",
      "type": "daily",
      "name": "Daily Attendance Summary - 2026-02-23",
      "status": "completed",
      "parameters": {
        "date": "2026-02-23",
        "departmentId": "dept_xyz789"
      },
      "generatedAt": "2026-02-23T23:30:00Z",
      "fileUrl": "/api/v1/reports/rpt_abc123/download",
      "fileSize": 245760,
      "format": "pdf"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

### 9.2 Generate Report

```
POST /api/v1/reports
```

**Authorization:** Required  
**Rate Limit:** 50 requests/minute

#### Request Body

```json
{
  "type": "attendance_summary",
  "name": "Monthly Attendance Report - February 2026",
  "parameters": {
    "dateFrom": "2026-02-01",
    "dateTo": "2026-02-28",
    "departmentId": "dept_xyz789",
    "courseIds": ["crs_abc123", "crs_def456"],
    "includeCharts": true,
    "includeStudentDetails": true
  },
  "format": "pdf",
  "delivery": {
    "email": true,
    "recipients": ["admin@university.edu"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Report type |
| `name` | string | No | Custom report name |
| `parameters` | object | Yes | Report parameters |
| `format` | string | No | Output format (`pdf`, `excel`, `csv`) |
| `delivery` | object | No | Delivery options |

#### Report Types

| Type | Description | Parameters |
|------|-------------|------------|
| `daily_summary` | Daily attendance overview | `date`, `departmentId` |
| `weekly_summary` | Weekly trends | `weekStart`, `departmentId` |
| `monthly_summary` | Monthly analysis | `month`, `year`, `departmentId` |
| `student_report` | Individual student | `studentId`, `dateFrom`, `dateTo` |
| `course_report` | Course attendance | `courseId`, `dateFrom`, `dateTo` |
| `low_attendance` | At-risk students | `threshold`, `departmentId` |
| `custom` | Custom parameters | Varies |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "rpt_new789",
    "type": "attendance_summary",
    "name": "Monthly Attendance Report - February 2026",
    "status": "processing",
    "estimatedCompletion": "2026-02-23T10:35:00Z",
    "createdAt": "2026-02-23T10:30:00Z"
  }
}
```

---

### 9.3 Get Report

```
GET /api/v1/reports/:id
```

**Authorization:** Required

---

### 9.4 Download Report

```
GET /api/v1/reports/:id/download
```

**Authorization:** Required

#### Response Headers

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="report_2026-02-23.pdf"
Content-Length: 245760
```

---

### 9.5 Schedule Report

```
POST /api/v1/reports/schedules
```

**Authorization:** Required (Admin)

#### Request Body

```json
{
  "reportType": "daily_summary",
  "name": "Daily CS Department Report",
  "parameters": {
    "departmentId": "dept_xyz789"
  },
  "schedule": {
    "frequency": "daily",
    "time": "23:30",
    "timezone": "America/New_York"
  },
  "format": "pdf",
  "delivery": {
    "email": true,
    "recipients": ["admin@university.edu", "hod@university.edu"]
  },
  "enabled": true
}
```

---

### 9.6 Dashboard Analytics

```
GET /api/v1/reports/analytics/dashboard
```

**Authorization:** Required

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | Time period (`today`, `week`, `month`, `year`) |
| `departmentId` | uuid | Filter by department |

#### Response

```json
{
  "success": true,
  "data": {
    "period": "week",
    "dateRange": {
      "from": "2026-02-17",
      "to": "2026-02-23"
    },
    "overview": {
      "totalSessions": 250,
      "totalStudentsTracked": 1500,
      "averageAttendanceRate": 89.5,
      "manualOverrideRate": 3.2
    },
    "attendance": {
      "present": 12500,
      "late": 850,
      "absent": 1200,
      "excused": 450
    },
    "trends": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
      "attendance": [92.1, 88.5, 91.2, 89.8, 86.5],
      "sessions": [52, 48, 50, 51, 49]
    },
    "topCourses": [
      {
        "id": "crs_abc123",
        "code": "CS201",
        "name": "Data Structures",
        "attendanceRate": 95.2
      }
    ],
    "lowAttendanceStudents": 15,
    "frPerformance": {
      "successRate": 97.5,
      "avgProcessingTime": 185,
      "spoofAttemptsBlocked": 3
    }
  }
}
```

---

## 10. Integration API

### 10.1 LMS Integration - Moodle

#### Sync Courses from Moodle

```
POST /api/v1/integrations/lms/moodle/courses/sync
```

**Authorization:** Required (Admin)

#### Request Body

```json
{
  "moodleInstanceId": "moodle_inst_001",
  "options": {
    "syncStudents": true,
    "syncSchedules": false,
    "createMissing": true
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "syncId": "sync_abc123",
    "status": "completed",
    "results": {
      "coursesCreated": 5,
      "coursesUpdated": 20,
      "coursesFailed": 0,
      "studentsEnrolled": 150
    },
    "completedAt": "2026-02-23T10:35:00Z"
  }
}
```

#### Export Attendance to Moodle

```
POST /api/v1/integrations/lms/moodle/attendance/export
```

#### Request Body

```json
{
  "moodleInstanceId": "moodle_inst_001",
  "courseId": "crs_abc123",
  "dateFrom": "2026-02-01",
  "dateTo": "2026-02-28"
}
```

---

### 10.2 LMS Integration - Canvas

#### Sync Courses from Canvas

```
POST /api/v1/integrations/lms/canvas/courses/sync
```

**Authorization:** Required (Admin)

#### Export Attendance to Canvas

```
POST /api/v1/integrations/lms/canvas/attendance/export
```

---

### 10.3 SIS Integration

#### Sync Students from SIS

```
POST /api/v1/integrations/sis/students/sync
```

**Authorization:** Required (Admin)

#### Request Body

```json
{
  "sisInstanceId": "sis_inst_001",
  "options": {
    "department": "dept_xyz789",
    "yearOfStudy": 1,
    "enrollmentStatus": "active",
    "includePhotos": false
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "syncId": "sync_sis_789",
    "status": "completed",
    "results": {
      "studentsCreated": 50,
      "studentsUpdated": 200,
      "studentsFailed": 2,
      "errors": [
        {
          "studentId": "2026CS099",
          "error": "Invalid email format"
        }
      ]
    },
    "completedAt": "2026-02-23T10:40:00Z"
  }
}
```

---

### 10.4 SSO Integration

#### Get SAML Metadata

```
GET /api/v1/integrations/sso/saml/metadata
```

**Authorization:** Public

#### Response

Returns SAML 2.0 SP metadata XML.

#### Configure SSO Provider

```
POST /api/v1/integrations/sso/providers
```

**Authorization:** Required (Super Admin)

#### Request Body

```json
{
  "name": "University SSO",
  "type": "saml",
  "config": {
    "entryPoint": "https://idp.university.edu/sso/saml",
    "issuer": "sams-sp",
    "cert": "-----BEGIN CERTIFICATE-----\nMIIC...",
    "signatureAlgorithm": "sha256"
  },
  "attributeMapping": {
    "email": "urn:oid:0.9.2342.19200300.100.1.3",
    "firstName": "urn:oid:2.5.4.42",
    "lastName": "urn:oid:2.5.4.4"
  },
  "enabled": true
}
```

---

### 10.5 Notification Service

#### Send Notification

```
POST /api/v1/integrations/notifications/send
```

**Authorization:** Required (Admin)

#### Request Body

```json
{
  "type": "email",
  "template": "low_attendance_alert",
  "recipients": [
    {
      "email": "parent@email.com",
      "name": "John Parent"
    }
  ],
  "data": {
    "studentName": "Alice Johnson",
    "courseName": "Data Structures",
    "attendanceRate": 65.5,
    "threshold": 75
  }
}
```

| Notification Types | Description |
|-------------------|-------------|
| `email` | Email notification via SMTP/SendGrid |
| `sms` | SMS notification via Twilio |
| `push` | Push notification via FCM |

---

### 10.6 Calendar Integration

#### Sync to Google Calendar

```
POST /api/v1/integrations/calendar/google/sync
```

**Authorization:** Required

#### Request Body

```json
{
  "calendarId": "primary",
  "courseId": "crs_abc123",
  "options": {
    "includeAttendanceSessions": true,
    "reminder": 15
  }
}
```

---

## 11. Webhook API

### 11.1 List Webhooks

```
GET /api/v1/webhooks
```

**Authorization:** Required (Admin)

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "wh_abc123",
      "url": "https://external-system.com/webhooks/sams",
      "events": ["session.completed", "attendance.recorded"],
      "status": "active",
      "secret": "wh_sec_***************",
      "lastTriggered": "2026-02-23T10:30:00Z",
      "failureCount": 0
    }
  ]
}
```

---

### 11.2 Create Webhook

```
POST /api/v1/webhooks
```

**Authorization:** Required (Admin)

#### Request Body

```json
{
  "url": "https://external-system.com/webhooks/sams",
  "events": [
    "session.started",
    "session.completed",
    "attendance.recorded",
    "student.enrolled",
    "student.face_enrolled"
  ],
  "secret": "your-webhook-secret"
}
```

#### Available Events

| Event | Description |
|-------|-------------|
| `session.started` | Attendance session started |
| `session.completed` | Attendance session ended |
| `attendance.recorded` | Individual attendance recorded |
| `student.created` | New student registered |
| `student.enrolled` | Student enrolled in course |
| `student.face_enrolled` | Student face data enrolled |
| `user.created` | New user account created |
| `report.generated` | Report generation completed |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "wh_new789",
    "url": "https://external-system.com/webhooks/sams",
    "events": ["session.started", "session.completed"],
    "status": "active",
    "secret": "wh_sec_***************",
    "createdAt": "2026-02-23T10:30:00Z"
  }
}
```

---

### 11.3 Webhook Payload Format

All webhook payloads follow this structure:

```json
{
  "id": "evt_abc123xyz",
  "event": "session.completed",
  "timestamp": "2026-02-23T10:30:00Z",
  "data": {
    "sessionId": "sess_xyz789",
    "courseId": "crs_abc123",
    "courseCode": "CS201",
    "statistics": {
      "present": 40,
      "late": 3,
      "absent": 2
    }
  }
}
```

#### Webhook Signature Verification

```javascript
// Signature header: X-SAMS-Signature
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}
```

---

### 11.4 Update Webhook

```
PUT /api/v1/webhooks/:id
```

**Authorization:** Required (Admin)

---

### 11.5 Delete Webhook

```
DELETE /api/v1/webhooks/:id
```

**Authorization:** Required (Admin)

---

### 11.6 Test Webhook

```
POST /api/v1/webhooks/:id/test
```

**Authorization:** Required (Admin)

#### Response

```json
{
  "success": true,
  "data": {
    "delivered": true,
    "responseCode": 200,
    "responseTime": 250,
    "response": "OK"
  }
}
```

---

## 12. Error Handling

### 12.1 Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "requestId": "req_abc123xyz",
    "timestamp": "2026-02-23T10:30:00Z"
  }
}
```

### 12.2 HTTP Status Codes

| Status | Name | Description |
|--------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no body |
| 400 | Bad Request | Invalid request format or validation error |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### 12.3 Error Codes

#### Authentication Errors (AUTH_xxx)

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired |
| `AUTH_TOKEN_INVALID` | 401 | Invalid or malformed token |
| `AUTH_MFA_REQUIRED` | 401 | MFA verification required |
| `AUTH_MFA_INVALID` | 401 | Invalid MFA code |
| `AUTH_ACCOUNT_LOCKED` | 403 | Account locked due to failed attempts |
| `AUTH_ACCOUNT_SUSPENDED` | 403 | Account has been suspended |
| `AUTH_SESSION_EXPIRED` | 401 | Session has expired |

#### Validation Errors (VALIDATION_xxx)

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `VALIDATION_REQUIRED_FIELD` | 400 | Required field missing |
| `VALIDATION_INVALID_FORMAT` | 400 | Invalid field format |
| `VALIDATION_INVALID_VALUE` | 400 | Invalid field value |

#### Resource Errors (RESOURCE_xxx)

| Code | Status | Description |
|------|--------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `RESOURCE_ALREADY_EXISTS` | 409 | Resource already exists |
| `RESOURCE_CONFLICT` | 409 | Resource conflict |
| `RESOURCE_DELETED` | 410 | Resource has been deleted |

#### Permission Errors (PERMISSION_xxx)

| Code | Status | Description |
|------|--------|-------------|
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `PERMISSION_ROLE_REQUIRED` | 403 | Higher role required |
| `PERMISSION_OWNERSHIP` | 403 | Not resource owner |

#### Face Recognition Errors (FR_xxx)

| Code | Status | Description |
|------|--------|-------------|
| `FR_NO_FACE_DETECTED` | 422 | No face detected in image |
| `FR_MULTIPLE_FACES` | 422 | Multiple faces in single-face context |
| `FR_LOW_QUALITY` | 422 | Image quality too low |
| `FR_SPOOF_DETECTED` | 403 | Spoofing attempt detected |
| `FR_NO_MATCH` | 404 | No matching face found |
| `FR_ENGINE_UNAVAILABLE` | 503 | FR engine temporarily unavailable |

#### Rate Limit Errors

| Code | Status | Description |
|------|--------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### 12.4 Error Response Examples

#### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": [
        "Must be at least 12 characters",
        "Must contain at least one uppercase letter"
      ],
      "firstName": ["Required field"]
    },
    "requestId": "req_abc123xyz"
  }
}
```

#### Authentication Error

```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "Access token has expired",
    "details": {
      "expiredAt": "2026-02-23T10:15:00Z"
    },
    "requestId": "req_abc123xyz"
  }
}
```

#### Rate Limit Error

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 10,
      "window": "1 minute",
      "retryAfter": 45
    },
    "requestId": "req_abc123xyz"
  }
}
```

---

## 13. Rate Limiting

### 13.1 Rate Limit Configuration

Based on PRD Section 17.1:

| Endpoint Category | Rate Limit | Window | Burst |
|-------------------|------------|--------|-------|
| Authentication | 10 requests | 1 minute | 15 |
| User Management | 100 requests | 1 minute | 150 |
| Attendance Operations | 500 requests | 1 minute | 750 |
| Reporting | 50 requests | 1 minute | 75 |
| File Upload | 20 requests | 1 minute | 30 |
| FR Engine | 1000 requests | 1 minute | 1500 |

### 13.2 Rate Limit Headers

All API responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708682460
X-RateLimit-Window: 60
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |
| `X-RateLimit-Window` | Window duration in seconds |

### 13.3 Rate Limit Response

When rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1708682460
```

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please retry after 45 seconds.",
    "details": {
      "limit": 10,
      "window": 60,
      "retryAfter": 45
    }
  }
}
```

---

## 14. OpenAPI Specification

### 14.1 OpenAPI Document Location

The complete OpenAPI 3.0 specification is available at:

```
GET /api/v1/docs/openapi.json
GET /api/v1/docs/openapi.yaml
```

### 14.2 Interactive Documentation

Swagger UI documentation is available at:

```
GET /api/v1/docs
```

### 14.3 OpenAPI Schema Examples

#### Common Schemas

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - firstName
        - lastName
        - role
      properties:
        id:
          type: string
          format: uuid
          example: "usr_abc123xyz"
        email:
          type: string
          format: email
          example: "john.doe@university.edu"
        firstName:
          type: string
          minLength: 1
          maxLength: 100
          example: "John"
        lastName:
          type: string
          minLength: 1
          maxLength: 100
          example: "Doe"
        role:
          type: string
          enum: [super_admin, admin, lecturer]
          example: "lecturer"
        status:
          type: string
          enum: [active, inactive, suspended, pending]
          example: "active"
        mfaEnabled:
          type: boolean
          example: true
        createdAt:
          type: string
          format: date-time
          example: "2026-02-23T10:30:00Z"

    Student:
      type: object
      required:
        - id
        - studentId
        - firstName
        - lastName
        - email
      properties:
        id:
          type: string
          format: uuid
        studentId:
          type: string
          minLength: 5
          maxLength: 50
          example: "2026CS001"
        firstName:
          type: string
        lastName:
          type: string
        email:
          type: string
          format: email
        departmentId:
          type: string
          format: uuid
        program:
          type: string
        yearOfStudy:
          type: integer
          minimum: 1
          maximum: 6
        faceEnrolled:
          type: boolean
        status:
          type: string
          enum: [active, inactive, graduated, withdrawn]

    AttendanceSession:
      type: object
      properties:
        id:
          type: string
          format: uuid
        courseId:
          type: string
          format: uuid
        lecturerId:
          type: string
          format: uuid
        sessionDate:
          type: string
          format: date
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
        gracePeriod:
          type: integer
          minimum: 0
          maximum: 60
        status:
          type: string
          enum: [active, completed, cancelled]
        statistics:
          $ref: '#/components/schemas/SessionStatistics'

    SessionStatistics:
      type: object
      properties:
        totalStudents:
          type: integer
        present:
          type: integer
        late:
          type: integer
        absent:
          type: integer
        excused:
          type: integer
        attendanceRate:
          type: number
          format: float

    AttendanceRecord:
      type: object
      properties:
        id:
          type: string
          format: uuid
        sessionId:
          type: string
          format: uuid
        studentId:
          type: string
          format: uuid
        status:
          type: string
          enum: [present, late, absent, excused]
        method:
          type: string
          enum: [facial, manual]
        recognizedAt:
          type: string
          format: date-time
        confidenceScore:
          type: number
          format: float
          minimum: 0
          maximum: 1
        isManual:
          type: boolean

    FaceRecognitionResult:
      type: object
      properties:
        faceId:
          type: string
        bbox:
          $ref: '#/components/schemas/BoundingBox'
        recognition:
          type: object
          properties:
            matched:
              type: boolean
            studentId:
              type: string
            confidence:
              type: number
        liveness:
          type: object
          properties:
            isLive:
              type: boolean
            score:
              type: number
        quality:
          type: object
          properties:
            score:
              type: number
            blur:
              type: number
            lighting:
              type: number

    BoundingBox:
      type: object
      properties:
        x:
          type: integer
        y:
          type: integer
        width:
          type: integer
        height:
          type: integer

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
        requestId:
          type: string
        timestamp:
          type: string
          format: date-time

    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
        hasNext:
          type: boolean
        hasPrev:
          type: boolean

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                $ref: '#/components/schemas/Error'

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                $ref: '#/components/schemas/Error'

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                $ref: '#/components/schemas/Error'

    ValidationError:
      description: Validation failed
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                $ref: '#/components/schemas/Error'

    RateLimited:
      description: Rate limit exceeded
      headers:
        Retry-After:
          schema:
            type: integer
        X-RateLimit-Limit:
          schema:
            type: integer
        X-RateLimit-Remaining:
          schema:
            type: integer
        X-RateLimit-Reset:
          schema:
            type: integer
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                $ref: '#/components/schemas/Error'
```

### 14.4 Security Requirements

```yaml
security:
  - bearerAuth: []

paths:
  /auth/login:
    post:
      security: []  # Public endpoint
  
  /auth/refresh:
    post:
      security: []  # Uses refresh token, not bearer

  /users:
    get:
      security:
        - bearerAuth: []
      x-roles: [super_admin, admin]  # Custom extension for RBAC
```

---

## 15. WebSocket API

### 15.1 Connection

Connect to WebSocket for real-time attendance updates:

```
wss://api.sams.university.edu/ws/sessions/:sessionId
```

#### Authentication

Include JWT token in connection:

```javascript
const ws = new WebSocket(
  'wss://api.sams.university.edu/ws/sessions/sess_xyz789',
  ['access_token', jwt_token]
);
```

### 15.2 Message Types

#### Server -> Client

**Recognition Event**
```json
{
  "type": "recognition",
  "data": {
    "studentId": "stu_xyz789",
    "studentName": "Alice Johnson",
    "status": "present",
    "confidence": 0.96,
    "timestamp": "2026-02-23T09:05:23Z"
  }
}
```

**Unknown Face Alert**
```json
{
  "type": "unknown_face",
  "data": {
    "faceId": "temp_face_001",
    "bbox": { "x": 120, "y": 85, "width": 180, "height": 220 },
    "timestamp": "2026-02-23T09:10:00Z"
  }
}
```

**Statistics Update**
```json
{
  "type": "stats_update",
  "data": {
    "present": 25,
    "late": 3,
    "absent": 17,
    "total": 45,
    "attendanceRate": 62.2
  }
}
```

**Session Ended**
```json
{
  "type": "session_ended",
  "data": {
    "sessionId": "sess_xyz789",
    "finalStats": {
      "present": 40,
      "late": 3,
      "absent": 2
    }
  }
}
```

#### Client -> Server

**Frame Data (Binary)**
```javascript
// Send video frame for processing
ws.send(frameBlob);
```

**Control Message**
```json
{
  "type": "control",
  "action": "pause_recognition"
}
```

---

## 16. API Implementation Order

Based on the project Plan.md, APIs should be implemented in the following order:

| Phase | Sprint | Service | Endpoints | Dependencies |
|-------|--------|---------|-----------|--------------|
| 1 | 3-4 | Auth | login, logout, refresh, mfa | Database |
| 1 | 3-4 | Users | CRUD, profile, roles | Auth |
| 1 | 5-6 | FR Engine | detect, recognize, embed | Models |
| 2 | 8-9 | Students | CRUD, enrollment, face | Users, FR |
| 2 | 10-11 | Courses | CRUD, schedule, roster | Users |
| 2 | 10-11 | Attendance | sessions, records, manual | All above |
| 2 | 12-13 | Reports | generate, export, schedule | Attendance |
| 2 | 14 | Integration | LMS, SIS, notifications | All above |

---

## Appendix A: TypeScript Type Definitions

```typescript
// src/types/api.types.ts

// Base Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ResponseMeta;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    requestId: string;
    timestamp: string;
  };
}

interface ResponseMeta {
  timestamp?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// User Types
type UserRole = 'super_admin' | 'admin' | 'lecturer';
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId: string;
  departmentId: string;
  phone?: string;
  status: UserStatus;
  mfaEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId: string;
  phone?: string;
  sendInvite?: boolean;
}

// Student Types
type StudentStatus = 'active' | 'inactive' | 'graduated' | 'withdrawn';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  institutionId: string;
  departmentId: string;
  program: string;
  yearOfStudy: number;
  enrollmentDate: string;
  status: StudentStatus;
  faceEnrolled: boolean;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

// Attendance Types
type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
type SessionStatus = 'active' | 'completed' | 'cancelled';

interface AttendanceSession {
  id: string;
  courseId: string;
  lecturerId: string;
  scheduleId?: string;
  roomId?: string;
  sessionDate: string;
  startTime: string;
  endTime?: string;
  gracePeriod: number;
  status: SessionStatus;
  settings: SessionSettings;
  statistics?: SessionStatistics;
  createdAt: string;
}

interface SessionSettings {
  recognitionMode: 'continuous' | 'on_demand';
  alertUnknown: boolean;
  duplicateCheck: boolean;
}

interface SessionStatistics {
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}

interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  method: 'facial' | 'manual';
  recognizedAt?: string;
  confidenceScore?: number;
  isManual: boolean;
  manualBy?: string;
  manualReason?: string;
  createdAt: string;
}

// Face Recognition Types
interface FaceRecognitionRequest {
  sessionId: string;
  image: string;
  metadata?: {
    frameNumber?: number;
    timestamp?: string;
    cameraId?: string;
  };
}

interface FaceRecognitionResult {
  requestId: string;
  processingTime: number;
  faces: DetectedFace[];
  statistics: {
    facesDetected: number;
    facesMatched: number;
    facesUnknown: number;
    spoofAttempts: number;
  };
}

interface DetectedFace {
  faceId: string;
  bbox: BoundingBox;
  recognition: {
    matched: boolean;
    student?: {
      id: string;
      studentId: string;
      name: string;
    };
    confidence: number;
    alreadyRecorded?: boolean;
  };
  liveness: {
    isLive: boolean;
    score: number;
  };
  quality: {
    score: number;
    blur: number;
    lighting: number;
    pose?: number;
  };
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

## Appendix B: Postman Collection

A complete Postman collection is available for API testing:

```
GET /api/v1/docs/postman.json
```

### Environment Variables

```json
{
  "baseUrl": "https://api.sams.university.edu/api/v1",
  "accessToken": "{{auto-generated}}",
  "refreshToken": "{{auto-generated}}",
  "testUserId": "",
  "testStudentId": "",
  "testCourseId": "",
  "testSessionId": ""
}
```

---

## Appendix C: SDK Examples

### JavaScript/TypeScript

```typescript
import { SAMSClient } from '@sams/sdk';

const client = new SAMSClient({
  baseUrl: 'https://api.sams.university.edu/api/v1',
  apiKey: 'your-api-key'
});

// Login
const { tokens, user } = await client.auth.login({
  email: 'lecturer@university.edu',
  password: 'password123'
});

// Start attendance session
const session = await client.attendance.startSession({
  courseId: 'crs_abc123',
  gracePeriod: 15
});

// Connect to WebSocket for real-time updates
client.attendance.connect(session.id, {
  onRecognition: (result) => {
    console.log(`Student ${result.studentName} marked as ${result.status}`);
  },
  onUnknownFace: (face) => {
    console.log('Unknown face detected', face);
  }
});
```

### Python

```python
from sams_sdk import SAMSClient

client = SAMSClient(
    base_url='https://api.sams.university.edu/api/v1',
    api_key='your-api-key'
)

# Login
auth = client.auth.login(
    email='lecturer@university.edu',
    password='password123'
)

# Get students
students = client.students.list(
    department_id='dept_xyz789',
    face_enrolled=True
)

# Process face recognition
result = client.fr.recognize(
    session_id='sess_xyz789',
    image=base64_image_data
)
```

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 23, 2026 | SAMS Development Team | Initial version |

---

*This API design document is confidential and intended for internal development use. All endpoints, schemas, and specifications are subject to change during development.*