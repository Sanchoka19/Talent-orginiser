# Server-Side Implementation Roadmap & Task Tracker

This document tracks all completed features, active gaps, and pending implementation tasks for the NestJS backend API (`@talent/api`) and its integration with the Next.js frontend (`@talent/web`).

---

## Current Status Overview

| Area | Status | Notes |
| :--- | :---: | :--- |
| **Monorepo Setup** | Completed | pnpm workspaces + Turborepo pipeline |
| **Prisma Schema** | Completed | 540+ lines covering Multi-tenancy, RBAC, Roster, Schedules, Duties, Inventory |
| **Core CRUD Modules** | Completed | Talents, Groups, Venues, Schedules, Duties, Inventory, Users, Roles |
| **Rotation & Fairness Math** | Completed | Coefficient of Variation (CV) engine, cycle keys, conflict detection |
| **Authentication & RBAC** | Pending | `AuthModule` is currently an empty shell |
| **CORS & Network Security** | Pending | CORS disabled; blocks cross-origin requests from frontend |
| **Document Management** | Pending | `TalentDocument` has no upload/management endpoints |
| **Attendance & Check-in** | Pending | `AttendanceStatus` has no check-in endpoints |
| **Frontend API Bridge** | Pending | Next.js `AppContext` still uses `localStorage` |

---

## Phase 1: Critical Server Blockers (Immediate)

- [ ] **1.1 Enable CORS for Frontend Communication**
  - [ ] Add `app.enableCors()` in `apps/api/src/configure-app.ts`.
  - [ ] Allow origins from `process.env.FRONTEND_URL || 'http://localhost:3000'` (and `http://localhost:3001`).
  - [ ] Support credentials, headers (`Content-Type`, `Authorization`), and methods (`GET`, `POST`, `PATCH`, `DELETE`).

- [ ] **1.2 Complete Authentication Module (`AuthModule`)**
  - [ ] Install `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt` (and types).
  - [ ] Implement password hashing in `UsersService` and `AuthService` using `bcrypt`.
  - [ ] Implement `POST /api/v1/auth/login`:
    - Validates email and password against `User` table.
    - Creates or updates `UserSession`.
    - Returns JWT access token and user profile.
  - [ ] Implement `POST /api/v1/auth/register` (or workspace invite acceptance).
  - [ ] Implement `POST /api/v1/auth/logout` (invalidates session token).
  - [ ] Implement `GET /api/v1/auth/me` (returns current user profile, role, and permissions).

- [ ] **1.3 Authentication Guards & Decorators**
  - [ ] Create `JwtAuthGuard` and `JwtStrategy` in `apps/api/src/common/guards/`.
  - [ ] Create `@CurrentUser()` parameter decorator to extract the authenticated user.
  - [ ] Create `@Roles()` and `@Permissions()` decorators with `RolesGuard` for RBAC enforcement.

---

## Phase 2: Missing Business Logic & Endpoints

- [ ] **2.1 Talent Document Management (`TalentDocument`)**
  - [ ] Support file upload middleware (Multer for local disk or S3 presigned URLs).
  - [ ] Implement `POST /api/v1/talents/:id/documents` (upload passport, visa, contract, ID, medical).
  - [ ] Implement `GET /api/v1/talents/:id/documents` (list documents with expiry dates).
  - [ ] Implement `DELETE /api/v1/talents/documents/:docId` (remove document and file).
  - [ ] Add automated expiry alerts query (e.g. contracts/visas expiring within 30 days).

- [ ] **2.2 Live Show Attendance & Check-in**
  - [ ] Implement `PATCH /api/v1/schedules/:showId/attendance`:
    - Records `PRESENT`, `ABSENT`, `EXCUSED`, or `LATE` for performers on duty assignments.
  - [ ] Implement `GET /api/v1/schedules/:showId/attendance-summary`:
    - Returns roster attendance stats for stage managers.

- [ ] **2.3 Multi-Tenant Organization Scoping**
  - [ ] Automatically inject `organizationId` from `@CurrentUser()` instead of relying on client query params.
  - [ ] Prevent cross-organization data access across all service queries.

---

## Phase 3: Server Reliability & Developer Experience

- [ ] **3.1 Global Exception Filter for Prisma**
  - [ ] Create `PrismaExceptionFilter` in `apps/api/src/common/filters/`.
  - [ ] Map Prisma error codes to clean HTTP responses:
    - `P2002` (Unique constraint failed) &rarr; `409 Conflict`.
    - `P2025` (Record not found) &rarr; `404 Not Found`.
    - `P2003` (Foreign key constraint failed) &rarr; `400 Bad Request`.

- [ ] **3.2 Standardized Pagination Response Wrapper**
  - [ ] Create generic `PaginatedResponseDto<T>`:
    ```typescript
    {
      data: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
    ```
  - [ ] Apply to `GET /talents`, `GET /schedules`, `GET /groups`, `GET /venues`, `GET /duties/ledger`.

- [ ] **3.3 Health Check & Observability**
  - [ ] Add `GET /api/v1/health` with database ping (`SELECT 1`).

---

## Phase 4: Frontend Integration & Bridge

- [ ] **4.1 Connect Next.js `AppContext` to API Service**
  - [ ] Update `apps/web/src/context/AppContext.tsx`:
    - Replace `localStorage` (`getStoredTalents`, `getStoredSchedule`, etc.) with queries to `api.talents.getAll()`, `api.schedules.getAll()`, etc.
  - [ ] Add loading indicators and error toasts for network requests.

- [ ] **4.2 Auth State Integration**
  - [ ] Store JWT token in secure HTTP-only cookie or browser storage.
  - [ ] Connect `SignInForm.tsx` and `SignUpForm.tsx` to `POST /api/v1/auth/login`.

- [ ] **4.3 Verification & End-to-End Testing**
  - [ ] Run database seeds: `pnpm prisma:seed`.
  - [ ] Test full flow: Sign in &rarr; View Talents &rarr; Book Show &rarr; Auto-generate Duties &rarr; Swap Performer.
