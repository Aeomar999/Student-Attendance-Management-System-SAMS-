# SAMS - Smart Attendance Management System
## User Manual & Walkthrough

This document provides a comprehensive guide on how to use the Smart Attendance Management System (SAMS).

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Authentication](#2-authentication)
3. [Dashboard Overview](#3-dashboard-overview)
4. [User Management](#4-user-management)
5. [Student Management](#5-student-management)
6. [Course Management](#6-course-management)
7. [Attendance Tracking](#7-attendance-tracking)
8. [Schedule Management](#8-schedule-management)
9. [Department Management](#9-department-management)
10. [Room Management](#10-room-management)
11. [Reports & Analytics](#11-reports--analytics)
12. [Audit Logs](#12-audit-logs)
13. [Settings & Security](#13-settings--security)
14. [Bulk Import](#14-bulk-import)

---

## 1. Getting Started

### Accessing the System

1. Open your browser and navigate to: `http://localhost:3000`
2. You will be redirected to the login page if not authenticated

### First Time Setup (Super Admin)

If you're setting up the system for the first time:

1. The super admin account is created using: `npx tsx create-admin.ts`
2. Default credentials:
   - **Email**: `admin@sams.edu`
   - **Password**: `Password123!`
3. After login, you'll be redirected to the dashboard

---

## 2. Authentication

### Login

1. Enter your **email** and **password**
2. Click **Continue**
3. If MFA is enabled, enter the 6-digit code from your authenticator app

### Forgot Password

1. Click "Forgot your password?" on the login page
2. Enter your email address
3. Check your email for the reset link
4. Click the link and set a new password

### Account Setup (Magic Link)

If you're a new user created by an admin:

1. Check your email for the setup link
2. Click the link (or copy it to your browser)
3. You'll be directed to the setup page
4. Enter and confirm your password
5. Click "Complete Setup"
6. Redirects to login - use your email and new password

### Roles & Permissions

| Feature | SUPER_ADMIN | ADMIN | LECTURER |
|---------|-------------|-------|-----------|
| Dashboard | ✓ | ✓ | ✓ |
| View Students | ✓ | ✓ | ✓ |
| Manage Students | ✓ | ✓ | ✗ |
| View Courses | ✓ | ✓ | ✓ |
| Manage Courses | ✓ | ✓ | ✗ |
| Take Attendance | ✓ | ✓ | ✓ |
| View Reports | ✓ | ✓ | ✓ |
| Manage Users | ✓ | ✓ | ✗ |
| Manage Departments | ✓ | ✓ | ✗ |
| Manage Rooms | ✓ | ✓ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ |
| System Settings | ✓ | ✗ | ✗ |

---

## 3. Dashboard Overview

The dashboard provides an at-a-glance view of your institution:

### Statistics Cards
- **Total Staff/Lecturers**: Number of registered staff
- **Enrolled Students**: Total students in database
- **Attendance Sessions**: Sessions recorded across all terms
- **FR Health Status**: Facial recognition service status

### Recent Activity
- Shows recent system events and actions

### Upcoming Classes
- Displays scheduled classes for the day

---

## 4. User Management

**Path**: `/dashboard/users` (Admin only)

### Viewing Users

1. Navigate to **User Management** in the sidebar
2. View all users in a table with columns:
   - Name, Email, Role, Status, MFA, Created Date

### Creating a New User

1. Click **Add User** button
2. Fill in the form:
   - **First Name**: Enter first name
   - **Last Name**: Enter last name
   - **Email**: Enter email address
   - **Role**: Select (ADMIN, LECTURER)
   - **Department**: Select department (optional)
3. Click **Create**
4. A setup link will be generated (shown in console for development)
5. Send the link to the user via email

### Editing a User

1. Click the **Edit icon** next to a user
2. Modify the fields as needed
3. Click **Update**

### Managing User Status

- **Activate**: Click to activate a suspended user
- **Suspend**: Click to suspend an active user
- **Delete**: Click to delete a user (cannot delete yourself)

### Password Management

1. Click on a user row to view details
2. Options available:
   - **Send Password Reset**: Generates a reset link
   - **Reset Password**: Admin sets password directly

---

## 5. Student Management

**Path**: `/dashboard/students`

### Viewing Students

1. Navigate to **Students** in the sidebar
2. View all students in a searchable, sortable table
3. Columns: Student ID, Name, Email, Program, Year, Face Enrolled, Status

### Adding a Student Manually

1. Click **Add Student** button
2. Fill in the form:
   - **Student ID**: Unique identifier (e.g., STU001)
   - **First Name**: Student first name
   - **Last Name**: Student last name
   - **Email**: Student email
   - **Program**: Academic program (e.g., Computer Science)
   - **Year of Study**: 1-6
   - **Department**: Select department
3. Click **Create**

### Face Enrollment

To enable facial recognition attendance:

1. Click the **Camera icon** next to a student
2. Grant camera permissions if prompted
3. Position your face in the frame
4. Click **Capture** to take a reference photo
5. Click **Enroll** to save the face data
6. Status changes to "Face Enrolled"

### Editing a Student

1. Click the **Edit icon** next to a student
2. Modify fields as needed
3. Click **Update**

### Deleting a Student

1. Click the **Trash icon** next to a student
2. Confirm deletion in the dialog

---

## 6. Course Management

**Path**: `/dashboard/courses`

### Viewing Courses

1. Navigate to **Courses** in the sidebar
2. View all courses in a table
3. Columns: Code, Name, Lecturer, Students, Status, Created

### Creating a Course

1. Click **Add Course** button
2. Fill in the form:
   - **Course Code**: Unique code (e.g., CS101)
   - **Course Name**: Full name
   - **Description**: Optional description
   - **Department**: Select department
   - **Institution**: Select institution
   - **Lecturer**: Assign lecturer (optional)
   - **Credit Hours**: Number of credits
   - **Capacity**: Maximum students
   - **Semester**: e.g., Fall 2026
3. Click **Create**

### Managing Course Enrollment

1. Click on a course row
2. Navigate to the **Enrollment** tab
3. View enrolled students
4. **Enroll Students**: Click to add students
5. **Unenroll**: Click to remove a student

### Editing a Course

1. Click the **Edit icon** next to a course
2. Modify fields as needed
3. Click **Update**

---

## 7. Attendance Tracking

**Path**: `/dashboard/attendance`

### Starting an Attendance Session

1. Navigate to **Attendance** in the sidebar
2. Click **New Session** button
3. Fill in the session details:
   - **Course**: Select the course
   - **Date**: Select session date
   - **Start Time**: Session start time
   - **End Time**: Session end time
   - **Grace Period**: Minutes allowed for late (default: 15)
4. Click **Start Session**

### Taking Attendance

#### Manual Mode
1. View enrolled students in the session
2. Click **Present** or **Absent** next to each student
3. Status updates in real-time

#### Face Recognition Mode
1. Ensure FR service is configured
2. Click **Start Face Recognition**
3. Students scan their faces to mark attendance
4. System automatically marks present/absent

### Viewing Session Details

1. Click on a session row
2. View:
   - Session information
   - Attendance statistics (Present/Absent counts)
   - Detailed attendance list

### Manual Attendance Override

1. In session details, find a student
2. Click on their status
3. Change from Present to Absent or vice versa

---

## 8. Schedule Management

**Path**: `/dashboard/schedule`

### Viewing Schedules

1. Navigate to **Schedule** in the sidebar
2. View weekly timetable
3. Filter by:
   - Day of week
   - Course
   - Room

### Creating a Schedule

1. Click **Add Schedule** button
2. Fill in:
   - **Course**: Select course
   - **Day**: Day of week
   - **Start Time**: Class start time
   - **End Time**: Class end time
   - **Room**: Physical room (optional)
3. Click **Create**

---

## 9. Department Management

**Path**: `/dashboard/departments` (Admin only)

### Viewing Departments

1. Navigate to **Departments** in the sidebar
2. View departments with:
   - Code, Name, Description
   - User count, Student count, Course count

### Creating a Department

1. Click **Add Department** button
2. Fill in:
   - **Department Code**: Unique code (e.g., CS, ENG)
   - **Department Name**: Full name
   - **Description**: Optional description
3. Click **Create**

### Editing/Deleting

- **Edit**: Click the edit icon to modify
- **Delete**: Click trash icon (only if no users/students/courses)

---

## 10. Room Management

**Path**: `/dashboard/rooms` (Admin only)

### Viewing Rooms

1. Navigate to **Rooms** in the sidebar
2. View rooms with:
   - Name, Building, Capacity
   - Schedule count

### Creating a Room

1. Click **Add Room** button
2. Fill in:
   - **Room Name/Number**: e.g., Room 101
   - **Building**: Building name
   - **Capacity**: Maximum capacity
   - **Description**: Optional
3. Click **Create**

### Editing/Deleting

- **Edit**: Modify room details
- **Delete**: Remove room (only if no schedules)

---

## 11. Reports & Analytics

**Path**: `/dashboard/reports`

### Available Reports

1. **Attendance Summary**: Overview of attendance by course/date
2. **Student Attendance**: Individual student attendance history
3. **Course Statistics**: Per-course attendance rates
4. **Export Options**: Export reports as needed

### Generating a Report

1. Select report type
2. Choose filters:
   - Date range
   - Course
   - Student/Group
3. Click **Generate**
4. View results in table/chart format
5. Export if needed

---

## 12. Audit Logs

**Path**: `/dashboard/audit-logs` (Admin only)

### Viewing Audit Logs

1. Navigate to **Audit Logs** in the sidebar
2. View all system actions with:
   - **Timestamp**: When the action occurred
   - **Actor**: Who performed the action
   - **Action**: Type of action (CREATE, UPDATE, DELETE, LOGIN, etc.)
   - **Entity**: What was affected
   - **Details**: Additional information

### Filtering Logs

1. **Search**: Enter user name or entity ID
2. **Action Filter**: Select specific action types
3. **Pagination**: Navigate through log pages

### Logged Actions

- User login/logout
- Student creation/update/deletion
- Course management
- Attendance sessions
- Settings changes
- And more...

---

## 13. Settings & Security

**Path**: `/dashboard/settings`

### Profile Settings

1. Navigate to **Settings**
2. **Personal Information**: Update name
3. **Change Password**: Update your password
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click **Update Password**

### Security Settings

#### Enabling MFA (Two-Factor Authentication)

1. Scroll to **Two-Factor Authentication** section
2. Click **Enable MFA**
3. A QR code appears
4. Scan with your authenticator app (Google Authenticator, Authy, etc.)
5. Enter the 6-digit code from your app
6. Click **Verify & Enable**
7. Save backup codes if provided

#### Disabling MFA

1. Click **Disable MFA**
2. Enter your password
3. Confirm disabling

### Account Security Features

- **Failed Attempts**: Account locks after 5 failed logins
- **Lockout Duration**: Progressive (15min, 30min, 60min...)
- **MFA**: Adds extra layer of security

---

## 14. Bulk Import

### CSV Student Import

**Path**: `/dashboard/students`

#### Preparing Your CSV File

Required columns:
| Column | Description | Example |
|--------|-------------|---------|
| studentId | Unique student ID | STU001 |
| firstName | First name | John |
| lastName | Last name | Doe |
| email | Email address | john@example.com |
| program | Academic program | Computer Science |
| yearOfStudy | Year (1-6) | 1 |

#### Sample CSV:
```csv
studentId,firstName,lastName,email,program,yearOfStudy
STU001,John,Doe,john.doe@example.com,Computer Science,1
STU002,Jane,Smith,jane.smith@example.com,Engineering,2
```

#### Importing

1. Navigate to **Students**
2. Click **CSV Format** to view requirements
3. Click **Import CSV**
4. Select your CSV file
5. Wait for import to complete
6. View results:
   - Successfully imported count
   - Failed records (if any)

---

## Troubleshooting

### Login Issues

- **Wrong password**: Use "Forgot Password" or contact admin
- **Account locked**: Wait for lockout duration or contact admin
- **MFA issues**: Verify time sync on your device

### Import Errors

- **Missing columns**: Ensure all required headers exist
- **Duplicate email**: Students with existing emails will fail
- **Invalid data**: Check data types (yearOfStudy must be number)

### Attendance Issues

- **Face not recognized**: Ensure good lighting, face enrollment complete
- **Session not showing**: Check course enrollment

---

## Support

For additional help:
- Contact your system administrator
- Check audit logs for error details
- Review system documentation
