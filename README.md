# Assignment & Submission Management System

A role-based, full-stack web application for a school or college that lets **Teachers** create and
grade assignments for their classes, **Students** submit and track their work, and an **Admin**
manage users, classes/courses, and subject-teacher assignments.

Built for the OnnoRokom Projukti Limited *Assistant Software Engineer Recruitment Project*.

---

## Table of Contents

- [Assignment \& Submission Management System](#assignment--submission-management-system)
  - [Table of Contents](#table-of-contents)
  - [1. Overview](#1-overview)
  - [2. Key Features](#2-key-features)
  - [3. Technology Stack](#3-technology-stack)
  - [4. Project Structure](#4-project-structure)
  - [5. Prerequisites](#5-prerequisites)
  - [6. Getting Started](#6-getting-started)
    - [6.1 Clone the repository](#61-clone-the-repository)
    - [6.2 Backend setup](#62-backend-setup)
    - [6.3 Frontend setup](#63-frontend-setup)
  - [7. Database Setup](#7-database-setup)
  - [8. Demo Credentials](#8-demo-credentials)
  - [9. Running the Tests](#9-running-the-tests)
  - [10. Authentication \& Authorization](#10-authentication--authorization)
  - [11. File Uploads](#11-file-uploads)
  - [14. Environment Variables](#14-environment-variables)
  - [13. Assumptions](#13-assumptions)
  - [14. Known Limitations](#14-known-limitations)

---

## 1. Overview

Teachers create assignments — as written instructions, an uploaded file, or both — and publish
them to a specific class/course and subject. Students enrolled in that class see the assignment,
submit an answer (text and/or a file) before the deadline, and can update it until the deadline
passes or a teacher has graded it. Teachers review submissions, assign marks and feedback, and can
change a submission's status when needed. An Admin owns user management, class/course and subject
setup, and assigning teachers to the subjects they teach — and can see everything in the system.

Every rule above is enforced **server-side** (not just hidden in the UI), backed by JWT
authentication and ASP.NET Core Identity role-based authorization.

## 2. Key Features

**Admin**
- Create Teacher and Student accounts (no public self-registration)
- Manage Classes/Courses and Subjects (CRUD)
- Assign Teachers to Subjects/classes; enroll/unenroll Students in a Class/Course
- View every assignment and submission in the system
- Activate/deactivate/delete user accounts

**Teacher**
- Create, update, and delete assignments for a subject/class they're assigned to
- Give an assignment as free-text instructions, an uploaded file, or both
- Set title, description, deadline, and maximum marks
- Publish an assignment immediately or save it as a draft
- View all student submissions for an assignment
- Assign marks and written feedback; change a submission's status (e.g. flag for review, reject)

**Student**
- View assignments published for their enrolled class/course
- View full assignment details and the deadline
- Submit an answer as text, a file, or both
- Update a submission before the deadline (locked once graded or past due)
- View submission status, marks, and teacher feedback

**Platform-wide**
- JWT authentication with role-based authorization (Admin / Teacher / Student)
- Centralized global exception-handling middleware → consistent JSON error responses
- Swagger/OpenAPI documentation with a "Bearer token" auth flow built in
- CORS configured for a separate frontend origin
- Structured logging throughout the API pipeline
- Responsive UI (mobile → desktop) with client-side form validation mirroring the API's rules

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Bootstrap 5 / react-bootstrap, react-hook-form + zod, axios |
| Backend | ASP.NET Core 10 Web API, C#, N-layer architecture, Swagger/Swashbuckle |
| Database | PostgreSQL, accessed via Entity Framework Core (code-first migrations) |
| Auth | ASP.NET Core Identity (roles) + JWT bearer authentication |
| Testing | xUnit, Moq, FluentAssertions, EF Core InMemory provider |

## 4. Project Structure

```
.
│
├── SchoolManagementSystem/          ← backend (ASP.NET Core Web API)
│   ├── SchoolManagementSystem.sln
│   ├── src/
│   │   ├── SchoolManagementSystem.Domain          (entities, enums, role constants)
│   │   ├── SchoolManagementSystem.DataAccess      (EF Core DbContext, repositories, seeding)
│   │   ├── SchoolManagementSystem.Business        (services / business rules, JWT, file storage)
│   │   ├── SchoolManagementSystem.Presentation    (DTOs)
│   │   └── SchoolManagementSystem.Api             (controllers, Program.cs, middleware, wwwroot)
│   └── tests/
│       └── SchoolManagementSystem.Tests           (unit tests)
│
└── frontend/                        ← frontend (Next.js + TypeScript)
    ├── .env.example
    └── src/
        ├── app/                     (App Router pages, grouped by role: admin/teacher/student)
        ├── components/              (shared UI + role-specific forms/modals)
        ├── context/                 (auth state)
        ├── lib/                     (API client + one wrapper module per resource)
        └── types/                   (TypeScript types mirroring every API DTO)
```

## 5. Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/download/) (local install, or a container/managed instance)
- `dotnet-ef` CLI tool: `dotnet tool install --global dotnet-ef`

## 6. Getting Started

### 6.1 Clone the repository

```bash
git clone <this-repository-url>
cd <repository-folder>
```

### 6.2 Backend setup

```bash
cd SchoolManagementSystem

# 1. Copy the env template and fill in real values (or edit appsettings.json directly for local dev)
cp .env.example .env

# 2. Point the connection string at your Postgres instance — either edit
#    src/SchoolManagementSystem.Api/appsettings.json directly, or export the
#    environment variables listed in .env.example before running the API.

# 3. Apply database migrations (see Section 7)
cd src/SchoolManagementSystem.Api
dotnet ef database update --project ../SchoolManagementSystem.DataAccess --startup-project .

# 4. Run the API
dotnet run
```

The API starts on the port shown in the console (Swagger UI at `/swagger` in Development). Note
that URL — the frontend needs it next.

### 6.3 Frontend setup

```bash
cd frontend

# 1. Copy the env template
cp .env.example .env.local

# 2. Edit .env.local and set NEXT_PUBLIC_API_HOST to the backend's host from step 6.2
#    (no /api suffix, no trailing slash), e.g. NEXT_PUBLIC_API_HOST=https://localhost:7174

# 3. Install dependencies and run
npm install
npm run dev
```

Open `http://localhost:3000` — you'll be redirected to `/login`. Use the [demo credentials](#8-demo-credentials) below.

> **CORS note:** make sure the frontend's origin (`http://localhost:3000` by default) is listed
> under `Cors:AllowedOrigins` in the backend's `appsettings.json` — it is by default for local dev.

## 7. Database Setup

The schema is fully defined by EF Core migrations — **no manual table creation is required**.

```bash
cd SchoolManagementSystem/src/SchoolManagementSystem.Api
dotnet ef migrations add InitialCreate --project ../SchoolManagementSystem.DataAccess --startup-project .
dotnet ef database update --project ../SchoolManagementSystem.DataAccess --startup-project .
```

This creates every table the app needs: ASP.NET Core Identity's `Users`/`Roles`/`UserRoles`/etc.,
plus the domain tables `ClassCourses`, `Subjects`, `TeacherSubjectAssignments`,
`StudentClassEnrollments`, `Assignments`, and `Submissions`.

**Seed data runs automatically** the first time the API starts (see `DbInitializer` in the
DataAccess layer) — no separate seed script to run by hand:

1. The three roles (`Admin`, `Teacher`, `Student`).
2. The hard-coded Admin account (see [Demo Credentials](#8-demo-credentials)).
3. A demo Teacher and Student account, so all three roles are usable immediately.
4. A sample Class/Course ("Grade 10 - A"), a Subject ("Mathematics") assigned to the demo Teacher,
   the demo Student enrolled in that class, and one published sample assignment — so the evaluator
   sees a populated, working system on first login rather than an empty one.

To skip steps 3–4 (Admin-only, empty system), set `DemoSeed:Enabled` to `false` in `appsettings.json`
or via the `DemoSeed__Enabled` environment variable.

## 8. Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@school.com` | `Admin@12345` |
| Teacher | `teacher@school.com` | `Teacher@12345` |
| Student | `student@school.com` | `Student@12345` |

These are seeded automatically on first run (Section 7) and are safe to share — they're demo-only
credentials for a local database, not production secrets. Change them via `AdminSeed:*` /
`DemoSeed:*` in `appsettings.json` before any real deployment.

## 9. Running the Tests

Backend unit tests cover the business rules, authorization checks, and submission workflow rules
called out in the brief (ownership checks, deadline/grading rules, enrollment checks, duplicate
prevention, etc.):

```bash
cd SchoolManagementSystem/tests/SchoolManagementSystem.Tests
dotnet test
```


## 10. Authentication & Authorization

- Login (`POST /api/Auth/login`) returns a JWT carrying the user's id, name, and role.
- The frontend attaches `Authorization: Bearer {token}` to every request via an axios interceptor,
  and clears the session + redirects to login on a `401`.
- The API enforces role checks with `[Authorize(Roles = "...")]` on every controller action, **not**
  just in the UI — e.g. a Student JWT cannot call a Teacher-only endpoint even by hand-crafting the
  request.
- Resource-level ownership is also enforced in the business layer (e.g. a Teacher can only
  grade/edit their own assignments; a Student can only view/update their own submission).

## 11. File Uploads

Teachers can attach a file to an assignment (in addition to or instead of text instructions), and
Students can attach a file to their submission (in addition to or instead of a text answer). Files
are stored under the API's `wwwroot/assignments` and `wwwroot/submissions` folders and served back
as static file URLs. Uploads are restricted by file extension and a configurable max size (default
10 MB) — see `FileStorage` in `appsettings.json`.

## 14. Environment Variables

Both `.env.example` files show every configurable value:

- `SchoolManagementSystem/.env.example` — documents the ASP.NET Core environment-variable
  equivalents of `appsettings.json` (connection string, JWT secret, admin/demo seed credentials).
  ASP.NET Core reads config from `appsettings.json` by default; the `.env.example` values use the
  standard `Section__Key` override syntax for containerized/CI deployments.
- `frontend/.env.example` — copy to `frontend/.env.local` and set `NEXT_PUBLIC_API_HOST` to the
  backend's base URL.

No real secrets are committed — the JWT signing key and demo passwords in the example files are
placeholders/demo-only values meant to be changed for any non-local deployment.

## 13. Assumptions

Requirements not explicitly defined in the brief were resolved as follows:

- **Relational database (PostgreSQL) over MongoDB** — the domain is naturally relational (classes
  ↔ subjects ↔ teachers ↔ students ↔ assignments ↔ submissions, with several many-to-many and
  ownership relationships), so PostgreSQL + EF Core gives strong referential integrity with less
  application-level consistency code than a document store would need here.
- **No public registration endpoint** — only the Admin can create Teacher/Student accounts, per the
  role matrix in the brief; the Admin account itself is seeded from configuration rather than
  created through the API, as explicitly requested.
- **A Subject belongs to exactly one Class/Course** (not many-to-many) — this matches how the brief
  describes "assign an assignment to a specific class/course **and** subject" and keeps the
  teacher-assignment model simple: a teacher is assigned to a subject, which is already scoped to
  one class.
- **One submission per student per assignment** — a student submits once, then edits that same
  submission (rather than creating multiple submission records), matching "update a submission
  before the deadline, if allowed."
- **Submission status is a free-form set of states** (`Submitted`, `Late`, `UnderReview`, `Graded`,
  `Resubmitted`, `Rejected`) that a teacher can set directly via "change the submission status when
  necessary," since the brief didn't prescribe a fixed workflow.
- **File uploads are stored on local disk** (`wwwroot`) rather than cloud storage, since no specific
  storage requirement was given; this is straightforward to swap for a cloud provider later behind
  the existing `IFileService` abstraction.

## 14. Known Limitations

- No password-reset / "forgot password" flow.
- No refresh tokens — once a JWT expires (120 minutes by default) the user must log in again.
- No pagination on list endpoints (assignments, submissions, users) — acceptable at demo/small-class
  scale; would be needed before this scales to a large school.
- No automated frontend test suite — only the backend has unit tests; the frontend forms/pages are
  covered by manual testing and client-side validation mirroring the API's server-side rules.
- No malware/content scanning on uploaded files — uploads are restricted only by file extension and
  size.
- No email/push notifications when an assignment is published or a submission is graded.
