# SAMS Project Development Rules & Guidelines
# Coding Standards, Best Practices, and Project Conventions

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Applies To:** All SAMS Development Teams

---

## Table of Contents

1. [General Principles](#1-general-principles)
2. [Code Formatting Rules](#2-code-formatting-rules)
3. [Naming Conventions](#3-naming-conventions)
4. [TypeScript/JavaScript Standards](#4-typescriptjavascript-standards)
5. [React Guidelines](#5-react-guidelines)
6. [Node.js Backend Standards](#6-nodejs-backend-standards)
7. [Python Standards](#7-python-standards)
8. [Database Guidelines](#8-database-guidelines)
9. [API Design Standards](#9-api-design-standards)
10. [Testing Standards](#10-testing-standards)
11. [Documentation Requirements](#11-documentation-requirements)
12. [Git & Version Control](#12-git--version-control)
13. [Security Guidelines](#13-security-guidelines)
14. [Performance Guidelines](#14-performance-guidelines)
15. [Code Review Checklist](#15-code-review-checklist)

---

## 1. General Principles

### 1.1 Core Development Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT PRINCIPLES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. READABILITY FIRST                                           │
│     Code is read more often than written. Prioritize clarity.   │
│                                                                  │
│  2. SINGLE RESPONSIBILITY                                       │
│     Each function, class, module should do one thing well.      │
│                                                                  │
│  3. DRY (Don't Repeat Yourself)                                 │
│     Extract reusable code into functions, utilities, hooks.     │
│                                                                  │
│  4. KISS (Keep It Simple, Stupid)                               │
│     Simple solutions are preferred over clever ones.            │
│                                                                  │
│  5. YAGNI (You Aren't Gonna Need It)                           │
│     Don't implement features until they're actually needed.     │
│                                                                  │
│  6. FAIL FAST                                                   │
│     Validate inputs early and throw errors immediately.         │
│                                                                  │
│  7. DEFENSIVE PROGRAMMING                                       │
│     Never trust external input. Always validate and sanitize.   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Code Quality Standards

| Metric | Target | Tool |
|--------|--------|------|
| Code Coverage | ≥80% | Jest/pytest |
| Cyclomatic Complexity | ≤10 | ESLint/SonarQube |
| Maintainability Index | ≥65 | SonarQube |
| Technical Debt Ratio | ≤5% | SonarQube |
| Duplicated Lines | ≤3% | SonarQube |

### 1.3 Language Usage by Component

| Component | Primary Language | Strict Mode |
|-----------|-----------------|-------------|
| Web Frontend | TypeScript | Required |
| API Backend | TypeScript | Required |
| FR Engine | Python 3.11+ | Type hints required |
| Database Scripts | SQL | N/A |
| Infrastructure | YAML/HCL | N/A |

---

## 2. Code Formatting Rules

### 2.1 Universal Formatting

| Rule | Value | Applies To |
|------|-------|------------|
| Indentation | 2 spaces | TS/JS/JSON/YAML |
| Indentation | 4 spaces | Python |
| Max Line Length | 100 characters | All |
| End of File | Single newline | All |
| Trailing Whitespace | Not allowed | All |
| Trailing Commas | Required | TS/JS/JSON |

### 2.2 TypeScript/JavaScript Formatting

```typescript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

```typescript
// .eslintrc.js - Key Rules
module.exports = {
  rules: {
    // Formatting
    'max-len': ['error', { code: 100, ignoreUrls: true }],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'eol-last': ['error', 'always'],
    
    // Best Practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### 2.3 Python Formatting

```python
# pyproject.toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'

[tool.isort]
profile = "black"
line_length = 100

[tool.ruff]
line-length = 100
select = ["E", "F", "W", "I", "N", "B", "A", "C4", "SIM"]
```

### 2.4 Import Organization

**TypeScript/JavaScript:**
```typescript
// Order of imports (enforced by ESLint)
// 1. Node built-in modules
import path from 'path';

// 2. External packages (npm)
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 3. Internal packages (@sams/*)
import { Button } from '@sams/ui-components';

// 4. Relative imports (parent directories first)
import { UserService } from '../../services';
import { formatDate } from '../utils';
import { UserCard } from './UserCard';

// 5. Type imports (separate)
import type { User } from '@sams/types';
```

**Python:**
```python
# Order of imports (enforced by isort)
# 1. Standard library
import os
import sys
from typing import Optional, List

# 2. Third-party packages
import numpy as np
import torch
from fastapi import FastAPI, HTTPException

# 3. Local application imports
from src.detection import FaceDetector
from src.recognition import FaceRecognizer
from src.utils import process_image
```

---

## 3. Naming Conventions

### 3.1 General Naming Rules

| Element | Convention | Example |
|---------|------------|---------|
| Files (TS/JS) | camelCase or PascalCase | `userService.ts`, `UserCard.tsx` |
| Files (Python) | snake_case | `face_detector.py` |
| Files (Test) | `*.test.ts` or `*_test.py` | `user.test.ts`, `face_detector_test.py` |
| Directories | kebab-case | `user-management/` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Environment Variables | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

### 3.2 TypeScript/JavaScript Naming

```typescript
// ✅ CORRECT Naming Examples

// Variables and Functions: camelCase
const userName = 'John';
const isActive = true;
function getUserById(id: string) {}
const calculateAttendanceRate = () => {};

// Classes and Types: PascalCase
class UserService {}
interface UserResponse {}
type AttendanceStatus = 'present' | 'absent';

// React Components: PascalCase
function UserCard() {}
const AttendanceList: React.FC = () => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_FACE_DETECTION_TIME = 500;
const API_BASE_URL = '/api/v1';

// Enums: PascalCase with PascalCase members
enum AttendanceStatus {
  Present = 'PRESENT',
  Absent = 'ABSENT',
  Late = 'LATE',
}

// Boolean variables: use is/has/can/should prefix
const isLoading = false;
const hasPermission = true;
const canEdit = user.role === 'admin';
const shouldRefetch = data.stale;

// Event handlers: use handle prefix
const handleClick = () => {};
const handleSubmit = (e: FormEvent) => {};
const handleUserCreate = (user: User) => {};

// Hooks: use 'use' prefix
function useAuth() {}
function useAttendanceData() {}

// ❌ INCORRECT Naming Examples
const user_name = 'John';        // Use camelCase
const ISACTIVE = true;           // Use camelCase for variables
function GetUserById() {}        // Use camelCase for functions
class user_service {}            // Use PascalCase for classes
```

### 3.3 Python Naming

```python
# ✅ CORRECT Naming Examples

# Variables and Functions: snake_case
user_name = "John"
is_active = True

def get_user_by_id(user_id: str) -> User:
    pass

def calculate_attendance_rate(records: List[Record]) -> float:
    pass

# Classes: PascalCase
class UserService:
    pass

class FaceDetector:
    pass

# Constants: SCREAMING_SNAKE_CASE
MAX_FACE_DETECTION_TIME = 500
API_BASE_URL = "/api/v1"

# Private methods/variables: single underscore prefix
class FaceRecognizer:
    def __init__(self):
        self._model = None  # Private attribute
    
    def _preprocess_image(self, image):  # Private method
        pass
    
    def recognize(self, image):  # Public method
        pass

# Module-level private: single underscore prefix
_internal_cache = {}

# ❌ INCORRECT Naming Examples
userName = "John"              # Use snake_case
def GetUserById(): pass        # Use snake_case
class face_detector: pass      # Use PascalCase
```

### 3.4 Database Naming

```sql
-- Tables: snake_case, plural
CREATE TABLE users (...);
CREATE TABLE attendance_records (...);
CREATE TABLE face_embeddings (...);

-- Columns: snake_case
CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_address VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Primary Keys: 'id'
-- Foreign Keys: referenced_table_id (singular)
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    session_id UUID REFERENCES attendance_sessions(id)
);

-- Indexes: idx_tablename_columnname
CREATE INDEX idx_users_email ON users(email_address);
CREATE INDEX idx_records_student ON attendance_records(student_id);

-- Constraints: tablename_constrainttype_columnname
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email_address);
```

---

## 4. TypeScript/JavaScript Standards

### 4.1 Type Safety Rules

```typescript
// ✅ REQUIRED: Explicit return types for functions
function calculateAttendance(records: AttendanceRecord[]): number {
  return records.filter(r => r.status === 'present').length;
}

// ✅ REQUIRED: Define interfaces for objects
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
}

// ✅ REQUIRED: Use type unions for finite options
type UserRole = 'super_admin' | 'admin' | 'lecturer';
type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

// ❌ FORBIDDEN: 'any' type (use 'unknown' if truly unknown)
function processData(data: any) {}  // WRONG
function processData(data: unknown) {}  // CORRECT

// ❌ FORBIDDEN: Non-null assertion without validation
const user = users.find(u => u.id === id)!;  // WRONG
const user = users.find(u => u.id === id);   // CORRECT
if (!user) throw new NotFoundError();

// ✅ REQUIRED: Use strict null checks
// tsconfig.json: "strictNullChecks": true
function getUser(id: string): User | null {
  return users.find(u => u.id === id) ?? null;
}
```

### 4.2 Async/Await Standards

```typescript
// ✅ REQUIRED: Always use async/await over .then()
// CORRECT
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to fetch user');
  }
  return response.json();
}

// ❌ AVOID: Promise chains
function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then(response => response.json());  // Avoid
}

// ✅ REQUIRED: Proper error handling
async function createUser(data: CreateUserDto): Promise<User> {
  try {
    const user = await userService.create(data);
    return user;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new BadRequestError(error.message);
    }
    logger.error('Failed to create user', { error, data });
    throw new InternalServerError('User creation failed');
  }
}

// ✅ REQUIRED: Use Promise.all for parallel operations
async function loadDashboardData(userId: string) {
  const [user, courses, attendance] = await Promise.all([
    userService.findById(userId),
    courseService.findByLecturer(userId),
    attendanceService.getRecentByLecturer(userId),
  ]);
  return { user, courses, attendance };
}
```

### 4.3 Error Handling

```typescript
// ✅ REQUIRED: Custom error classes
class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, 'NOT_FOUND', `${resource} with id ${id} not found`);
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly errors: Record<string, string[]>,
  ) {
    super(400, 'VALIDATION_ERROR', message);
  }
}

// ✅ REQUIRED: Always catch and handle errors appropriately
async function getUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User', req.params.id);
    }
    res.json(user);
  } catch (error) {
    next(error);  // Pass to error handling middleware
  }
}
```

---

## 5. React Guidelines

### 5.1 Component Structure

```typescript
// ✅ REQUIRED: Standard component structure

// 1. Imports (organized as per Section 2.4)
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button } from '@mui/material';

import { useAuth } from '@sams/hooks';
import { UserCard } from './UserCard';
import type { User } from '@sams/types';

// 2. Type definitions
interface UserListProps {
  departmentId: string;
  onUserSelect: (user: User) => void;
  className?: string;
}

// 3. Component definition
export function UserList({ departmentId, onUserSelect, className }: UserListProps) {
  // 3.1 Hooks (in consistent order)
  const { user: currentUser } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 3.2 Data fetching hooks
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', departmentId],
    queryFn: () => fetchUsersByDepartment(departmentId),
  });
  
  // 3.3 Callbacks and handlers
  const handleUserClick = useCallback((user: User) => {
    setSelectedId(user.id);
    onUserSelect(user);
  }, [onUserSelect]);
  
  // 3.4 Effects
  useEffect(() => {
    // Effect logic
  }, [departmentId]);
  
  // 3.5 Early returns for loading/error states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!users?.length) return <EmptyState message="No users found" />;
  
  // 3.6 Main render
  return (
    <Box className={className}>
      <Typography variant="h6">Users</Typography>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          isSelected={user.id === selectedId}
          onClick={() => handleUserClick(user)}
        />
      ))}
    </Box>
  );
}

// 4. Default export (if needed)
export default UserList;
```

### 5.2 Hooks Rules

```typescript
// ✅ REQUIRED: Custom hooks for reusable logic
function useAttendanceSession(sessionId: string) {
  const queryClient = useQueryClient();
  
  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => attendanceApi.getSession(sessionId),
  });
  
  const startSession = useMutation({
    mutationFn: attendanceApi.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries(['session', sessionId]);
    },
  });
  
  return {
    session,
    isLoading,
    startSession: startSession.mutate,
    isStarting: startSession.isLoading,
  };
}

// ✅ REQUIRED: Memoization for expensive computations
function AttendanceStats({ records }: { records: AttendanceRecord[] }) {
  const stats = useMemo(() => {
    return {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      rate: calculateAttendanceRate(records),
    };
  }, [records]);
  
  return <StatsDisplay stats={stats} />;
}

// ✅ REQUIRED: useCallback for callback props
function ParentComponent() {
  const handleSelect = useCallback((id: string) => {
    // Handle selection
  }, []);
  
  return <ChildComponent onSelect={handleSelect} />;
}

// ❌ FORBIDDEN: Hooks inside conditions or loops
function BadComponent({ showUsers }: { showUsers: boolean }) {
  if (showUsers) {
    const users = useUsers();  // WRONG: Hook inside condition
  }
}
```

### 5.3 State Management Rules

```typescript
// ✅ REQUIRED: Use appropriate state level

// Local UI state: useState
const [isOpen, setIsOpen] = useState(false);

// Complex local state: useReducer
const [state, dispatch] = useReducer(formReducer, initialState);

// Server state: React Query
const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// Global app state: Redux Toolkit (for cross-cutting concerns only)
// - Current user/auth state
// - Theme/preferences
// - Global notifications

// ❌ AVOID: Putting server data in Redux
// Use React Query instead for server state
```

### 5.4 Component File Organization

```
components/
├── UserList/
│   ├── index.ts              # Re-exports
│   ├── UserList.tsx          # Main component
│   ├── UserList.test.tsx     # Tests
│   ├── UserList.styles.ts    # Styled components (if needed)
│   ├── UserListItem.tsx      # Sub-component
│   └── useUserList.ts        # Component-specific hook
├── common/
│   ├── Button/
│   ├── Card/
│   └── Modal/
└── layouts/
    ├── DashboardLayout/
    └── AuthLayout/
```

---

## 6. Node.js Backend Standards

### 6.1 Project Structure

```
src/
├── config/                 # Configuration files
│   ├── index.ts
│   ├── database.ts
│   └── auth.ts
├── modules/                # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   ├── auth.types.ts
│   │   └── __tests__/
│   ├── users/
│   ├── students/
│   ├── attendance/
│   └── reports/
├── middleware/             # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── validation.middleware.ts
│   └── rateLimit.middleware.ts
├── utils/                  # Shared utilities
│   ├── logger.ts
│   ├── encryption.ts
│   └── pagination.ts
├── types/                  # Shared types
│   ├── express.d.ts
│   └── index.ts
├── app.ts                  # Express app setup
└── server.ts               # Server entry point
```

### 6.2 Controller Pattern

```typescript
// ✅ REQUIRED: Controller structure
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.types';
import { NotFoundError } from '@/utils/errors';

export class UserController {
  constructor(private readonly userService: UserService) {}

  // List with pagination
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const result = await this.userService.findAll({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get single resource
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
        throw new NotFoundError('User', req.params.id);
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  // Create resource
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateUserDto = req.body;
      const user = await this.userService.create(dto, req.user!.id);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  // Update resource
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: UpdateUserDto = req.body;
      const user = await this.userService.update(req.params.id, dto);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  // Delete resource
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
```

### 6.3 Service Pattern

```typescript
// ✅ REQUIRED: Service structure
import { PrismaClient } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserWithRelations } from './user.types';
import { hashPassword } from '@/utils/encryption';
import { ConflictError, NotFoundError } from '@/utils/errors';

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedResult<User>> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async create(dto: CreateUserDto, createdBy: string): Promise<User> {
    // Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    return this.prisma.user.create({
      data: {
        ...dto,
        passwordHash: await hashPassword(dto.password),
        createdBy,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
```

### 6.4 Validation with Zod

```typescript
// ✅ REQUIRED: Use Zod for validation
import { z } from 'zod';

// Schema definitions
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['admin', 'lecturer']),
  departmentId: z.string().uuid(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Type inference
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// Validation middleware
export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Validation failed', error.flatten().fieldErrors));
      }
      next(error);
    }
  };
}
```

---

## 7. Python Standards

### 7.1 Project Structure

```
src/
├── api/                    # FastAPI routes
│   ├── __init__.py
│   ├── routes.py
│   └── dependencies.py
├── detection/              # Face detection module
│   ├── __init__.py
│   ├── detector.py
│   └── models.py
├── recognition/            # Face recognition module
│   ├── __init__.py
│   ├── recognizer.py
│   └── embedding.py
├── antispoof/              # Anti-spoofing module
│   ├── __init__.py
│   ├── liveness.py
│   └── texture.py
├── models/                 # Pydantic models
│   ├── __init__.py
│   ├── requests.py
│   └── responses.py
├── utils/                  # Utilities
│   ├── __init__.py
│   ├── image.py
│   └── logging.py
├── config.py               # Configuration
└── main.py                 # Application entry
```

### 7.2 Type Hints

```python
# ✅ REQUIRED: Type hints for all functions
from typing import Optional, List, Dict, Tuple, Union
from dataclasses import dataclass
import numpy as np
from numpy.typing import NDArray

# Type aliases for clarity
Embedding = NDArray[np.float32]
BoundingBox = Tuple[int, int, int, int]
ImageArray = NDArray[np.uint8]

@dataclass
class DetectionResult:
    bbox: BoundingBox
    confidence: float
    landmarks: Optional[NDArray[np.float32]] = None

class FaceDetector:
    def __init__(self, model_path: str, confidence_threshold: float = 0.95) -> None:
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self._model: Optional[torch.nn.Module] = None
    
    def detect(self, image: ImageArray) -> List[DetectionResult]:
        """
        Detect faces in the given image.
        
        Args:
            image: Input image as numpy array (H, W, C) in RGB format.
        
        Returns:
            List of detection results with bounding boxes and confidences.
        
        Raises:
            ValueError: If image format is invalid.
        """
        if image.ndim != 3 or image.shape[2] != 3:
            raise ValueError(f"Expected RGB image (H, W, 3), got {image.shape}")
        
        # Detection logic...
        return results
    
    def _preprocess(self, image: ImageArray) -> torch.Tensor:
        """Preprocess image for model input."""
        # Preprocessing logic...
        pass
```

### 7.3 Pydantic Models

```python
# ✅ REQUIRED: Use Pydantic for API models
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum
from datetime import datetime

class RecognitionStatus(str, Enum):
    MATCHED = "matched"
    NOT_MATCHED = "not_matched"
    SPOOF_DETECTED = "spoof_detected"
    LOW_QUALITY = "low_quality"

class FaceRecognitionRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image")
    session_id: str = Field(..., description="Attendance session ID")
    threshold: float = Field(default=0.45, ge=0.0, le=1.0)
    
    @validator("image_base64")
    def validate_image(cls, v: str) -> str:
        if len(v) > 10_000_000:  # 10MB limit
            raise ValueError("Image too large")
        return v

class FaceRecognitionResponse(BaseModel):
    status: RecognitionStatus
    student_id: Optional[str] = None
    confidence: Optional[float] = None
    processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    model_loaded: bool
    gpu_available: bool
```

### 7.4 Error Handling

```python
# ✅ REQUIRED: Custom exceptions
from fastapi import HTTPException, status

class FREngineError(Exception):
    """Base exception for FR engine errors."""
    pass

class ModelNotLoadedError(FREngineError):
    """Raised when model is not loaded."""
    pass

class ImageProcessingError(FREngineError):
    """Raised when image processing fails."""
    pass

class SpoofDetectedError(FREngineError):
    """Raised when spoofing attempt is detected."""
    pass

# Exception handlers for FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse

async def fr_engine_exception_handler(request: Request, exc: FREngineError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": exc.__class__.__name__,
            "message": str(exc),
        },
    )

# Usage in routes
@router.post("/recognize")
async def recognize_face(request: FaceRecognitionRequest) -> FaceRecognitionResponse:
    try:
        result = await recognizer.recognize(request.image_base64)
        return result
    except SpoofDetectedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Spoofing attempt detected",
        )
    except ImageProcessingError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image: {e}",
        )
```

---

## 8. Database Guidelines

### 8.1 Migration Rules

```sql
-- ✅ REQUIRED: Migration file naming
-- Format: YYYYMMDDHHMMSS_description.sql
-- Example: 20260223120000_create_users_table.sql

-- ✅ REQUIRED: Always include rollback
-- Up migration
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Down migration (in separate file or marked section)
DROP TABLE IF EXISTS users;
```

### 8.2 Query Guidelines

```typescript
// ✅ REQUIRED: Use parameterized queries (Prisma handles this)
const user = await prisma.user.findUnique({
  where: { email: userEmail },  // Safe
});

// ❌ FORBIDDEN: String interpolation in queries
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}  // Use tagged template
`;

// ✅ REQUIRED: Use transactions for related operations
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.auditLog.create({
    data: {
      action: 'USER_CREATED',
      userId: user.id,
      performedBy: currentUserId,
    },
  });
  return user;
});

// ✅ REQUIRED: Optimize queries with select/include
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    // Don't select passwordHash
  },
  include: {
    department: {
      select: { name: true },
    },
  },
});
```

### 8.3 Index Guidelines

```sql
-- ✅ REQUIRED: Index foreign keys
CREATE INDEX idx_attendance_records_session_id 
  ON attendance_records(session_id);

-- ✅ REQUIRED: Index frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_student_id ON students(student_id);

-- ✅ REQUIRED: Composite indexes for common query patterns
CREATE INDEX idx_records_session_status 
  ON attendance_records(session_id, status);

-- ✅ REQUIRED: Partial indexes for filtered queries
CREATE INDEX idx_users_active 
  ON users(email) WHERE status = 'active';
```

---

## 9. API Design Standards

### 9.1 RESTful Conventions

| Action | Method | Endpoint | Response |
|--------|--------|----------|----------|
| List | GET | `/api/v1/users` | 200 + array |
| Get | GET | `/api/v1/users/:id` | 200 + object |
| Create | POST | `/api/v1/users` | 201 + object |
| Update | PUT | `/api/v1/users/:id` | 200 + object |
| Partial Update | PATCH | `/api/v1/users/:id` | 200 + object |
| Delete | DELETE | `/api/v1/users/:id` | 204 |

### 9.2 Response Format

```typescript
// ✅ REQUIRED: Consistent response format

// Success response (single item)
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John"
  }
}

// Success response (list with pagination)
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Must be at least 12 characters"]
    }
  }
}
```

### 9.3 Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE |
| 400 | Bad request / Validation error |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable entity |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 10. Testing Standards

### 10.1 Test File Organization

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── user.service.test.ts
│   │   └── attendance.service.test.ts
│   └── utils/
│       └── encryption.test.ts
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   └── users.test.ts
│   └── database/
│       └── migrations.test.ts
└── e2e/
    ├── auth.spec.ts
    └── attendance.spec.ts
```

### 10.2 Test Naming Conventions

```typescript
// ✅ REQUIRED: Descriptive test names
describe('UserService', () => {
  describe('create', () => {
    it('should create a new user with valid data', async () => {});
    it('should throw ConflictError when email already exists', async () => {});
    it('should hash password before storing', async () => {});
  });
  
  describe('findById', () => {
    it('should return user when found', async () => {});
    it('should return null when user does not exist', async () => {});
  });
});

// ❌ AVOID: Vague test names
it('works', () => {});
it('test 1', () => {});
it('should work correctly', () => {});
```

### 10.3 Test Structure (AAA Pattern)

```typescript
// ✅ REQUIRED: Arrange-Act-Assert pattern
describe('AttendanceService', () => {
  describe('recordAttendance', () => {
    it('should record attendance for recognized student', async () => {
      // Arrange
      const session = await createTestSession();
      const student = await createTestStudent();
      const recognitionResult = {
        studentId: student.id,
        confidence: 0.95,
      };
      
      // Act
      const record = await attendanceService.recordAttendance(
        session.id,
        recognitionResult,
      );
      
      // Assert
      expect(record).toBeDefined();
      expect(record.studentId).toBe(student.id);
      expect(record.status).toBe('present');
      expect(record.confidence).toBe(0.95);
    });
  });
});
```

### 10.4 Mocking Guidelines

```typescript
// ✅ REQUIRED: Mock external dependencies
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Create mock
const prismaMock = mockDeep<PrismaClient>();

// Setup mock behavior
beforeEach(() => {
  prismaMock.user.findUnique.mockResolvedValue(mockUser);
});

// ✅ REQUIRED: Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// ❌ AVOID: Mocking too much (integration tests should use real DB)
// Use test database for integration tests
```

### 10.5 Python Testing

```python
# ✅ REQUIRED: pytest conventions
import pytest
from unittest.mock import Mock, patch
from src.recognition import FaceRecognizer

class TestFaceRecognizer:
    @pytest.fixture
    def recognizer(self) -> FaceRecognizer:
        return FaceRecognizer(model_path="test_model.onnx")
    
    @pytest.fixture
    def sample_image(self) -> np.ndarray:
        return np.zeros((224, 224, 3), dtype=np.uint8)
    
    def test_recognize_returns_match_for_known_face(
        self,
        recognizer: FaceRecognizer,
        sample_image: np.ndarray,
    ) -> None:
        # Arrange
        recognizer._database = {"student_1": np.random.rand(512)}
        
        # Act
        result = recognizer.recognize(sample_image)
        
        # Assert
        assert result.status == RecognitionStatus.MATCHED
        assert result.student_id == "student_1"
    
    def test_recognize_raises_on_invalid_image(
        self,
        recognizer: FaceRecognizer,
    ) -> None:
        # Arrange
        invalid_image = np.zeros((100,), dtype=np.uint8)  # 1D array
        
        # Act & Assert
        with pytest.raises(ValueError, match="Expected RGB image"):
            recognizer.recognize(invalid_image)
```

---

## 11. Documentation Requirements

### 11.1 Code Comments

```typescript
// ✅ REQUIRED: Document complex logic
/**
 * Calculates the attendance rate for a given set of records.
 * 
 * The rate is calculated as: (present + late) / total * 100
 * Late arrivals are counted as partial attendance (0.5 weight).
 * 
 * @param records - Array of attendance records
 * @returns Attendance rate as percentage (0-100)
 */
function calculateAttendanceRate(records: AttendanceRecord[]): number {
  const total = records.length;
  if (total === 0) return 0;
  
  const present = records.filter(r => r.status === 'present').length;
  const late = records.filter(r => r.status === 'late').length;
  
  // Late arrivals count as 0.5 attendance
  const effectivePresent = present + (late * 0.5);
  
  return (effectivePresent / total) * 100;
}

// ❌ AVOID: Obvious comments
// Increment counter
counter++; // This is unnecessary

// ✅ REQUIRED: Document why, not what
// Use batch size of 50 to avoid memory issues with large face databases
const BATCH_SIZE = 50;
```

### 11.2 API Documentation

```typescript
// ✅ REQUIRED: OpenAPI/Swagger documentation
/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/users', authenticate, userController.getAll);
```

### 11.3 README Requirements

Each module/service should have a README with:
- Purpose and scope
- Setup instructions
- Configuration options
- API reference (or link to docs)
- Examples

---

## 12. Git & Version Control

### 12.1 Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/attendance-session` |
| Bug Fix | `fix/description` | `fix/login-redirect` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Release | `release/version` | `release/v1.2.0` |
| Chore | `chore/description` | `chore/update-deps` |

### 12.2 Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(auth): implement MFA with TOTP support

- Add TOTP secret generation
- Add QR code generation for authenticator apps
- Add backup codes generation

Closes #123
```

```
fix(attendance): correct late status calculation

Previously, students arriving within grace period were marked
as late. Now they are correctly marked as present.

Fixes #456
```

### 12.3 Pull Request Guidelines

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded secrets
```

---

## 13. Security Guidelines

### 13.1 Input Validation

```typescript
// ✅ REQUIRED: Validate all user input
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Strict validation schemas
const userInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[\w\s-]+$/),
});

// Sanitize HTML content (if ever needed)
const sanitizedContent = DOMPurify.sanitize(userContent);

// ❌ FORBIDDEN: Trust user input
const query = `SELECT * FROM users WHERE id = '${req.params.id}'`; // SQL Injection!
```

### 13.2 Authentication Security

```typescript
// ✅ REQUIRED: Secure password handling
import argon2 from 'argon2';

// Hash passwords with Argon2id
async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

// ❌ FORBIDDEN: Weak hashing
import md5 from 'md5';
const hash = md5(password); // NEVER use MD5 for passwords

// ✅ REQUIRED: Secure session tokens
import crypto from 'crypto';
const sessionToken = crypto.randomBytes(32).toString('hex');

// ❌ FORBIDDEN: Predictable tokens
const token = Date.now().toString(); // Predictable!
```

### 13.3 Secrets Management

```typescript
// ✅ REQUIRED: Use environment variables
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

// ✅ REQUIRED: Validate required env vars at startup
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// ❌ FORBIDDEN: Hardcoded secrets
const jwtSecret = 'my-secret-key'; // NEVER commit secrets!
const apiKey = '12345'; // NEVER hardcode API keys!
```

### 13.4 Data Protection

```typescript
// ✅ REQUIRED: Encrypt sensitive data at rest
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encrypt(text: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
    tag: tag.toString('hex'),
  };
}

// ✅ REQUIRED: Mask sensitive data in logs
logger.info('User login', {
  email: maskEmail(user.email), // john***@example.com
  ip: req.ip,
});

// ❌ FORBIDDEN: Log sensitive data
logger.info('User login', { password: user.password }); // NEVER log passwords!
```

---

## 14. Performance Guidelines

### 14.1 Database Optimization

```typescript
// ✅ REQUIRED: Use pagination for large datasets
async function getUsers(page: number, limit: number) {
  return prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
}

// ✅ REQUIRED: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    // Don't select large fields like profile images
  },
});

// ✅ REQUIRED: Use batch operations
await prisma.attendanceRecord.createMany({
  data: records,
  skipDuplicates: true,
});

// ❌ AVOID: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  const department = await prisma.department.findUnique({
    where: { id: user.departmentId },
  }); // N+1 problem!
}

// ✅ CORRECT: Use includes
const users = await prisma.user.findMany({
  include: { department: true },
});
```

### 14.2 Caching Strategy

```typescript
// ✅ REQUIRED: Cache expensive operations
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const CACHE_TTL = 300; // 5 minutes

async function getUserWithCache(id: string): Promise<User | null> {
  const cacheKey = `user:${id}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const user = await prisma.user.findUnique({ where: { id } });
  
  // Cache result
  if (user) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(user));
  }
  
  return user;
}

// ✅ REQUIRED: Invalidate cache on updates
async function updateUser(id: string, data: UpdateUserDto): Promise<User> {
  const user = await prisma.user.update({ where: { id }, data });
  await redis.del(`user:${id}`); // Invalidate cache
  return user;
}
```

### 14.3 Frontend Performance

```typescript
// ✅ REQUIRED: Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

// ✅ REQUIRED: Memoize expensive renders
const ExpensiveComponent = memo(({ data }: Props) => {
  const processedData = useMemo(() => processData(data), [data]);
  return <DataTable data={processedData} />;
});

// ✅ REQUIRED: Virtual lists for large datasets
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeList({ items }: { items: Item[] }) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  // ...
}

// ❌ AVOID: Rendering large lists directly
{items.map(item => <Item key={item.id} {...item} />)} // Will be slow for 1000+ items
```

---

## 15. Code Review Checklist

### 15.1 General Checklist

```
□ Code compiles without errors or warnings
□ All tests pass
□ No console.log or debug statements
□ No commented-out code
□ No hardcoded values (use constants/config)
□ No security vulnerabilities (secrets, SQL injection, XSS)
□ Error handling is appropriate
□ Edge cases are handled
□ Code follows naming conventions
□ Code is properly formatted
```

### 15.2 TypeScript/JavaScript Checklist

```
□ No 'any' types (use 'unknown' if needed)
□ No type assertions without validation
□ Async/await used correctly
□ Promises have error handling
□ No memory leaks (cleanup in useEffect)
□ Dependencies in useEffect are correct
□ No unnecessary re-renders
```

### 15.3 API Checklist

```
□ Input validation implemented
□ Authentication/authorization checked
□ Rate limiting considered
□ Response format is consistent
□ Error responses are informative
□ API documentation updated
□ Backward compatibility maintained
```

### 15.4 Database Checklist

```
□ Migrations are reversible
□ Indexes added for query patterns
□ Foreign keys have ON DELETE actions
□ Transactions used for related operations
□ N+1 queries avoided
□ Sensitive data is encrypted
```

---

## Appendix: Editor Configuration

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

### Recommended Extensions

- ESLint
- Prettier
- TypeScript Importer
- GitLens
- Error Lens
- Thunder Client (API testing)
- Python (for FR engine)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 23, 2026 | Development Team | Initial version |

---

*These guidelines are mandatory for all code contributions to the SAMS project. Violations will be flagged during code review.*
