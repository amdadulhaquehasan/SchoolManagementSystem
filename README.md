# School Management System

## Project Overview
A full-stack, role-based web application designed for schools and colleges to manage assignments and submissions. The system empowers teachers to create and grade assignments, students to submit and track their work, and administrators to oversee the institution's users and subjects.

## Main Features
### Admin
* Manage users (creation, deletion, role assignment).
* Manage classes/courses and subjects.
* Assign teachers to specific classes/subjects.
* Global view of all assignments and submissions.
* Manage application-level settings.

### Teacher
* Create, update, delete, and publish assignments (or save as drafts).
* Assign assignments to specific classes/courses and subjects.
* Define title, description, deadlines, and maximum marks.
* View student submissions, assign marks, and provide feedback.
* Modify submission statuses when necessary.

### Student
* View assignments assigned to their specific class/course.
* View assignment details and upcoming deadlines.
* Submit answers and update submissions before the deadline.
* View submission status, marks, and teacher feedback.

## Technology Stack
* **Frontend:** Next.js, React, TypeScript, Bootstrap
* **Backend:** ASP.NET Core Web API (N-Layer Architecture), C#
* **Database:** PostgreSQL
* **Authentication:** JWT-based authentication with Role-Based Access Control (RBAC)
* **API Documentation:** Swagger/OpenAPI

## Project Structure
```text
/
├── backend/                                   # ASP.NET Core Solution (N-Layer)
│   ├── SchoolManagementSystem.Api/            # API endpoints, Controllers, Middleware, Program.cs
│   ├── SchoolManagementSystem.Business/       # Core business logic, Services, Interfaces
│   ├── SchoolManagementSystem.DataAccess/     # EF Core Context, Repositories, Migrations
│   ├── SchoolManagementSystem.Domain/         # Domain Entities, Enums, Constants
│   ├── SchoolManagementSystem.Presentation/   # Data Transfer Objects (DTOs)
│   └── SchoolManagementSystem.Tests/          # Unit tests and test helpers
├── frontend/                                  # Next.js Application
│   ├── public/                                # Static assets
│   ├── src/
│   │   ├── app/                               # App router (admin, student, teacher, login, unauthorized)
│   │   ├── components/                        # Shared and role-specific UI components
│   │   ├── context/                           # React context (AuthContext)
│   │   ├── lib/                               # API client and endpoint definitions
│   │   └── types/                             # TypeScript interfaces and DTO definitions
    ├── .env.local.example                     # Environment variables template
    └── package.json                           # Dependencies and scripts

```


## Setup Instructions

### 1. Environment Configuration
**Backend:**
Locate the `appsettings.example.json` in the backend directory. Create a new file named `appsettings.Development.json` and configure the database connection string and JWT secret demo:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=SchoolMgmtDb;Username=postgres;Password=password"
},
"Jwt": {
  "Key": "super_secret_key",
  "Issuer": "issuer",
  "Audience": "audience"
}
```

**Frontend:**
Setup the baseurl for the system:
```ts
export const API_HOST = process.env.NEXT_PUBLIC_API_HOST?.replace(/\/+$/, "") || "https://localhost:7174";
export const API_BASE_URL = `${API_HOST}/api`;
```

### 2. Database Setup
Navigate to the backend directory and apply the Entity Framework migrations to create the database schema. Ensure the database server is running.
```bash
cd backend
dotnet ef database update
```
*(Note: Initial seed data, including default roles, will be automatically populated upon the first application run).*

### 3. Running the Backend
```bash
cd backend/API
dotnet run
```
The API will be available at `http://localhost:7174`. Swagger OpenAPI documentation can be accessed at `http://localhost:7174/swagger`.

### 4. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be accessible at `http://localhost:3000`.

### 5. Running Tests
**Backend Unit Tests (Business logic & Authorization):**
```bash
cd backend/Tests
dotnet test
```

## Demo Credentials
Use the following credentials to explore the role-based features of the system:

* **Admin Email:** admin@school.com
* **Password:** Admin@12345

* **Teacher Email:** Secret
* **Password:** Secret

* **Student Email:** Secret
* **Password:** Secret
* To test this website create your own teacher and student account by admin

## Assumptions & Known Limitations
* **Assumptions:**
  * Students are mapped to specific classes/courses and automatically see assignments published for those entities.
  * A teacher can only grade and evaluate submissions for assignments they have authored or subjects they manage.
  * Document and file uploads (such as assignment attachments and submissions) are stored locally in the backend's wwwroot directory and served as static files.
* **Limitations:**
  * Automated email notifications for upcoming deadlines or graded assignments are not currently implemented.
  * The system is designed for a single-tenant architecture (one school/college per deployment instance).

---
*Developed by Amdadul Haque Hasan*