# Product Requirements Document (PRD)
# Smart Attendance Management System (SAMS)
## Facial Recognition-Based University Attendance Solution

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Status:** Draft  
**Classification:** Confidential  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [User Roles and Permissions](#3-user-roles-and-permissions)
4. [Authentication and Security](#4-authentication-and-security)
5. [Facial Recognition System](#5-facial-recognition-system)
6. [System Architecture](#6-system-architecture)
7. [User Interface Design](#7-user-interface-design)
8. [Database Design](#8-database-design)
9. [Integration Capabilities](#9-integration-capabilities)
10. [Performance Requirements](#10-performance-requirements)
11. [Error Handling and Recovery](#11-error-handling-and-recovery)
12. [Reporting and Analytics](#12-reporting-and-analytics)
13. [Mobile and Cross-Platform Requirements](#13-mobile-and-cross-platform-requirements)
14. [Security and Compliance](#14-security-and-compliance)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

### 1.1 Purpose

The Smart Attendance Management System (SAMS) is an innovative, AI-powered attendance tracking solution designed specifically for university environments. By leveraging cutting-edge facial recognition technology, SAMS automates the traditionally manual and time-consuming process of recording student attendance, while providing robust security measures and comprehensive analytics capabilities.

### 1.2 Business Objectives

| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| Automation | Eliminate manual attendance taking | 95% reduction in manual processes |
| Accuracy | Improve attendance record accuracy | 99.5% accuracy rate |
| Efficiency | Reduce time spent on attendance | 80% time savings per session |
| Security | Prevent attendance fraud | Zero successful spoofing attempts |
| Compliance | Meet data privacy regulations | 100% GDPR/FERPA compliance |

### 1.3 Target Users

- **Primary Users:** University Administrators, Lecturers/Professors
- **Secondary Stakeholders:** IT Department, University Management, Students (data subjects)

### 1.4 Key Features Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAMS CORE FEATURES                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Facial     │  │   Role-Based │  │   Real-Time  │          │
│  │ Recognition  │  │    Access    │  │   Analytics  │          │
│  │   Engine     │  │   Control    │  │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    MFA       │  │   Anti-      │  │  University  │          │
│  │Authentication│  │  Spoofing    │  │ Integration  │          │
│  │   System     │  │   Measures   │  │     APIs     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Overview

### 2.1 Problem Statement

Traditional attendance management in universities faces several critical challenges:

1. **Time Inefficiency:** Manual roll calls consume 5-10 minutes per class session
2. **Inaccuracy:** Human error in recording leads to approximately 3-5% error rate
3. **Fraud Vulnerability:** Proxy attendance is a widespread issue
4. **Data Management:** Paper-based systems create storage and retrieval challenges
5. **Reporting Delays:** Manual compilation delays analytics and intervention
6. **Scalability Issues:** Large classes make individual verification impractical

### 2.2 Proposed Solution

SAMS addresses these challenges through:

```
┌─────────────────────────────────────────────────────────────────┐
│                      SOLUTION ARCHITECTURE                       │
│                                                                  │
│    ┌─────────────┐         ┌─────────────┐                      │
│    │   Student   │         │   Camera    │                      │
│    │   Entry     │────────▶│   Capture   │                      │
│    └─────────────┘         └──────┬──────┘                      │
│                                   │                              │
│                                   ▼                              │
│                          ┌───────────────┐                      │
│                          │    Facial     │                      │
│                          │  Recognition  │                      │
│                          │    Engine     │                      │
│                          └───────┬───────┘                      │
│                                  │                               │
│              ┌───────────────────┼───────────────────┐          │
│              ▼                   ▼                   ▼          │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│    │   Liveness  │     │   Face      │     │   Anti-     │     │
│    │   Check     │     │   Matching  │     │   Spoofing  │     │
│    └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     │
│           │                   │                   │             │
│           └───────────────────┼───────────────────┘             │
│                               ▼                                  │
│                     ┌─────────────────┐                         │
│                     │   Attendance    │                         │
│                     │    Recorded     │                         │
│                     └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Scope Definition

#### 2.3.1 In Scope

| Category | Features |
|----------|----------|
| Authentication | MFA, SSO, Session Management, Password Policies |
| Facial Recognition | Real-time detection, Batch processing, Anti-spoofing |
| User Management | Role-based access, Profile management, Audit logs |
| Attendance | Real-time tracking, Manual override, Batch uploads |
| Reporting | Dashboards, Custom reports, Export capabilities |
| Integration | LMS, SIS, Email systems, Calendar sync |

#### 2.3.2 Out of Scope

- Student self-service portal (Phase 2)
- Mobile app for students (Phase 2)
- Voice recognition capabilities
- Behavioral biometrics
- Physical access control integration

### 2.4 Project Timeline

```
Phase 1 (Months 1-3)    Phase 2 (Months 4-6)    Phase 3 (Months 7-9)
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Core Platform   │    │ Advanced        │    │ Enterprise      │
│ Development     │───▶│ Features        │───▶│ Deployment      │
│                 │    │                 │    │                 │
│ • Auth System   │    │ • Analytics     │    │ • Full Rollout  │
│ • Face Recog    │    │ • Integrations  │    │ • Training      │
│ • Basic UI      │    │ • Mobile Web    │    │ • Support       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 3. User Roles and Permissions

### 3.1 Role Hierarchy

```
                    ┌─────────────────┐
                    │  SUPER ADMIN    │
                    │  (System Level) │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────┴─────────┐       ┌──────────┴──────────┐
    │   ADMINISTRATOR   │       │      LECTURER       │
    │ (Institution Level)│       │  (Department Level) │
    └───────────────────┘       └─────────────────────┘
```

### 3.2 Detailed Role Specifications

#### 3.2.1 Super Administrator

**Description:** System-level administrator with complete access to all features and configurations across all institutions (for multi-tenant deployments).

| Permission Category | Access Level | Description |
|--------------------|--------------|-------------|
| System Configuration | Full | Configure system-wide settings, security policies |
| User Management | Full | Create/modify/delete all user accounts |
| Institution Management | Full | Manage multiple institutions/campuses |
| Facial Recognition Settings | Full | Configure FR engine parameters |
| Database Management | Full | Backup, restore, data migration |
| Audit Logs | Full | View and export all system logs |
| API Management | Full | Configure integrations, manage API keys |
| Reporting | Full | Access all reports across institutions |

#### 3.2.2 Administrator

**Description:** Institution-level administrator responsible for managing the SAMS deployment within their university or campus.

| Permission Category | Access Level | Description |
|--------------------|--------------|-------------|
| User Management | Limited | Create/modify lecturer accounts within institution |
| Student Enrollment | Full | Register students, upload facial data |
| Course Management | Full | Create courses, assign lecturers |
| Attendance Records | Full | View, modify, export attendance data |
| Reports & Analytics | Full | Generate and access all institutional reports |
| System Settings | Limited | Configure institution-specific settings |
| Audit Logs | Limited | View institution-level audit logs |
| Integration Config | Limited | Configure LMS/SIS integrations |

**Specific Capabilities:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   ADMINISTRATOR CAPABILITIES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER MANAGEMENT          │  STUDENT ENROLLMENT                 │
│  ├─ Create Lecturers      │  ├─ Bulk Student Import             │
│  ├─ Modify Profiles       │  ├─ Facial Data Collection          │
│  ├─ Reset Passwords       │  ├─ Student Profile Management      │
│  ├─ Suspend Accounts      │  └─ Department Assignment           │
│  └─ View Activity Logs    │                                     │
│                           │                                     │
│  COURSE MANAGEMENT        │  REPORTING                          │
│  ├─ Create Courses        │  ├─ Attendance Reports              │
│  ├─ Schedule Classes      │  ├─ Trend Analysis                  │
│  ├─ Assign Lecturers      │  ├─ Exception Reports               │
│  ├─ Define Rooms          │  ├─ Compliance Reports              │
│  └─ Set Attendance Rules  │  └─ Custom Report Builder           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.3 Lecturer

**Description:** Teaching staff member who uses the system to manage attendance for their assigned courses.

| Permission Category | Access Level | Description |
|--------------------|--------------|-------------|
| Attendance Taking | Full | Initiate facial recognition sessions |
| Manual Override | Limited | Mark attendance manually with justification |
| View Students | Limited | View enrolled students in assigned courses |
| Reports | Limited | View attendance reports for own courses |
| Profile Management | Limited | Update own profile information |
| Class Management | Limited | Manage class schedules within assigned courses |

**Specific Capabilities:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    LECTURER CAPABILITIES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ATTENDANCE MANAGEMENT     │  CLASS OPERATIONS                  │
│  ├─ Start FR Session       │  ├─ View Class Roster              │
│  ├─ Stop FR Session        │  ├─ Schedule Modifications         │
│  ├─ Manual Attendance      │  ├─ Room Change Requests           │
│  ├─ Late Marking           │  └─ Cancel Class Sessions          │
│  └─ Absence Justification  │                                    │
│                            │                                     │
│  REPORTING                 │  COMMUNICATION                     │
│  ├─ View Course Reports    │  ├─ Attendance Notifications       │
│  ├─ Export Attendance      │  ├─ Low Attendance Alerts          │
│  ├─ Student Statistics     │  └─ Admin Communication            │
│  └─ Session History        │                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Permission Matrix

| Feature/Action | Super Admin | Administrator | Lecturer |
|---------------|-------------|---------------|----------|
| System Configuration | ✅ Full | ❌ None | ❌ None |
| Create Admin Accounts | ✅ Full | ❌ None | ❌ None |
| Create Lecturer Accounts | ✅ Full | ✅ Full | ❌ None |
| Enroll Students | ✅ Full | ✅ Full | ❌ None |
| Collect Facial Data | ✅ Full | ✅ Full | ❌ None |
| Create Courses | ✅ Full | ✅ Full | ❌ None |
| Assign Lecturers to Courses | ✅ Full | ✅ Full | ❌ None |
| Start Attendance Session | ✅ Full | ✅ Full | ✅ Own Courses |
| Manual Attendance Override | ✅ Full | ✅ Full | ✅ Own Courses |
| View Attendance Records | ✅ Full | ✅ Institution | ✅ Own Courses |
| Modify Attendance Records | ✅ Full | ✅ Institution | ⚠️ Limited |
| Delete Attendance Records | ✅ Full | ⚠️ With Approval | ❌ None |
| Generate Reports | ✅ Full | ✅ Institution | ✅ Own Courses |
| Export Data | ✅ Full | ✅ Institution | ✅ Own Courses |
| Configure Integrations | ✅ Full | ✅ Limited | ❌ None |
| View Audit Logs | ✅ Full | ✅ Institution | ✅ Own Actions |
| Manage API Keys | ✅ Full | ⚠️ Limited | ❌ None |
| Backup/Restore | ✅ Full | ❌ None | ❌ None |

**Legend:** ✅ Full Access | ⚠️ Limited/Conditional | ❌ No Access

### 3.4 Role Assignment Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                  ROLE ASSIGNMENT PROCESS                         │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │   Request   │     │  Approval   │     │  Account    │
  │  Submitted  │────▶│   Process   │────▶│  Creation   │
  └─────────────┘     └─────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                      ┌─────────────────────────────────────┐
                      │        VERIFICATION STEPS           │
                      ├─────────────────────────────────────┤
                      │ 1. Identity Verification            │
                      │ 2. Employment Confirmation          │
                      │ 3. Department Authorization         │
                      │ 4. Role Approval by Admin           │
                      │ 5. MFA Setup Completion             │
                      └─────────────────────────────────────┘
                                                 │
                                                 ▼
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │   Access    │     │   Initial   │     │  Account    │
  │   Granted   │◀────│   Login     │◀────│   Active    │
  └─────────────┘     └─────────────┘     └─────────────┘
```

---

## 4. Authentication and Security

### 4.1 Authentication Overview

SAMS implements a comprehensive, multi-layered authentication system designed to ensure secure access while maintaining usability for authorized personnel.

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Primary Authentication                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Username/Email + Password                               │   │
│  │  OR                                                      │   │
│  │  SSO via University Identity Provider                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  Layer 2: Multi-Factor Authentication (MFA)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TOTP (Authenticator App)                                │   │
│  │  OR                                                      │   │
│  │  SMS/Email OTP                                           │   │
│  │  OR                                                      │   │
│  │  Hardware Security Key (FIDO2/WebAuthn)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  Layer 3: Session Management                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  JWT Token Generation                                    │   │
│  │  Device Fingerprinting                                   │   │
│  │  Continuous Session Validation                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Primary Authentication Methods

#### 4.2.1 Username/Password Authentication

**Password Requirements:**

| Requirement | Specification |
|-------------|---------------|
| Minimum Length | 12 characters |
| Maximum Length | 128 characters |
| Uppercase Letters | At least 1 required |
| Lowercase Letters | At least 1 required |
| Numeric Characters | At least 1 required |
| Special Characters | At least 1 required (!@#$%^&*()_+-=) |
| Password History | Last 12 passwords cannot be reused |
| Maximum Age | 90 days |
| Minimum Age | 1 day |
| Complexity Score | Must pass zxcvbn score of 3+ |

**Password Security Measures:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   PASSWORD SECURITY FLOW                         │
└─────────────────────────────────────────────────────────────────┘

  User Input          Validation           Storage
  ──────────         ──────────          ─────────
  
  Password ─────▶ ┌─────────────┐    ┌─────────────┐
                  │  Length &   │    │   Argon2id  │
                  │  Complexity │───▶│   Hashing   │
                  │   Check     │    │             │
                  └─────────────┘    └──────┬──────┘
                         │                  │
                         ▼                  ▼
                  ┌─────────────┐    ┌─────────────┐
                  │  Breached   │    │   Salted    │
                  │  Password   │    │   Hash      │
                  │   Check     │    │   Storage   │
                  └─────────────┘    └─────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Dictionary │
                  │   Attack    │
                  │   Check     │
                  └─────────────┘
```

#### 4.2.2 Single Sign-On (SSO) Integration

**Supported Protocols:**

| Protocol | Description | Use Case |
|----------|-------------|----------|
| SAML 2.0 | Security Assertion Markup Language | Enterprise IdP integration |
| OAuth 2.0 | Open Authorization | Third-party service integration |
| OpenID Connect | Identity layer on OAuth 2.0 | Modern authentication flows |
| LDAP/AD | Lightweight Directory Access Protocol | On-premise directory services |

**SSO Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      SSO AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

  ┌──────┐        ┌──────┐        ┌──────┐        ┌──────┐
  │ User │        │ SAMS │        │ IdP  │        │ SAMS │
  │      │        │      │        │      │        │ API  │
  └──┬───┘        └──┬───┘        └──┬───┘        └──┬───┘
     │               │               │               │
     │ Access SAMS   │               │               │
     │──────────────▶│               │               │
     │               │               │               │
     │               │ SAML Request  │               │
     │               │──────────────▶│               │
     │               │               │               │
     │     Redirect to IdP Login     │               │
     │◀──────────────────────────────│               │
     │               │               │               │
     │ Enter Credentials             │               │
     │──────────────────────────────▶│               │
     │               │               │               │
     │               │ SAML Response │               │
     │               │◀──────────────│               │
     │               │               │               │
     │               │ Validate &    │               │
     │               │ Create Session│               │
     │               │──────────────────────────────▶│
     │               │               │               │
     │   Access Granted + JWT Token  │               │
     │◀──────────────────────────────────────────────│
     │               │               │               │
```

### 4.3 Multi-Factor Authentication (MFA)

#### 4.3.1 MFA Methods

**Tier 1 - Standard Methods:**

| Method | Security Level | User Experience | Recovery Option |
|--------|---------------|-----------------|-----------------|
| TOTP (Google/Microsoft Authenticator) | High | Good | Backup codes |
| SMS OTP | Medium | Excellent | Email fallback |
| Email OTP | Medium | Good | Admin reset |

**Tier 2 - Advanced Methods:**

| Method | Security Level | User Experience | Recovery Option |
|--------|---------------|-----------------|-----------------|
| Hardware Security Key (YubiKey) | Very High | Good | Backup key |
| Biometric (Device-based) | High | Excellent | Fallback to TOTP |
| Push Notification | High | Excellent | SMS fallback |

#### 4.3.2 MFA Configuration by Role

| Role | MFA Requirement | Allowed Methods |
|------|-----------------|-----------------|
| Super Administrator | Mandatory | Hardware Key (Primary), TOTP (Backup) |
| Administrator | Mandatory | TOTP, Hardware Key, Push Notification |
| Lecturer | Mandatory | All methods allowed |

#### 4.3.3 MFA Enrollment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MFA ENROLLMENT PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │ First Login │
  │  Detected   │
  └──────┬──────┘
         │
         ▼
  ┌─────────────────────────────────────────────┐
  │         MFA Method Selection Screen          │
  │  ┌─────────────────────────────────────┐    │
  │  │  Select your preferred MFA method:  │    │
  │  │                                     │    │
  │  │  ○ Authenticator App (Recommended)  │    │
  │  │  ○ SMS Verification                 │    │
  │  │  ○ Email Verification               │    │
  │  │  ○ Hardware Security Key            │    │
  │  └─────────────────────────────────────┘    │
  └──────────────────┬──────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  ┌─────────────┐         ┌─────────────┐
  │    TOTP     │         │   SMS/Email │
  │   Setup     │         │    Setup    │
  └──────┬──────┘         └──────┬──────┘
         │                       │
         ▼                       ▼
  ┌─────────────┐         ┌─────────────┐
  │ Scan QR Code│         │ Enter Phone/│
  │ with App    │         │ Verify Email│
  └──────┬──────┘         └──────┬──────┘
         │                       │
         └───────────┬───────────┘
                     ▼
  ┌─────────────────────────────────────────────┐
  │         Verification Step                    │
  │  Enter the 6-digit code: [______]           │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │         Backup Codes Generation              │
  │  ┌─────────────────────────────────────┐    │
  │  │  Save these backup codes securely:  │    │
  │  │                                     │    │
  │  │  1. XXXX-XXXX-XXXX                  │    │
  │  │  2. XXXX-XXXX-XXXX                  │    │
  │  │  3. XXXX-XXXX-XXXX                  │    │
  │  │  ...                                │    │
  │  └─────────────────────────────────────┘    │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │         MFA Setup Complete                   │
  │         Redirecting to Dashboard...          │
  └─────────────────────────────────────────────┘
```

### 4.4 Session Management

#### 4.4.1 JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-identifier"
  },
  "payload": {
    "sub": "user-uuid",
    "iss": "sams.university.edu",
    "aud": "sams-api",
    "exp": 1708732800,
    "iat": 1708729200,
    "nbf": 1708729200,
    "jti": "unique-token-id",
    "role": "lecturer",
    "permissions": ["attendance:read", "attendance:write"],
    "institution_id": "inst-uuid",
    "department_id": "dept-uuid",
    "session_id": "session-uuid",
    "device_fingerprint": "device-hash"
  }
}
```

#### 4.4.2 Session Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Access Token Lifetime | 15 minutes | Short-lived for security |
| Refresh Token Lifetime | 7 days | Extended session capability |
| Idle Timeout | 30 minutes | Auto-logout on inactivity |
| Absolute Timeout | 12 hours | Maximum session duration |
| Concurrent Sessions | 3 devices | Per user limit |
| Token Refresh Window | 5 minutes before expiry | Automatic refresh trigger |

#### 4.4.3 Session Security Features

```
┌─────────────────────────────────────────────────────────────────┐
│                   SESSION SECURITY MEASURES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DEVICE FINGERPRINTING                                   │   │
│  │  ├─ Browser/OS Information                               │   │
│  │  ├─ Screen Resolution                                    │   │
│  │  ├─ Timezone                                             │   │
│  │  ├─ Language Settings                                    │   │
│  │  └─ Canvas Fingerprint                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  IP-BASED SECURITY                                       │   │
│  │  ├─ Geolocation Tracking                                 │   │
│  │  ├─ IP Whitelist (Optional)                              │   │
│  │  ├─ VPN/Proxy Detection                                  │   │
│  │  └─ Impossible Travel Detection                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TOKEN ROTATION                                          │   │
│  │  ├─ Automatic Token Refresh                              │   │
│  │  ├─ Refresh Token Rotation                               │   │
│  │  ├─ Token Revocation on Logout                           │   │
│  │  └─ Token Blacklisting                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Account Security

#### 4.5.1 Brute Force Protection

| Mechanism | Configuration | Action |
|-----------|--------------|--------|
| Failed Login Attempts | 5 attempts | Account lockout |
| Lockout Duration | 15 minutes (progressive) | Doubles with each lockout |
| IP-based Rate Limiting | 10 requests/minute | Temporary IP block |
| CAPTCHA Trigger | After 3 failed attempts | Challenge required |
| Account Lockout Notification | Immediate | Email alert sent |

#### 4.5.2 Account Recovery Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ACCOUNT RECOVERY PROCESS                       │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │  Recovery   │     │   Identity  │     │   MFA       │
  │  Initiated  │────▶│ Verification│────▶│ Challenge   │
  └─────────────┘     └─────────────┘     └──────┬──────┘
                                                 │
                            ┌────────────────────┴────────────────┐
                            │                                     │
                            ▼                                     ▼
                     ┌─────────────┐                       ┌─────────────┐
                     │   Backup    │                       │   Admin     │
                     │   Codes     │                       │   Reset     │
                     └──────┬──────┘                       └──────┬──────┘
                            │                                     │
                            └────────────────────┬────────────────┘
                                                 │
                                                 ▼
                     ┌─────────────────────────────────────────────┐
                     │            NEW PASSWORD SETUP               │
                     │  ┌─────────────────────────────────────┐   │
                     │  │  • Must meet complexity requirements │   │
                     │  │  • Cannot reuse last 12 passwords   │   │
                     │  │  • Expires in 90 days               │   │
                     │  └─────────────────────────────────────┘   │
                     └─────────────────────────────────────────────┘
                                                 │
                                                 ▼
                                         ┌─────────────┐
                                         │   Access    │
                                         │  Restored   │
                                         └─────────────┘
```

### 4.6 Audit Logging

#### 4.6.1 Authentication Events Logged

| Event Type | Data Captured | Retention |
|------------|---------------|-----------|
| Login Success | User ID, IP, Device, Timestamp, Method | 2 years |
| Login Failure | Username, IP, Reason, Timestamp | 2 years |
| MFA Challenge | User ID, Method, Success/Fail | 2 years |
| Password Change | User ID, Timestamp, Changed By | 2 years |
| Session Creation | Session ID, User ID, Device | 1 year |
| Session Termination | Session ID, Reason, Timestamp | 1 year |
| Account Lockout | User ID, Reason, Duration | 2 years |
| Permission Change | User ID, Old/New Permissions, Changed By | 5 years |

---

## 5. Facial Recognition System

### 5.1 Technology Overview

SAMS implements a state-of-the-art facial recognition system that combines multiple AI/ML technologies to ensure accurate, fast, and secure attendance tracking.

```
┌─────────────────────────────────────────────────────────────────┐
│              FACIAL RECOGNITION TECHNOLOGY STACK                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DETECTION LAYER                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  MTCNN  │  │  YOLO   │  │RetinaFace│ │ MediaPipe│    │   │
│  │  │  Face   │  │  v8     │  │         │  │  Face   │    │   │
│  │  │Detector │  │  Face   │  │         │  │  Mesh   │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   EMBEDDING LAYER                        │   │
│  │  ┌───────────────┐    ┌───────────────┐                 │   │
│  │  │   ArcFace     │    │   FaceNet     │                 │   │
│  │  │   (Primary)   │    │   (Backup)    │                 │   │
│  │  │   512-dim     │    │   128-dim     │                 │   │
│  │  └───────────────┘    └───────────────┘                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  ANTI-SPOOFING LAYER                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │Liveness │  │  Depth  │  │ Texture │  │ Motion  │    │   │
│  │  │Detection│  │Analysis │  │Analysis │  │Analysis │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Face Detection Specifications

#### 5.2.1 Detection Parameters

| Parameter | Specification | Notes |
|-----------|--------------|-------|
| Detection Model | RetinaFace + MTCNN (ensemble) | High accuracy, multi-scale |
| Minimum Face Size | 80x80 pixels | Ensures quality for matching |
| Maximum Faces per Frame | 50 | Classroom capacity |
| Detection Confidence Threshold | 0.95 | Minimizes false positives |
| Frame Processing Rate | 15 FPS | Balanced performance |
| Detection Range | 0.5m - 5m | Typical classroom setup |
| Angle Tolerance | ±30° yaw, ±20° pitch | Accommodates natural movement |

#### 5.2.2 Detection Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    FACE DETECTION PIPELINE                       │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │  Camera     │
  │  Input      │
  └──────┬──────┘
         │ Raw Frame (1920x1080)
         ▼
  ┌─────────────────────────────────────────────┐
  │           PRE-PROCESSING                     │
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
  │  │ Resize  │─▶│ Color   │─▶│ Enhance │     │
  │  │ 640x480 │  │ Normal. │  │ Contrast│     │
  │  └─────────┘  └─────────┘  └─────────┘     │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │           FACE DETECTION                     │
  │  ┌───────────────────────────────────────┐  │
  │  │         RetinaFace Detection          │  │
  │  │  • Multi-scale feature pyramid        │  │
  │  │  • Landmark detection (5 points)      │  │
  │  │  • Bounding box regression            │  │
  │  └───────────────────────────────────────┘  │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │           FACE ALIGNMENT                     │
  │  ┌───────────────────────────────────────┐  │
  │  │  • Eye center alignment               │  │
  │  │  • Affine transformation              │  │
  │  │  • Output: 112x112 aligned face       │  │
  │  └───────────────────────────────────────┘  │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │           QUALITY ASSESSMENT                 │
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
  │  │ Blur    │  │ Lighting│  │ Pose    │     │
  │  │ Score   │  │ Score   │  │ Score   │     │
  │  └─────────┘  └─────────┘  └─────────┘     │
  │                                             │
  │  Quality Score = weighted_average(scores)   │
  │  Threshold: ≥ 0.7 to proceed               │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────┐
  │  Qualified  │
  │  Face(s)    │
  └─────────────┘
```

### 5.3 Face Recognition (Matching) System

#### 5.3.1 Embedding Generation

| Component | Specification |
|-----------|--------------|
| Model Architecture | ArcFace (ResNet-100 backbone) |
| Embedding Dimension | 512 |
| Training Dataset | MS1MV3 (5.8M images, 93K identities) |
| LFW Accuracy | 99.83% |
| CFP-FP Accuracy | 98.78% |
| Inference Time | <15ms per face (GPU), <50ms (CPU) |

#### 5.3.2 Matching Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    FACE MATCHING PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────┐                         ┌─────────────┐
  │  Detected   │                         │  Enrolled   │
  │    Face     │                         │  Database   │
  └──────┬──────┘                         └──────┬──────┘
         │                                       │
         ▼                                       ▼
  ┌─────────────┐                         ┌─────────────┐
  │  Generate   │                         │  Retrieve   │
  │  Embedding  │                         │  Embeddings │
  │  (512-dim)  │                         │  for Class  │
  └──────┬──────┘                         └──────┬──────┘
         │                                       │
         └──────────────┬────────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────────────┐
         │           SIMILARITY COMPUTATION             │
         │                                             │
         │  Cosine Similarity:                         │
         │                                             │
         │  sim(A,B) = (A · B) / (||A|| × ||B||)      │
         │                                             │
         │  Threshold: ≥ 0.45 for match               │
         └────────────────────┬────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
       ┌─────────────┐                 ┌─────────────┐
       │   MATCH     │                 │  NO MATCH   │
       │  FOUND      │                 │  (Unknown)  │
       └──────┬──────┘                 └──────┬──────┘
              │                               │
              ▼                               ▼
       ┌─────────────┐                 ┌─────────────┐
       │  Record     │                 │  Flag for   │
       │ Attendance  │                 │  Review     │
       └─────────────┘                 └─────────────┘
```

#### 5.3.3 Matching Thresholds

| Scenario | Threshold | Confidence Level |
|----------|-----------|------------------|
| High Security Mode | ≥ 0.50 | Very High |
| Standard Mode | ≥ 0.45 | High |
| Lenient Mode | ≥ 0.40 | Moderate |
| Multiple Match Resolution | Top match if gap > 0.05 | Automatic |

### 5.4 Anti-Spoofing Measures

SAMS implements a multi-layered anti-spoofing system to prevent various attack vectors.

#### 5.4.1 Spoofing Attack Types and Countermeasures

```
┌─────────────────────────────────────────────────────────────────┐
│                  ANTI-SPOOFING ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ATTACK TYPE          │  COUNTERMEASURE                         │
│  ─────────────────────┼───────────────────────────────────────  │
│                       │                                         │
│  Printed Photo        │  ┌─────────────────────────────────┐   │
│  Attack               │  │ Texture Analysis (LBP/CNN)      │   │
│                       │  │ • Detects paper texture          │   │
│                       │  │ • Moire pattern detection        │   │
│                       │  └─────────────────────────────────┘   │
│                       │                                         │
│  Screen/Video         │  ┌─────────────────────────────────┐   │
│  Replay Attack        │  │ Screen Detection                │   │
│                       │  │ • Refresh rate analysis          │   │
│                       │  │ • Edge detection (bezels)        │   │
│                       │  │ • Reflection pattern analysis    │   │
│                       │  └─────────────────────────────────┘   │
│                       │                                         │
│  3D Mask              │  ┌─────────────────────────────────┐   │
│  Attack               │  │ Depth Analysis                  │   │
│                       │  │ • Multi-frame depth estimation   │   │
│                       │  │ • Facial feature depth mapping   │   │
│                       │  └─────────────────────────────────┘   │
│                       │                                         │
│  Deepfake             │  ┌─────────────────────────────────┐   │
│  Attack               │  │ Deepfake Detection              │   │
│                       │  │ • Facial landmark consistency    │   │
│                       │  │ • Temporal coherence analysis    │   │
│                       │  │ • GAN artifact detection         │   │
│                       │  └─────────────────────────────────┘   │
│                       │                                         │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.4.2 Liveness Detection System

```
┌─────────────────────────────────────────────────────────────────┐
│                   LIVENESS DETECTION METHODS                     │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │                    PASSIVE LIVENESS                          │
  │  (No user interaction required)                              │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │  • Micro-movement analysis (eye blinks, micro-      │    │
  │  │    expressions)                                      │    │
  │  │  • Skin texture analysis                            │    │
  │  │  • Color distribution analysis                      │    │
  │  │  • Specular reflection detection                    │    │
  │  │  • 3D depth estimation from single image            │    │
  │  └─────────────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │                    ACTIVE LIVENESS                           │
  │  (User interaction required - challenge-response)            │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │  • Blink detection challenge                        │    │
  │  │  • Head movement challenge (turn left/right)        │    │
  │  │  • Smile detection challenge                        │    │
  │  │  • Random gesture verification                      │    │
  │  │  • Eye tracking challenge                           │    │
  │  └─────────────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │                    HYBRID APPROACH                           │
  │  (SAMS Default - Combines both methods)                      │
  │  ┌─────────────────────────────────────────────────────┐    │
  │  │  Standard Mode:                                     │    │
  │  │  • Passive liveness (continuous)                    │    │
  │  │  • Active challenge (if passive score < 0.8)        │    │
  │  │                                                     │    │
  │  │  High Security Mode:                                │    │
  │  │  • Both passive and active required                 │    │
  │  │  • Multiple frame consistency check                 │    │
  │  └─────────────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────────────┘
```

#### 5.4.3 Anti-Spoofing Score Calculation

```
Final Liveness Score = Σ (weight_i × score_i)

Where:
┌──────────────────────────────────────────────────────────────┐
│  Component              │  Weight  │  Score Range            │
│  ───────────────────────┼──────────┼───────────────────────  │
│  Texture Analysis       │   0.25   │   0.0 - 1.0            │
│  Depth Analysis         │   0.20   │   0.0 - 1.0            │
│  Motion Analysis        │   0.20   │   0.0 - 1.0            │
│  Reflection Analysis    │   0.15   │   0.0 - 1.0            │
│  Active Challenge       │   0.20   │   0.0 - 1.0            │
│  ───────────────────────┼──────────┼───────────────────────  │
│  TOTAL                  │   1.00   │   Threshold: ≥ 0.75    │
└──────────────────────────────────────────────────────────────┘
```

### 5.5 Facial Data Enrollment

#### 5.5.1 Enrollment Requirements

| Requirement | Specification |
|-------------|--------------|
| Minimum Images | 5 images per student |
| Recommended Images | 10-15 images per student |
| Image Variations | Multiple angles, lighting conditions |
| Quality Score | Each image must score ≥ 0.8 |
| File Formats | JPEG, PNG |
| Resolution | Minimum 640x480, Recommended 1280x720 |

#### 5.5.2 Enrollment Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   STUDENT ENROLLMENT FLOW                        │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │  Admin      │
  │  Initiates  │
  │  Enrollment │
  └──────┬──────┘
         │
         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              STUDENT DATA ENTRY                              │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │  • Student ID                                         │  │
  │  │  • Full Name                                          │  │
  │  │  • Department                                         │  │
  │  │  • Program/Course                                     │  │
  │  │  • Year of Study                                      │  │
  │  │  • Email Address                                      │  │
  │  └───────────────────────────────────────────────────────┘  │
  └──────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              FACIAL DATA CAPTURE                             │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │           CAPTURE INTERFACE                           │  │
  │  │  ┌─────────────────────────────────────────────────┐  │  │
  │  │  │                                                 │  │  │
  │  │  │           [Live Camera Feed]                    │  │  │
  │  │  │                                                 │  │  │
  │  │  │      ┌─────────────────────────────┐           │  │  │
  │  │  │      │    Face Detection Box      │           │  │  │
  │  │  │      │    [Align face here]       │           │  │  │
  │  │  │      └─────────────────────────────┘           │  │  │
  │  │  │                                                 │  │  │
  │  │  └─────────────────────────────────────────────────┘  │  │
  │  │                                                       │  │
  │  │  Captured: [■■■□□□□□□□] 3/10                          │  │
  │  │                                                       │  │
  │  │  Instructions:                                        │  │
  │  │  • Look straight at the camera                        │  │
  │  │  • Turn slightly left                                 │  │
  │  │  • Turn slightly right                                │  │
  │  │  • Look up slightly                                   │  │
  │  │  • Look down slightly                                 │  │
  │  └───────────────────────────────────────────────────────┘  │
  └──────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              QUALITY VALIDATION                              │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │  For each captured image:                             │  │
  │  │  ✓ Face Detection: Passed                             │  │
  │  │  ✓ Quality Score: 0.87 (≥0.8 required)               │  │
  │  │  ✓ Liveness Check: Passed                             │  │
  │  │  ✓ Duplicate Check: No duplicates found               │  │
  │  └───────────────────────────────────────────────────────┘  │
  └──────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              EMBEDDING GENERATION                            │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │  • Generate 512-dim embedding for each image          │  │
  │  │  • Calculate average embedding                        │  │
  │  │  • Store in encrypted vector database                 │  │
  │  └───────────────────────────────────────────────────────┘  │
  └──────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              CONSENT & CONFIRMATION                          │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │  ☑ Student has provided informed consent              │  │
  │  │  ☑ Data privacy notice acknowledged                   │  │
  │  │  ☑ Right to withdrawal explained                      │  │
  │  │                                                       │  │
  │  │  [Complete Enrollment]                                │  │
  │  └───────────────────────────────────────────────────────┘  │
  └──────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
  ┌─────────────┐
  │  Enrollment │
  │  Complete   │
  └─────────────┘
```

### 5.6 Real-Time Attendance Tracking

#### 5.6.1 Attendance Session Configuration

| Parameter | Options | Default |
|-----------|---------|---------|
| Session Duration | Manual/Timed | Manual |
| Auto-start | On schedule/Manual | Manual |
| Grace Period (Late) | 0-30 minutes | 15 minutes |
| Recognition Mode | Continuous/On-demand | Continuous |
| Duplicate Check | Enabled/Disabled | Enabled |
| Unknown Face Alert | Enabled/Disabled | Enabled |

#### 5.6.2 Real-Time Attendance Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               REAL-TIME ATTENDANCE SESSION                       │
└─────────────────────────────────────────────────────────────────┘

  Lecturer                    System                    Database
  ────────                   ──────                    ────────

     │                          │                          │
     │  Start Session           │                          │
     │─────────────────────────▶│                          │
     │                          │                          │
     │                          │  Load Class Roster       │
     │                          │─────────────────────────▶│
     │                          │                          │
     │                          │  Embeddings Retrieved    │
     │                          │◀─────────────────────────│
     │                          │                          │
     │         Session Active   │                          │
     │◀─────────────────────────│                          │
     │                          │                          │
     │                    ┌─────┴─────┐                    │
     │                    │  Camera   │                    │
     │                    │  Active   │                    │
     │                    └─────┬─────┘                    │
     │                          │                          │
     │                    ┌─────┴─────┐                    │
     │                    │ Continuous│                    │
     │                    │ Frame     │◀────┐             │
     │                    │ Processing│     │             │
     │                    └─────┬─────┘     │             │
     │                          │           │             │
     │                          ▼           │             │
     │                    ┌───────────┐     │             │
     │                    │  Detect   │     │             │
     │                    │  Faces    │     │             │
     │                    └─────┬─────┘     │             │
     │                          │           │             │
     │                          ▼           │             │
     │                    ┌───────────┐     │             │
     │                    │ Anti-Spoof│     │             │
     │                    │  Check    │     │             │
     │                    └─────┬─────┘     │             │
     │                          │           │             │
     │                          ▼           │             │
     │                    ┌───────────┐     │             │
     │                    │  Match    │     │             │
     │                    │  Faces    │     │             │
     │                    └─────┬─────┘     │             │
     │                          │           │             │
     │              ┌───────────┴───────────┐             │
     │              ▼                       ▼             │
     │        ┌─────────┐            ┌─────────┐         │
     │        │  Match  │            │   No    │         │
     │        │  Found  │            │  Match  │         │
     │        └────┬────┘            └────┬────┘         │
     │             │                      │               │
     │             ▼                      ▼               │
     │       ┌───────────┐         ┌───────────┐         │
     │       │  Record   │         │   Flag    │         │
     │       │Attendance │         │  Unknown  │         │
     │       └─────┬─────┘         └─────┬─────┘         │
     │             │                      │               │
     │             │  Store Record        │  Log Alert   │
     │             │─────────────────────────────────────▶│
     │             │                      │               │
     │  Real-time Update                  │               │
     │◀────────────│                      │               │
     │             │                      │             Loop
     │             └──────────────────────┴───────────────┘
     │                          │                          │
     │  End Session             │                          │
     │─────────────────────────▶│                          │
     │                          │                          │
     │                          │  Finalize Records        │
     │                          │─────────────────────────▶│
     │                          │                          │
     │     Session Summary      │                          │
     │◀─────────────────────────│                          │
     │                          │                          │
```

#### 5.6.3 Attendance Status Types

| Status | Code | Description | Visual Indicator |
|--------|------|-------------|------------------|
| Present | P | Face recognized within session window | Green |
| Late | L | Face recognized after grace period | Yellow |
| Absent | A | No recognition during session | Red |
| Excused | E | Pre-approved absence | Blue |
| Manual | M | Manually marked by lecturer | Purple |

### 5.7 Performance Specifications

| Metric | Requirement | Optimal |
|--------|-------------|---------|
| Face Detection Time | < 100ms | < 50ms |
| Face Recognition Time | < 200ms | < 100ms |
| Liveness Check Time | < 300ms | < 150ms |
| Total Processing Time | < 500ms | < 300ms |
| False Acceptance Rate (FAR) | < 0.001% | < 0.0001% |
| False Rejection Rate (FRR) | < 1% | < 0.5% |
| Spoof Attack Detection Rate | > 99% | > 99.9% |
| Concurrent Face Processing | 20+ faces | 50 faces |

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SAMS SYSTEM ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        PRESENTATION LAYER                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │   Admin     │  │  Lecturer   │  │   Mobile    │                  │   │
│  │  │   Portal    │  │   Portal    │  │    Web      │                  │   │
│  │  │  (React)    │  │  (React)    │  │  (React)    │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API GATEWAY LAYER                            │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Kong / AWS API Gateway                                       │  │   │
│  │  │  • Rate Limiting  • Authentication  • Load Balancing         │  │   │
│  │  │  • Request Routing  • SSL Termination  • API Versioning      │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        APPLICATION LAYER                             │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │    Auth     │  │   User      │  │ Attendance  │  │  Report   │  │   │
│  │  │  Service    │  │  Service    │  │  Service    │  │  Service  │  │   │
│  │  │  (Node.js)  │  │  (Node.js)  │  │  (Python)   │  │ (Node.js) │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │   Course    │  │Integration  │  │Notification │  │  Audit    │  │   │
│  │  │  Service    │  │  Service    │  │  Service    │  │  Service  │  │   │
│  │  │  (Node.js)  │  │  (Node.js)  │  │  (Node.js)  │  │ (Node.js) │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      FACIAL RECOGNITION LAYER                        │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                   FR Processing Engine (Python)                │  │   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │  │   │
│  │  │  │Detection│  │Embedding│  │Matching │  │Anti-Spoof│          │  │   │
│  │  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │          │  │   │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          DATA LAYER                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │   │
│  │  │ PostgreSQL  │  │   Redis     │  │   Milvus    │  │    S3     │  │   │
│  │  │  (Primary)  │  │   Cache     │  │  (Vectors)  │  │  Storage  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, TypeScript, MUI | User Interface |
| API Gateway | Kong / AWS API Gateway | Traffic Management |
| Backend | Node.js, Express, FastAPI | Business Logic |
| ML Engine | Python, PyTorch, InsightFace | Facial Recognition |
| Database | PostgreSQL 15 | Primary Data Store |
| Cache | Redis 7 | Session & Data Cache |
| Vector DB | Milvus 2.x | Face Embeddings |
| Storage | MinIO / S3 | File Storage |
| Container | Docker, Kubernetes | Deployment |
| Monitoring | Prometheus, Grafana | Observability |

---

## 7. User Interface Design

### 7.1 Design System

#### Color Palette
- Primary: #1976D2 (Blue)
- Secondary: #9C27B0 (Purple)
- Success: #4CAF50 (Green)
- Warning: #FF9800 (Orange)
- Error: #F44336 (Red)

#### Typography
- Font Family: Roboto
- H1: 32px/700, H2: 28px/600, Body: 16px/400

---

## 8. Database Design

### 8.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATABASE ENTITY RELATIONSHIPS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │    USER     │       │ INSTITUTION │       │ DEPARTMENT  │               │
│  ├─────────────┤       ├─────────────┤       ├─────────────┤               │
│  │ id (PK)     │       │ id (PK)     │       │ id (PK)     │               │
│  │ email       │──┐    │ name        │◀──────│ institution │               │
│  │ password    │  │    │ code        │       │ name        │               │
│  │ role        │  │    │ address     │       │ code        │               │
│  │ mfa_enabled │  │    │ settings    │       └──────┬──────┘               │
│  │ institution │──┼───▶│ created_at  │              │                      │
│  │ department  │──┼────────────────────────────────┘                      │
│  │ status      │  │                                                        │
│  └──────┬──────┘  │                                                        │
│         │         │                                                        │
│         │         │    ┌─────────────┐       ┌─────────────┐               │
│         │         │    │   STUDENT   │       │ FACE_DATA   │               │
│         │         │    ├─────────────┤       ├─────────────┤               │
│         │         │    │ id (PK)     │       │ id (PK)     │               │
│         │         └───▶│ student_id  │◀──────│ student (FK)│               │
│         │              │ first_name  │       │ embedding   │               │
│         │              │ last_name   │       │ image_path  │               │
│         │              │ email       │       │ quality     │               │
│         │              │ department  │       │ created_at  │               │
│         │              │ program     │       └─────────────┘               │
│         │              │ year        │                                     │
│         │              │ status      │                                     │
│         │              └──────┬──────┘                                     │
│         │                     │                                            │
│         ▼                     ▼                                            │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐               │
│  │   COURSE    │       │COURSE_ENROLL│       │  SCHEDULE   │               │
│  ├─────────────┤       ├─────────────┤       ├─────────────┤               │
│  │ id (PK)     │◀──────│ course (FK) │       │ id (PK)     │               │
│  │ code        │       │ student (FK)│───────│ course (FK) │               │
│  │ name        │       │ enrolled_at │       │ day_of_week │               │
│  │ department  │       └─────────────┘       │ start_time  │               │
│  │ lecturer    │──┐                          │ end_time    │               │
│  │ capacity    │  │                          │ room        │               │
│  │ semester    │  │                          └──────┬──────┘               │
│  └──────┬──────┘  │                                 │                      │
│         │         │                                 │                      │
│         │         │                                 │                      │
│         ▼         │                                 ▼                      │
│  ┌─────────────┐  │    ┌─────────────┐       ┌─────────────┐               │
│  │  ATTEND_    │  │    │  ATTEND_    │       │    ROOM     │               │
│  │  SESSION    │  │    │  RECORD     │       ├─────────────┤               │
│  ├─────────────┤  │    ├─────────────┤       │ id (PK)     │               │
│  │ id (PK)     │◀─┼────│ session (FK)│       │ name        │               │
│  │ course (FK) │  │    │ student (FK)│       │ building    │               │
│  │ lecturer    │──┘    │ status      │       │ capacity    │               │
│  │ start_time  │       │ recognized  │       │ camera_id   │               │
│  │ end_time    │       │ timestamp   │       └─────────────┘               │
│  │ status      │       │ confidence  │                                     │
│  │ room (FK)   │       │ manual      │                                     │
│  └─────────────┘       │ notes       │                                     │
│                        └─────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Core Table Schemas

#### 8.2.1 Users Table

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'lecturer')),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    institution_id  UUID REFERENCES institutions(id),
    department_id   UUID REFERENCES departments(id),
    phone           VARCHAR(20),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    mfa_enabled     BOOLEAN DEFAULT false,
    mfa_secret      VARCHAR(255),
    last_login      TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_role ON users(role);
```

#### 8.2.2 Students Table

```sql
CREATE TABLE students (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      VARCHAR(50) UNIQUE NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    institution_id  UUID REFERENCES institutions(id) NOT NULL,
    department_id   UUID REFERENCES departments(id) NOT NULL,
    program         VARCHAR(255) NOT NULL,
    year_of_study   INTEGER NOT NULL,
    enrollment_date DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',
    consent_given   BOOLEAN DEFAULT false,
    consent_date    TIMESTAMP WITH TIME ZONE,
    face_enrolled   BOOLEAN DEFAULT false,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_institution ON students(institution_id);
CREATE INDEX idx_students_department ON students(department_id);
```

#### 8.2.3 Face Data Table

```sql
CREATE TABLE face_data (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    embedding       VECTOR(512) NOT NULL,  -- Using pgvector extension
    image_path      VARCHAR(500) NOT NULL,
    quality_score   DECIMAL(4,3) NOT NULL,
    is_primary      BOOLEAN DEFAULT false,
    captured_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    captured_by     UUID REFERENCES users(id),
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_face_data_student ON face_data(student_id);
CREATE INDEX idx_face_data_embedding ON face_data USING ivfflat (embedding vector_cosine_ops);
```

#### 8.2.4 Attendance Sessions Table

```sql
CREATE TABLE attendance_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID REFERENCES courses(id) NOT NULL,
    lecturer_id     UUID REFERENCES users(id) NOT NULL,
    schedule_id     UUID REFERENCES schedules(id),
    room_id         UUID REFERENCES rooms(id),
    session_date    DATE NOT NULL,
    start_time      TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time        TIMESTAMP WITH TIME ZONE,
    grace_period    INTEGER DEFAULT 15, -- minutes
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    settings        JSONB DEFAULT '{}',
    total_present   INTEGER DEFAULT 0,
    total_late      INTEGER DEFAULT 0,
    total_absent    INTEGER DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_course ON attendance_sessions(course_id);
CREATE INDEX idx_sessions_lecturer ON attendance_sessions(lecturer_id);
CREATE INDEX idx_sessions_date ON attendance_sessions(session_date);
CREATE INDEX idx_sessions_status ON attendance_sessions(status);
```

#### 8.2.5 Attendance Records Table

```sql
CREATE TABLE attendance_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID REFERENCES attendance_sessions(id) NOT NULL,
    student_id          UUID REFERENCES students(id) NOT NULL,
    status              VARCHAR(20) NOT NULL CHECK (status IN ('present', 'late', 'absent', 'excused')),
    recognition_method  VARCHAR(20) CHECK (method IN ('facial', 'manual')),
    recognized_at       TIMESTAMP WITH TIME ZONE,
    confidence_score    DECIMAL(4,3),
    is_manual           BOOLEAN DEFAULT false,
    manual_by           UUID REFERENCES users(id),
    manual_reason       TEXT,
    face_image_path     VARCHAR(500),
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(session_id, student_id)
);

CREATE INDEX idx_records_session ON attendance_records(session_id);
CREATE INDEX idx_records_student ON attendance_records(student_id);
CREATE INDEX idx_records_status ON attendance_records(status);
CREATE INDEX idx_records_timestamp ON attendance_records(recognized_at);
```

### 8.3 Data Retention Policies

| Data Type | Retention Period | Action After Expiry |
|-----------|-----------------|---------------------|
| Attendance Records | 7 years | Archive to cold storage |
| Audit Logs | 5 years | Archive then delete |
| Session Images | 30 days | Delete |
| Face Embeddings | Until student withdrawal | Delete on request |
| User Activity | 2 years | Archive |
| System Logs | 1 year | Delete |

---

## 9. Integration Capabilities

### 9.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INTEGRATION ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           ┌─────────────┐                                   │
│                           │    SAMS     │                                   │
│                           │   Core      │                                   │
│                           └──────┬──────┘                                   │
│                                  │                                          │
│          ┌───────────────────────┼───────────────────────┐                 │
│          │                       │                       │                 │
│          ▼                       ▼                       ▼                 │
│  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐          │
│  │     LMS       │      │     SIS       │      │    IdP        │          │
│  │  Integration  │      │  Integration  │      │  Integration  │          │
│  │               │      │               │      │               │          │
│  │ • Moodle      │      │ • Banner      │      │ • SAML        │          │
│  │ • Canvas      │      │ • PeopleSoft  │      │ • OAuth       │          │
│  │ • Blackboard  │      │ • Workday     │      │ • LDAP/AD     │          │
│  └───────────────┘      └───────────────┘      └───────────────┘          │
│          │                       │                       │                 │
│          ▼                       ▼                       ▼                 │
│  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐          │
│  │   Calendar    │      │    Email      │      │  Notification │          │
│  │    Sync       │      │   Service     │      │    Service    │          │
│  │               │      │               │      │               │          │
│  │ • Google Cal  │      │ • SMTP        │      │ • SMS (Twilio)│          │
│  │ • Outlook     │      │ • SendGrid    │      │ • Push (FCM)  │          │
│  │ • iCal        │      │ • Mailgun     │      │ • Webhook     │          │
│  └───────────────┘      └───────────────┘      └───────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 API Integration Specifications

#### 9.2.1 LMS Integration (Moodle Example)

```json
{
  "integration": "moodle",
  "type": "bi-directional",
  "endpoints": {
    "course_sync": "POST /api/v1/integrations/lms/courses/sync",
    "attendance_export": "POST /api/v1/integrations/lms/attendance/export",
    "student_sync": "POST /api/v1/integrations/lms/students/sync"
  },
  "authentication": {
    "type": "oauth2",
    "token_endpoint": "{moodle_url}/oauth2/token"
  },
  "webhook_events": [
    "attendance.session.completed",
    "student.enrolled",
    "course.updated"
  ]
}
```

---

## 10. Performance Requirements

### 10.1 Performance Metrics

| Metric | Requirement | Target |
|--------|-------------|--------|
| API Response Time (95th percentile) | < 500ms | < 200ms |
| Face Recognition Latency | < 500ms | < 200ms |
| Page Load Time | < 3 seconds | < 1.5 seconds |
| Concurrent Users | 1,000 | 5,000 |
| Uptime | 99.5% | 99.9% |
| Database Query Time | < 100ms | < 50ms |

### 10.2 Scalability Requirements

| Component | Horizontal Scaling | Auto-scaling Trigger |
|-----------|-------------------|---------------------|
| API Servers | Yes | CPU > 70% |
| FR Engine | Yes (GPU) | Queue depth > 100 |
| Database | Read replicas | Connection pool > 80% |
| Cache | Redis Cluster | Memory > 80% |

---

## 11. Error Handling and Recovery

### 11.1 Error Categories

| Category | Code Range | Handling Strategy |
|----------|------------|-------------------|
| Authentication | 401, 403 | Redirect to login |
| Validation | 400 | Display field errors |
| Server Error | 500 | Retry with backoff |
| FR Engine | 503 | Fallback to manual |
| Network | Timeout | Queue for retry |

### 11.2 Recovery Procedures

```
┌─────────────────────────────────────────────────────────────────┐
│                  DISASTER RECOVERY PROCEDURES                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RTO (Recovery Time Objective): 4 hours                         │
│  RPO (Recovery Point Objective): 1 hour                         │
│                                                                  │
│  BACKUP STRATEGY:                                               │
│  • Database: Hourly incremental, Daily full                     │
│  • Face Embeddings: Daily sync to cold storage                  │
│  • Configuration: Version controlled (Git)                      │
│  • Logs: Real-time streaming to backup location                 │
│                                                                  │
│  FAILOVER PROCEDURE:                                            │
│  1. Detect failure (automated monitoring)                       │
│  2. DNS failover to standby region (< 5 min)                   │
│  3. Restore from latest backup                                  │
│  4. Verify data integrity                                       │
│  5. Resume operations                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Reporting and Analytics

### 12.1 Standard Reports

| Report | Description | Frequency | Access |
|--------|-------------|-----------|--------|
| Daily Attendance Summary | Per-course attendance | Daily | All |
| Weekly Trends | Attendance trends | Weekly | All |
| Student Attendance | Individual student records | On-demand | Admin, Lecturer |
| Low Attendance Alert | Students below threshold | Daily | Admin |
| Course Comparison | Cross-course analytics | Monthly | Admin |
| System Usage | FR accuracy, usage stats | Weekly | Admin |

### 12.2 Analytics Dashboard Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                  ANALYTICS DASHBOARD METRICS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  KEY PERFORMANCE INDICATORS (KPIs):                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Overall Attendance Rate (%)                            │   │
│  │ • Recognition Success Rate (%)                           │   │
│  │ • Average Session Duration                               │   │
│  │ • Manual Override Rate (%)                               │   │
│  │ • System Availability (%)                                │   │
│  │ • Student Engagement Score                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  VISUALIZATION TYPES:                                           │
│  • Time series charts (attendance trends)                       │
│  • Heat maps (attendance by time/day)                          │
│  • Pie charts (status distribution)                            │
│  • Bar charts (course comparison)                              │
│  • Tables (detailed records)                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Mobile and Cross-Platform Requirements

### 13.1 Responsive Design Breakpoints

| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| xs | < 576px | Mobile phones |
| sm | 576px - 768px | Large phones/tablets |
| md | 768px - 992px | Tablets |
| lg | 992px - 1200px | Laptops |
| xl | > 1200px | Desktops |

### 13.2 Browser Support

| Browser | Minimum Version | WebRTC Support |
|---------|----------------|----------------|
| Chrome | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full |
| Edge | 90+ | Full |

### 13.3 Progressive Web App (PWA) Features

- Offline capability (cached UI)
- Push notifications
- Home screen installation
- Background sync
- Camera access (HTTPS required)

---

## 14. Security and Compliance

### 14.1 Security Measures

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DATA ENCRYPTION:                                               │
│  • At Rest: AES-256                                             │
│  • In Transit: TLS 1.3                                          │
│  • Face Embeddings: Encrypted with institution key              │
│                                                                  │
│  ACCESS CONTROL:                                                │
│  • Role-Based Access Control (RBAC)                             │
│  • Attribute-Based Access Control (ABAC)                        │
│  • Principle of Least Privilege                                 │
│                                                                  │
│  SECURITY MONITORING:                                           │
│  • Real-time threat detection                                   │
│  • Anomaly detection (ML-based)                                 │
│  • Intrusion detection system (IDS)                             │
│  • Regular penetration testing                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 14.2 Compliance Requirements

| Regulation | Requirements | Implementation |
|------------|--------------|----------------|
| GDPR | Data subject rights, consent, DPA | Consent management, data export/delete |
| FERPA | Student record protection | Access controls, audit logs |
| BIPA | Biometric data consent | Explicit consent, data retention policy |
| CCPA | Privacy rights | Privacy notice, opt-out mechanisms |

### 14.3 Data Privacy Measures

1. **Consent Management**
   - Explicit opt-in for facial data collection
   - Clear privacy notice before enrollment
   - Right to withdraw consent at any time
   - Data portability on request

2. **Data Minimization**
   - Collect only necessary data
   - Regular data cleanup
   - Anonymization for analytics

3. **Access Logging**
   - Complete audit trail
   - Who accessed what, when
   - Immutable log storage

---

## 15. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| FR | Facial Recognition |
| MFA | Multi-Factor Authentication |
| RBAC | Role-Based Access Control |
| FAR | False Acceptance Rate |
| FRR | False Rejection Rate |
| LMS | Learning Management System |
| SIS | Student Information System |
| IdP | Identity Provider |
| TOTP | Time-based One-Time Password |
| JWT | JSON Web Token |

### Appendix B: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 23, 2026 | SAMS Team | Initial release |

### Appendix C: Stakeholder Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor | _____________ | _____________ | ________ |
| Technical Lead | _____________ | _____________ | ________ |
| Security Officer | _____________ | _____________ | ________ |
| Compliance Officer | _____________ | _____________ | ________ |

---

## 16. Detailed User Experience Flows

### 16.1 Complete Administrator Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADMINISTRATOR COMPLETE WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         DAILY OPERATIONS                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  08:00 AM - LOGIN & DASHBOARD REVIEW                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. Login with credentials + MFA verification                        │   │
│  │  2. Review dashboard alerts and notifications                        │   │
│  │  3. Check system health status                                       │   │
│  │  4. Review overnight batch processing results                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  09:00 AM - USER MANAGEMENT                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. Review pending lecturer account requests                         │   │
│  │  2. Approve/reject account creation requests                         │   │
│  │  3. Handle password reset requests                                   │   │
│  │  4. Review and resolve account lockouts                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  10:00 AM - STUDENT ENROLLMENT                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. Process new student enrollments                                  │   │
│  │  2. Conduct facial data capture sessions                             │   │
│  │  3. Verify data quality and re-capture if needed                     │   │
│  │  4. Update course assignments                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  02:00 PM - REPORTING & ANALYTICS                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. Generate daily attendance summary reports                        │   │
│  │  2. Review low attendance alerts                                     │   │
│  │  3. Identify at-risk students                                        │   │
│  │  4. Export reports for stakeholders                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  04:00 PM - SYSTEM MAINTENANCE                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. Review audit logs for anomalies                                  │   │
│  │  2. Check FR engine performance metrics                              │   │
│  │  3. Update system configurations as needed                           │   │
│  │  4. Schedule maintenance windows                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Complete Lecturer Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LECTURER COMPLETE WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    BEFORE CLASS SESSION                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Step 1: Pre-Class Preparation (15 min before)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Login to SAMS portal                                              │   │
│  │  • Navigate to today's scheduled classes                             │   │
│  │  • Review class roster and any alerts                                │   │
│  │  • Verify camera system is operational                               │   │
│  │  • Check room configuration                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    DURING CLASS SESSION                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Step 2: Start Attendance Session                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Click "Start Attendance" for the scheduled class                  │   │
│  │  • Confirm session parameters (grace period, duration)               │   │
│  │  • System activates camera and FR engine                             │   │
│  │  • Real-time recognition begins automatically                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  Step 3: Monitor Recognition (Continuous)                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • View live attendance feed on dashboard                            │   │
│  │  • Monitor recognition status (present/late counters)                │   │
│  │  • Handle any unknown face alerts                                    │   │
│  │  • Address any technical issues                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  Step 4: Manual Overrides (As Needed)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Mark attendance manually for unrecognized students                │   │
│  │  • Record excused absences with documentation                        │   │
│  │  • Add notes for special circumstances                               │   │
│  │  • Approve late entries with justification                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    AFTER CLASS SESSION                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Step 5: End Session & Review                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Click "End Session" to finalize attendance                        │   │
│  │  • Review session summary (present/late/absent counts)               │   │
│  │  • Make any final adjustments                                        │   │
│  │  • Confirm and save the attendance record                            │   │
│  │  • Export/share report if needed                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.3 Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE LOGIN FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              ┌─────────────┐                                │
│                              │   START     │                                │
│                              └──────┬──────┘                                │
│                                     │                                       │
│                                     ▼                                       │
│                         ┌──────────────────────┐                            │
│                         │   Login Page         │                            │
│                         │   ┌──────────────┐   │                            │
│                         │   │ Email:       │   │                            │
│                         │   │ [__________] │   │                            │
│                         │   │ Password:    │   │                            │
│                         │   │ [__________] │   │                            │
│                         │   │              │   │                            │
│                         │   │ [Login] [SSO]│   │                            │
│                         │   └──────────────┘   │                            │
│                         └──────────┬───────────┘                            │
│                                    │                                        │
│               ┌────────────────────┼────────────────────┐                  │
│               │                    │                    │                  │
│               ▼                    ▼                    ▼                  │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│    │ Standard Login  │  │   SSO Login     │  │ Forgot Password │          │
│    └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
│             │                    │                    │                   │
│             ▼                    ▼                    ▼                   │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│    │Validate         │  │Redirect to IdP  │  │Email Verification│         │
│    │Credentials      │  │                 │  │                 │          │
│    └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
│             │                    │                    │                   │
│             ▼                    ▼                    ▼                   │
│      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
│      │ Valid?       │    │ SAML         │    │ Reset Link   │            │
│      └──────┬───────┘    │ Response     │    │ Sent         │            │
│             │            └──────┬───────┘    └──────────────┘            │
│     ┌───────┴───────┐           │                                        │
│     │               │           │                                        │
│     ▼               ▼           │                                        │
│  ┌──────┐      ┌──────────┐     │                                        │
│  │ No   │      │  Yes     │◀────┘                                        │
│  └──┬───┘      └────┬─────┘                                              │
│     │               │                                                    │
│     ▼               ▼                                                    │
│  ┌──────────┐  ┌────────────────────────────────┐                        │
│  │ Increment│  │      MFA Required?             │                        │
│  │ Failed   │  └─────────────┬──────────────────┘                        │
│  │ Attempts │                │                                           │
│  └────┬─────┘        ┌───────┴───────┐                                   │
│       │              │               │                                   │
│       ▼              ▼               ▼                                   │
│  ┌──────────┐   ┌─────────┐    ┌─────────────────────────┐              │
│  │ > 5      │   │   No    │    │         Yes             │              │
│  │attempts? │   │         │    │  ┌─────────────────┐    │              │
│  └────┬─────┘   └────┬────┘    │  │  MFA Challenge  │    │              │
│       │              │         │  │  ┌───────────┐  │    │              │
│   ┌───┴───┐          │         │  │  │Enter Code:│  │    │              │
│   │       │          │         │  │  │[______]   │  │    │              │
│   ▼       ▼          │         │  │  │           │  │    │              │
│ ┌────┐ ┌──────┐      │         │  │  │ [Verify]  │  │    │              │
│ │Yes │ │ No   │      │         │  │  └───────────┘  │    │              │
│ └─┬──┘ └──┬───┘      │         │  └────────┬────────┘    │              │
│   │       │          │         │           │             │              │
│   ▼       │          │         └───────────┼─────────────┘              │
│ ┌──────┐  │          │                     │                            │
│ │Lock  │  │          │              ┌──────┴──────┐                     │
│ │Account│ │          │              │  Valid?     │                     │
│ └──────┘  │          │              └──────┬──────┘                     │
│           │          │              ┌──────┴──────┐                     │
│           │          │              ▼             ▼                     │
│           │          │         ┌──────┐      ┌──────┐                   │
│           │          │         │ Yes  │      │  No  │                   │
│           │          │         └──┬───┘      └──┬───┘                   │
│           │          │            │             │                       │
│           │          └────────────┼─────────────┘                       │
│           │                       │                                     │
│           │                       ▼                                     │
│           │           ┌──────────────────────────┐                      │
│           │           │   Generate JWT Token     │                      │
│           │           │   Create Session         │                      │
│           │           │   Log Authentication     │                      │
│           │           └────────────┬─────────────┘                      │
│           │                        │                                    │
│           │                        ▼                                    │
│           │           ┌──────────────────────────┐                      │
│           │           │   Redirect to Dashboard  │                      │
│           │           │   Based on User Role     │                      │
│           │           └──────────────────────────┘                      │
│           │                                                             │
│           └───────────────▶ [Show Error Message]                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.4 Facial Recognition Session Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  FACIAL RECOGNITION SESSION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        INITIALIZATION PHASE                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│    Lecturer Clicks              System                     Database         │
│    "Start Session"             Response                    Operations       │
│         │                         │                           │             │
│         ▼                         │                           │             │
│  ┌─────────────┐                  │                           │             │
│  │ Select      │                  │                           │             │
│  │ Course &    │                  │                           │             │
│  │ Parameters  │                  │                           │             │
│  └──────┬──────┘                  │                           │             │
│         │                         │                           │             │
│         │ POST /sessions          │                           │             │
│         │────────────────────────▶│                           │             │
│         │                         │                           │             │
│         │                         │ Create Session Record     │             │
│         │                         │──────────────────────────▶│             │
│         │                         │                           │             │
│         │                         │ Load Student Roster       │             │
│         │                         │◀──────────────────────────│             │
│         │                         │                           │             │
│         │                         │ Load Face Embeddings      │             │
│         │                         │──────────────────────────▶│             │
│         │                         │                           │             │
│         │                         │ Embeddings Retrieved      │             │
│         │                         │◀──────────────────────────│             │
│         │                         │                           │             │
│         │ WebSocket Connected     │                           │             │
│         │◀────────────────────────│                           │             │
│         │                         │                           │             │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        RECOGNITION LOOP                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│         │                         │                           │             │
│         │ Frame Data (WS)         │                           │             │
│         │────────────────────────▶│                           │             │
│         │                         │                           │             │
│         │                    ┌────┴────┐                      │             │
│         │                    │ FR      │                      │             │
│         │                    │ Engine  │                      │             │
│         │                    └────┬────┘                      │             │
│         │                         │                           │             │
│         │                    ┌────┴────┐                      │             │
│         │                    │ Detect  │                      │             │
│         │                    │ Faces   │                      │             │
│         │                    └────┬────┘                      │             │
│         │                         │                           │             │
│         │               ┌─────────┴─────────┐                 │             │
│         │               │ For each face:    │                 │             │
│         │               │ ┌───────────────┐ │                 │             │
│         │               │ │ Anti-Spoofing │ │                 │             │
│         │               │ │    Check      │ │                 │             │
│         │               │ └───────┬───────┘ │                 │             │
│         │               │         │         │                 │             │
│         │               │ ┌───────┴───────┐ │                 │             │
│         │               │ │   Generate    │ │                 │             │
│         │               │ │   Embedding   │ │                 │             │
│         │               │ └───────┬───────┘ │                 │             │
│         │               │         │         │                 │             │
│         │               │ ┌───────┴───────┐ │                 │             │
│         │               │ │ Vector Search │ │                 │             │
│         │               │ │  (Matching)   │ │                 │             │
│         │               │ └───────┬───────┘ │                 │             │
│         │               └─────────┼─────────┘                 │             │
│         │                         │                           │             │
│         │                         │ Match Results             │             │
│         │                         │                           │             │
│         │              ┌──────────┴──────────┐                │             │
│         │              │                     │                │             │
│         │              ▼                     ▼                │             │
│         │       ┌────────────┐        ┌────────────┐         │             │
│         │       │   Match    │        │  No Match  │         │             │
│         │       │   Found    │        │  (Unknown) │         │             │
│         │       └─────┬──────┘        └─────┬──────┘         │             │
│         │             │                     │                │             │
│         │             │ Save Attendance     │ Log Alert      │             │
│         │             │────────────────────────────────────▶ │             │
│         │             │                     │                │             │
│         │◀────────────┴─────────────────────┘                │             │
│         │ Recognition Result (WS)                            │             │
│         │                                                    │             │
│         │ ◀──────────────── LOOP ──────────────────▶        │             │
│         │                                                    │             │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        TERMINATION PHASE                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│         │                         │                           │             │
│         │ End Session             │                           │             │
│         │────────────────────────▶│                           │             │
│         │                         │                           │             │
│         │                         │ Mark absent students      │             │
│         │                         │──────────────────────────▶│             │
│         │                         │                           │             │
│         │                         │ Finalize session record   │             │
│         │                         │──────────────────────────▶│             │
│         │                         │                           │             │
│         │ Session Summary         │                           │             │
│         │◀────────────────────────│                           │             │
│         │                         │                           │             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 17. Additional Technical Specifications

### 17.1 API Rate Limiting Configuration

| Endpoint Category | Rate Limit | Window | Burst |
|------------------|------------|--------|-------|
| Authentication | 10 requests | 1 minute | 15 |
| User Management | 100 requests | 1 minute | 150 |
| Attendance Operations | 500 requests | 1 minute | 750 |
| Reporting | 50 requests | 1 minute | 75 |
| File Upload | 20 requests | 1 minute | 30 |
| FR Engine | 1000 requests | 1 minute | 1500 |

### 17.2 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CACHING ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       CACHE LAYERS                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Layer 1: Browser Cache (Client-side)                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Static assets (JS, CSS, images): 7 days                          │   │
│  │  • API responses: Based on Cache-Control headers                    │   │
│  │  • Service Worker cache for PWA                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Layer 2: CDN Cache (Edge)                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Static assets: 30 days                                           │   │
│  │  • HTML pages: 1 hour                                               │   │
│  │  • Geographic distribution                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Layer 3: Application Cache (Redis)                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Session data: 30 minutes sliding                                 │   │
│  │  • User profiles: 5 minutes                                         │   │
│  │  • Course data: 10 minutes                                          │   │
│  │  • Face embeddings: Session duration                                │   │
│  │  • API rate limiting counters: Per endpoint                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Layer 4: Database Query Cache                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Query result caching: Query-specific TTL                         │   │
│  │  • Prepared statement caching                                       │   │
│  │  • Connection pooling                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  CACHE INVALIDATION STRATEGIES:                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Time-based expiration (TTL)                                      │   │
│  │  • Event-driven invalidation (pub/sub)                              │   │
│  │  • Write-through caching for critical data                          │   │
│  │  • Cache-aside pattern for read-heavy data                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 17.3 Monitoring and Observability

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MONITORING INFRASTRUCTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         METRICS COLLECTION                            │ │
│  │                                                                       │ │
│  │  Application Metrics (Prometheus)                                    │ │
│  │  ├─ Request count, latency, error rate                               │ │
│  │  ├─ Active sessions, concurrent users                                │ │
│  │  ├─ FR processing time, accuracy                                     │ │
│  │  └─ Queue depth, worker utilization                                  │ │
│  │                                                                       │ │
│  │  Infrastructure Metrics                                              │ │
│  │  ├─ CPU, Memory, Disk, Network                                       │ │
│  │  ├─ Container health, pod restarts                                   │ │
│  │  ├─ Database connections, query time                                 │ │
│  │  └─ Cache hit/miss ratio                                             │ │
│  │                                                                       │ │
│  │  Business Metrics                                                    │ │
│  │  ├─ Daily active users                                               │ │
│  │  ├─ Attendance sessions completed                                    │ │
│  │  ├─ Recognition success rate                                         │ │
│  │  └─ Manual override frequency                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         LOGGING PIPELINE                              │ │
│  │                                                                       │ │
│  │  Application ──▶ Fluentd ──▶ Elasticsearch ──▶ Kibana               │ │
│  │                                                                       │ │
│  │  Log Levels:                                                         │ │
│  │  ├─ ERROR: System errors, exceptions                                 │ │
│  │  ├─ WARN: Potential issues, degraded performance                     │ │
│  │  ├─ INFO: Business events, state changes                             │ │
│  │  ├─ DEBUG: Detailed diagnostic information                           │ │
│  │  └─ TRACE: Very detailed tracing (dev only)                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         ALERTING RULES                                │ │
│  │                                                                       │ │
│  │  Critical Alerts (PagerDuty):                                        │ │
│  │  ├─ Service unavailable > 1 minute                                   │ │
│  │  ├─ Error rate > 5% for 5 minutes                                    │ │
│  │  ├─ Database connection failures                                     │ │
│  │  └─ Security incidents detected                                      │ │
│  │                                                                       │ │
│  │  Warning Alerts (Slack/Email):                                       │ │
│  │  ├─ Response time > 1s (95th percentile)                             │ │
│  │  ├─ CPU/Memory > 80%                                                 │ │
│  │  ├─ FR accuracy < 98%                                                │ │
│  │  └─ Disk usage > 70%                                                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 17.4 Security Testing Requirements

| Test Type | Frequency | Tools | Responsible |
|-----------|-----------|-------|-------------|
| SAST (Static Analysis) | Every commit | SonarQube, Semgrep | CI/CD Pipeline |
| DAST (Dynamic Analysis) | Weekly | OWASP ZAP | Security Team |
| Dependency Scanning | Daily | Snyk, Dependabot | CI/CD Pipeline |
| Penetration Testing | Quarterly | Manual + Burp Suite | External Vendor |
| Security Audit | Annually | Manual review | External Auditor |
| Compliance Scan | Monthly | Custom scripts | Compliance Team |

### 17.5 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CI/CD PIPELINE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  Code   │    │  Build  │    │  Test   │    │ Security│    │  Deploy │  │
│  │  Push   │───▶│  Stage  │───▶│  Stage  │───▶│  Stage  │───▶│  Stage  │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│       │              │              │              │              │        │
│       ▼              ▼              ▼              ▼              ▼        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Lint    │    │ Compile │    │ Unit    │    │ SAST    │    │ Staging │  │
│  │ Check   │    │ Code    │    │ Tests   │    │ Scan    │    │ Deploy  │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│       │              │              │              │              │        │
│       ▼              ▼              ▼              ▼              ▼        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Commit  │    │ Build   │    │ Integ   │    │ Deps    │    │ Smoke   │  │
│  │ Lint    │    │ Docker  │    │ Tests   │    │ Scan    │    │ Tests   │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                      │              │              │              │        │
│                      ▼              ▼              ▼              ▼        │
│                 ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│                 │ Push to │    │ E2E     │    │ License │    │ Prod    │  │
│                 │Registry │    │ Tests   │    │ Check   │    │ Deploy  │  │
│                 └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                                    │        │
│                                                                    ▼        │
│                                                              ┌─────────┐   │
│                                                              │Blue/Green│   │
│                                                              │Deployment│   │
│                                                              └─────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 18. Testing Strategy

### 18.1 Test Coverage Requirements

| Component | Unit Test | Integration Test | E2E Test |
|-----------|-----------|-----------------|----------|
| Auth Service | 90% | 80% | 70% |
| User Service | 85% | 75% | 65% |
| Attendance Service | 90% | 85% | 80% |
| FR Engine | 95% | 90% | 85% |
| Frontend Components | 80% | 70% | 60% |

### 18.2 Test Scenarios for Facial Recognition

| Scenario | Expected Outcome | Priority |
|----------|------------------|----------|
| Single face, good lighting | 100% recognition | Critical |
| Multiple faces (up to 20) | >98% recognition | Critical |
| Partial face occlusion | Graceful degradation | High |
| Poor lighting conditions | Warning + manual fallback | High |
| Photo spoofing attempt | Detection + rejection | Critical |
| Video replay attack | Detection + rejection | Critical |
| 3D mask attack | Detection + rejection | Critical |
| Twin/similar face | Require manual verification | Medium |
| Face at extreme angle | Request repositioning | Medium |
| Moving subject | Track and recognize | High |

---

## 19. Localization and Accessibility

### 19.1 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English (US) | en-US | Primary |
| English (UK) | en-GB | Supported |
| Spanish | es | Planned |
| French | fr | Planned |
| Arabic | ar | Planned (RTL) |
| Chinese (Simplified) | zh-CN | Planned |

### 19.2 Accessibility Compliance (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|----------------|
| Keyboard Navigation | Full keyboard support |
| Screen Reader | ARIA labels, semantic HTML |
| Color Contrast | Minimum 4.5:1 ratio |
| Text Resize | Supports up to 200% |
| Focus Indicators | Visible focus states |
| Error Identification | Clear error messages |
| Time Limits | Adjustable timeouts |

---

## 20. Future Roadmap

### 20.1 Phase 2 Features (6-12 months)

- Student self-service portal
- Mobile native applications (iOS/Android)
- Advanced analytics with ML predictions
- Parent/guardian portal
- Automated absence notifications
- Integration with campus card systems

### 20.2 Phase 3 Features (12-18 months)

- Multi-modal biometrics (voice, gait)
- Behavioral analytics
- Predictive attendance modeling
- Smart classroom integration
- IoT sensor integration
- AI-powered intervention recommendations

---

**End of Document**

---

*This document is confidential and intended for internal use only. Distribution outside the organization requires written approval from the project stakeholders.*