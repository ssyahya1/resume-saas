# Applyroom — AI Resume & Job Application SaaS

Applyroom is a full-stack SaaS application that helps job seekers manage resumes, job opportunities, applications, and AI-assisted job preparation in one place.

It combines resume management, job tracking, resume analysis, resume tailoring, cover letter generation, and interview preparation in a single platform.

The application uses a production-oriented backend architecture with asynchronous AI processing, secure authentication, usage enforcement, automated testing, and cloud deployment.

## 🚀 Features

### Authentication & Account Security
- User registration and login using Supabase Auth.
- HttpOnly cookie-based authentication.
- Protected API routes and server-side authorization.
- Forgot-password email flow.
- Resource ownership checks and database-level security with Supabase Row Level Security (RLS).

### Resume Management
- Create, upload, edit, rename, and delete resumes.
- Manage resume versions and view previous versions.
- Structure raw resume content into organized data for AI processing.
- Store resume information for reuse across job applications.

### Job Management
- Create, view, update, and delete job opportunities.
- Store job descriptions and relevant job information.
- Associate jobs with resumes and applications.

### Application Management
- Create and manage job applications.
- Associate applications with jobs and resumes.
- Track application statuses and application dates.
- Filter and paginate application history.

### AI-Powered Tools
- **Resume Analysis:** Evaluate resume content and its relevance to a job.
- **Resume Structuring:** Convert raw resume text into structured information.
- **Resume Tailoring:** Adapt resume content to a specific job description.
- **Cover Letter Generation:** Generate job-specific cover letters.
- **Interview Preparation:** Generate relevant interview questions.

### Real-Time AI Processing
- Redis-backed background job queues using BullMQ.
- Dedicated workers for AI operations.
- WebSocket notifications for job updates.
- Polling fallback when real-time updates are unavailable.
- Retry handling and permanent failure handling.
- Job status tracking and idempotency safeguards.

## 🏗️ Architecture

Applyroom uses a layered backend architecture to separate HTTP handling, business logic, and database operations.

### Request Processing

```text
Next.js Frontend
       │
       ▼
   Express API
       │
       ▼
     Routes
       │
       ▼
   Middleware
       │
       ▼
  Controllers
       │
       ▼
    Services
       │
       ▼
  Repositories
       │
       ▼
Supabase PostgreSQL
```

### Asynchronous AI Processing

```text
User starts an AI operation
            │
            ▼
       Express API
            │
            ▼
     AI Job Service
            │
            ▼
       BullMQ Queue
            │
            ▼
          Redis
            │
            ▼
       Background Worker
            │
            ▼
         Groq API
            │
            ▼
   Parse and validate output
            │
            ▼
     Save result to database
            │
            ▼
   WebSocket / polling update
            │
            ▼
       Frontend displays result
```

This design keeps long-running AI tasks separate from normal API requests and allows the frontend to track processing without holding a single HTTP request open.

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- JavaScript
- Next.js App Router
- Tailwind CSS
- Fetch API

### Backend
- Node.js
- Express.js
- JavaScript (ES modules)
- Zod validation
- Layered route, controller, service, and repository architecture

### Database & Infrastructure
- Supabase PostgreSQL
- Supabase Auth
- Supabase Row Level Security
- Redis
- BullMQ
- WebSockets

### AI
- Groq API
- `openai/gpt-oss-120b`
- Structured JSON output
- Zod schema validation

### Testing & Delivery
- Vitest and Supertest
- GitHub Actions
- ESLint
- Next.js production builds
- Git-connected Render and Vercel deployments

## 🔐 Authentication & Security

Security is implemented across authentication, API access, data ownership, and background processing.

### Authentication Flow

```text
Register / Login
       │
       ▼
  Supabase Auth
       │
       ▼
Authenticated Session
       │
       ▼
 HttpOnly Cookie
       │
       ▼
 Protected API Requests
```

The browser manages authentication cookies, and the frontend does not store authentication tokens in `localStorage` or `sessionStorage`.

Additional security measures include:

- Authentication and authorization middleware.
- Zod-based request validation.
- Credentialed CORS restricted to the configured frontend origin.
- Origin validation for unsafe HTTP methods.
- Secure cookie settings for the cross-origin production deployment.
- General API rate limiting and IP-based authentication rate limiting.
- Server-side Free/Pro plan enforcement and AI usage reservations.
- Idempotency handling, including recovery of stale pending requests.
- Resource ownership checks.
- Security headers and sanitized structured logging.
- Request IDs for troubleshooting.
- Supabase RLS for user-owned database records.
- Background-job ownership checks.

The backend uses trusted server-side Supabase credentials for repository operations. Client-provided plan information is not treated as authoritative.

## 🤖 AI Processing

AI operations are submitted to background queues rather than being handled entirely inside long-running synchronous API requests.

The processing flow is:

1. The user starts an AI feature.
2. The API validates the request and checks authorization and usage limits.
3. The application creates or queues the background job.
4. A worker sends the required context to the Groq API.
5. The generated output is parsed and validated against the relevant schema.
6. The application saves the result.
7. The frontend receives status updates through WebSockets or polling.

The application uses Groq's OpenAI-compatible API with structured-output handling. AI-generated data is validated before it is used by downstream application logic.

AI output can still be invalid or incomplete, so parsing, validation, and failure handling remain important parts of the workflow.

## ⚡ Background Jobs

Redis and BullMQ support asynchronous processing for the main AI features.

The background-processing system includes:

- Separate processing flows for AI operations.
- Queue-based job execution.
- Worker-level error handling.
- Retry and permanent-failure handling.
- Job status tracking.
- WebSocket notifications.
- Polling fallback.
- Idempotency safeguards.
- Queue cleanup and ownership checks.

These mechanisms improve responsiveness and provide a structured way to manage AI operations that may take longer than a normal API request.

## 🗄️ Database

Supabase PostgreSQL stores the application's persistent data, including:

- User profiles and plan information.
- Resumes and resume versions.
- Jobs and job descriptions.
- Job applications.
- AI job records and results.
- AI usage tracking.

Supabase Auth handles user authentication, while backend authorization and RLS help protect user-owned resources.

AI usage is enforced server-side so that plan limits cannot be bypassed simply by changing frontend requests.

## 🔄 API Architecture

The backend follows a layered architecture:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

- **Routes:** Define endpoints and attach the required middleware.
- **Middleware:** Handle authentication, validation, rate limiting, and request-level security.
- **Controllers:** Translate HTTP requests into service calls and format responses.
- **Services:** Implement business rules and coordinate application workflows.
- **Repositories:** Encapsulate database queries and persistence operations.

This separation makes the codebase easier to understand, test, debug, and extend.

## 📁 Project Structure

Simplified repository structure:

```text
saas/
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   └── ...
│   │
│   ├── tests/
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

## 🌐 Production Deployment

- **Frontend:** [Applyroom on Vercel](https://applyroom.vercel.app)
- **Backend:** [Applyroom API on Render](https://resume-saas-bam9.onrender.com)
- **Database and authentication:** Supabase
- **Background job infrastructure:** Redis and BullMQ

### Health Checks

The backend exposes health endpoints:

- `GET /api/health` — Liveness check.
- `GET /api/health/live` — Liveness alias, if enabled in the deployed version.
- `GET /api/health/ready` — Readiness check for critical dependencies such as Supabase and Redis.

The readiness endpoint can return HTTP 503 if a required dependency is unavailable.

## 💻 Local Development

### Prerequisites

Install or configure:

- Node.js and npm.
- A Supabase project.
- Redis.
- A Groq API key.

### 1. Configure the Backend

Open a terminal and navigate to the backend directory:

```powershell
cd F:\saas\backend
npm install
```

Copy `.env.example` to `.env` and configure the required environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SECRET_KEY=your-supabase-secret-key
GROQ_API_KEY=your-groq-api-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
REDIS_URL=redis://localhost:6379
```

Use your actual Supabase credentials and Groq API key. Keep `.env` out of version control and never publish secrets.

Start the backend:

```bash
npm run dev
```

The local API runs at `http://localhost:5000`.

Ensure Redis is running and reachable at the configured `REDIS_URL`.

### 2. Configure the Frontend

Open another terminal:

```powershell
cd F:\saas\frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

## 🧪 Testing

### Backend

The backend includes automated tests covering areas such as:

- API behavior and integration.
- Authentication and authorization.
- Validation and security behavior.
- AI service and background-job behavior.
- Queue and worker-related functionality.

Run the backend tests from `F:\saas\backend`:

```bash
npm test
```

### Frontend

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Run these frontend commands from `F:\saas\frontend`.

## 🔁 CI/CD

Applyroom uses GitHub Actions for automated backend verification and Git-connected deployments for the frontend and backend.

### Continuous Integration

```text
Push / Pull Request to main
           │
           ▼
     GitHub Actions
           │
           ▼
    Install dependencies
           │
           ▼
   Start required services
           │
           ▼
      Run backend tests
           │
           ▼
    Report CI result
```

The workflow runs on pushes and pull requests targeting `main`. It installs backend dependencies, starts the required Redis service, and runs the automated backend test suite.

### Continuous Deployment

```text
Changes pushed to main
           │
           ├───────────────┐
           ▼               ▼
      Render deploy    Vercel deploy
           │               │
           ▼               ▼
       Backend API      Frontend
```

Render and Vercel are connected to the GitHub repository and configured to deploy their respective applications from the `main` branch. GitHub Actions provides automated verification; deployment is handled by the hosting platforms.

## 🎨 Design System

Applyroom uses a **Burgundy + Travertine + White** visual system designed to create a professional SaaS experience.

| Color | Hex |
|---|---|
| Burgundy | `#6B1F2B` |
| Dark Burgundy | `#4A151E` |
| Burgundy Hover | `#7D2937` |
| Travertine | `#E8DFD0` |
| Light Travertine | `#F5F1E9` |
| Background | `#FAF8F4` |
| Surface | `#FFFFFF` |
| Text | `#241F1D` |
| Muted | `#756D66` |
| Border | `#DED5C8` |

Burgundy is used primarily as an accent, with light neutral surfaces and restrained contrast to keep the interface readable.

## 📌 Project Status

Applyroom's core user-facing functionality and production infrastructure are implemented.

### Backend
- [x] Authentication and protected routes.
- [x] Resume, job, and application management.
- [x] AI resume analysis and structuring.
- [x] Resume tailoring, cover letters, and interview questions.
- [x] Redis/BullMQ background processing.
- [x] WebSocket updates and polling fallback.
- [x] Usage enforcement and rate limiting.
- [x] Validation, idempotency, and error handling.
- [x] Automated backend tests and CI.
- [x] Production deployment and health checks.

### Frontend
- [x] Landing and authentication pages.
- [x] Dashboard and core application workflows.
- [x] Resume, job, and application management.
- [x] AI tools and processing states.
- [x] Responsive interface and design system.

The application is deployed, and the core workflows have been tested. Further end-to-end checks and ongoing maintenance remain useful as the project evolves.

## 🛣️ Future Enhancements

Potential additions include:

- [ ] Stripe subscriptions and payment webhooks.
- [ ] Automated subscription lifecycle management.
- [ ] Additional monitoring and alerting.
- [ ] Docker-based development and deployment.
- [ ] Expanded end-to-end testing.
- [ ] Additional AI output quality checks.
- [ ] Further UI/UX improvements.

These are optional extensions rather than prerequisites for the current core application.

## ⚖️ Engineering Trade-offs

### Supabase Auth

Supabase Auth provides established authentication functionality while allowing the application to implement its own authorization rules and data-access logic.

### Background AI Jobs

AI operations can take longer than normal API requests. BullMQ and Redis let the application process these tasks asynchronously and communicate status updates to users.

### WebSockets and Polling

WebSockets provide timely updates during AI processing, while polling provides a fallback if the real-time connection is unavailable.

### Layered Backend

The route/controller/service/repository separation introduces some additional structure but keeps HTTP handling, business logic, and persistence responsibilities distinct.

### Managed Infrastructure

Supabase, Render, Vercel, and a Redis service reduce the amount of infrastructure that must be operated manually while still allowing the application to use production-oriented backend patterns.

## 🎯 Project Goal

Applyroom was built as a practical full-stack SaaS project focused on applying real software engineering concepts:

- Authentication and authorization.
- REST API design.
- PostgreSQL data modeling.
- AI integration and structured output validation.
- Background jobs and queues.
- Real-time communication.
- Rate limiting and idempotency.
- Automated testing and CI/CD.
- Cloud deployment and operational health checks.

The project demonstrates how these components can work together in a single application rather than as isolated technical exercises.

## 👨‍💻 Project

**Applyroom — AI Resume & Job Application SaaS**

A full-stack project focused on practical software engineering, secure backend architecture, asynchronous AI integration, and production-oriented development.
