# Role-Based Task API

Full-stack assignment built in Next.js with JWT authentication, role-based access control, versioned REST APIs, task CRUD, Swagger UI documentation, and a simple dashboard UI.

## Tech Stack

- Next.js 16 App Router
- React 19
- Prisma ORM
- SQLite for local reviewer-friendly setup
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication
- Zod for validation
- Sonner for toast notifications
- Swagger UI for API documentation

Note: the schema is relational and can be moved to PostgreSQL/MySQL easily via Prisma. SQLite is used here so the reviewer can run the assignment with minimal setup.

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Create the database schema:

```bash
npm run db:push
```

4. Seed the admin account:

```bash
npm run db:seed
```

5. Start the application:

```bash
npm run dev
```

6. Open `http://localhost:3000`

## Seeded Admin Account

- Email: `admin@primetrade.local`
- Password: `Admin@123`

## Authentication Flow

1. User registers with name, email, and password.
2. Password is hashed before storage.
3. Login returns a JWT token and also stores it in an httpOnly cookie for the built-in dashboard.
4. Protected routes accept either the `Authorization: Bearer <token>` header or the session cookie.
5. Admin-only endpoints are protected with RBAC checks on the server.

## API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Tasks

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

### Admin

- `GET /api/v1/admin/users`

### Utility

- `GET /api/v1/health`

## Frontend Pages

- `/` for register/login and project overview
- `/dashboard` for the protected task dashboard
- `/api-docs` for Swagger UI

## Database Schema

### User

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

### Task

- `id`
- `title`
- `description`
- `status`
- `ownerId`
- `createdAt`
- `updatedAt`

## Security Practices

- Password hashing with bcrypt
- JWT expiration
- Input validation through Zod
- Input sanitization for text fields
- httpOnly cookie support for the first-party UI
- Server-side RBAC checks on every protected route

## API Documentation

- Swagger UI: `/api-docs`
- API spec JSON: `/api-spec.json`
- Includes endpoint details, request/response examples, and bearer authentication instructions

## Scalability Notes

- APIs are grouped under `/api/v1`, making future versions easy to add without breaking clients.
- JWT auth keeps app servers stateless, which helps horizontal scaling.
- Prisma models already define indexed relational lookups for ownership and status.
- For production, I would move the datasource to PostgreSQL, add Redis for caching/rate limiting, and introduce structured logging plus background jobs for heavier workflows.
