# Applyroom — AI Resume & Job Application SaaS

Applyroom is a full-stack SaaS application that helps job seekers manage their resumes, job opportunities, applications, and AI-assisted application preparation in one place.

Instead of using separate tools for resume management, job tracking, cover letters, and interview preparation, Applyroom brings these workflows together into a single application.

The project is built with a production-oriented backend architecture and a modern web frontend, with AI features processed asynchronously in the background.

---

## 🚀 Features

### Authentication

* User registration and login
* Secure authentication using Supabase Auth
* HttpOnly cookies for authentication sessions
* Protected API routes
* Forgot-password email flow
* Server-side authorization

### Resume Management

* Create and manage resumes
* Upload resume content
* Edit resume information
* Save resume versions
* View previous versions
* Rename and delete resumes
* Structure uploaded resume content for AI processing

### Job Management

* Create and manage job opportunities
* Store job descriptions
* Edit job information
* View individual jobs
* Delete jobs
* Start an application from a job

### Application Management

* Create job applications
* Connect applications with jobs and resumes
* Track application status
* Record application dates
* Edit application information
* Delete applications
* Filter and paginate application history

### AI Features

Applyroom provides several AI-assisted features:

* Resume/job match analysis
* Resume tailoring for specific jobs
* AI-generated cover letters
* Interview question generation

AI operations are processed asynchronously using background jobs rather than keeping the user waiting for a long-running HTTP request.

### Real-Time Processing

* Background AI jobs using BullMQ
* Redis-backed job queues
* Worker processes for AI tasks
* Job status tracking
* WebSocket notifications
* Polling fallback when real-time updates are unavailable
* Retry handling for temporary failures
* Permanent failure handling

---

# 🏗️ Architecture

Applyroom follows a layered backend architecture designed to keep responsibilities separated.

```text
Frontend
   │
   ▼
Next.js / React
   │
   │ HTTP + WebSocket
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

For asynchronous AI operations:

```text
Frontend
   │
   ▼
API
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
Worker
   │
   ▼
Gemini AI
   │
   ▼
Database
   │
   ▼
WebSocket Notification
   │
   ▼
Frontend
```

This architecture keeps AI processing separate from normal request/response operations and allows long-running tasks to execute in the background.

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* JavaScript
* App Router
* Tailwind CSS
* Fetch API

## Backend

* Node.js
* Express
* JavaScript
* Supabase
* PostgreSQL
* Redis
* BullMQ
* WebSockets
* Zod

## AI

* Google Gemini

## Authentication

* Supabase Auth
* HttpOnly cookies

## Testing & Development

* Node.js
* GitHub Actions
* Automated integration/security tests
* ESLint
* Next.js production builds

## Deployment

* Frontend: Vercel
* Backend: Render
* Database/Auth: Supabase
* Redis: production Redis service

---

# 🔐 Authentication & Security

Security was considered throughout the backend rather than treating authentication as only a login feature.

### Authentication flow

```text
User
 │
 ▼
Login/Register
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

The frontend does not store authentication tokens in:

* `localStorage`
* `sessionStorage`

Authentication cookies are handled by the browser and sent with API requests using credentials.

The backend also includes:

* Authentication middleware
* Authorization checks
* Input validation
* General rate limiting and a separate IP-based authentication limit
* Idempotency handling with stale pending-request recovery
* Request IDs
* Structured, sanitized logging
* Security headers
* Resource ownership checks
* Background-job ownership authorization
* Structured client, resource, conflict, and usage errors
* Database-level protection through Supabase/RLS

Credentialed CORS is restricted to `FRONTEND_URL`. Unsafe HTTP methods must
also include that exact Origin; safe methods are exempt. Authentication cookies
are HttpOnly, and production cookies use Secure and SameSite=None for the
cross-site Vercel/Render deployment.

The general API limiter allows 10 requests per user in 5 minutes. Authentication
endpoints have a separate limit of 10 requests per IP in 15 minutes. Plan
enforcement and usage reservations are handled server-side; client-supplied
plan values are not authoritative.

Liveness is available at `GET /api/health` (also `/api/health/live`) and does not
depend on external services. `GET /api/health/ready` checks Supabase and Redis
and returns HTTP 503 when either critical dependency is unavailable.

---

# 🤖 AI Processing

AI features are not handled as large synchronous API requests.

When a user starts an AI operation, Applyroom creates a background job.

```text
User starts AI feature
        │
        ▼
API creates job
        │
        ▼
BullMQ Queue
        │
        ▼
Worker processes job
        │
        ▼
Gemini
        │
        ▼
JSON parsing and Zod validation
        │
        ▼
Store result
        │
        ▼
Notify user
```

This approach allows the application to handle longer AI operations without blocking the API request.

The frontend can receive progress/completion information through WebSockets and can fall back to polling when necessary.

Gemini uses JSON response mode for structured-output operations and a 30-second
request timeout. Generated JSON is parsed and validated against existing Zod
schemas before downstream application logic uses it.

---

# ⚡ Background Jobs

BullMQ and Redis are used for asynchronous processing.

The project contains separate processing flows for the major AI features, allowing them to run outside the main HTTP request lifecycle.

Background processing also supports:

* Retries
* Failure handling
* Job status tracking
* Ownership checks
* Idempotency
* Queue cleanup
* Worker processing

---

# 🗄️ Database

The application uses Supabase PostgreSQL.

The database stores information such as:

* User profiles
* Resumes
* Resume versions
* Jobs
* Applications
* AI job records
* AI results
* Usage information

Supabase Row Level Security is used where appropriate to protect user-owned data.
The backend uses privileged Supabase credentials for trusted repository
operations and obtains each user's plan from their profile before reserving
feature usage.

---

# 🔄 API Architecture

The backend follows:

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

### Routes

Routes are responsible for defining API endpoints and applying the required middleware.

### Middleware

Middleware handles concerns such as:

* Authentication
* Validation
* Rate limiting
* Request processing
* Security

### Controllers

Controllers handle HTTP-specific responsibilities:

* Reading request data
* Calling services
* Returning responses

### Services

Services contain application/business logic.

### Repositories

Repositories handle database interaction and keep database operations separated from business logic.

---

# 📁 Project Structure

A simplified structure of the project:

```text
saas/
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
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   │
│   └── ...
│
└── README.md
```


---

# 🌐 Production

### Backend

```text
https://resume-saas-bam9.onrender.com
```

### Frontend

The frontend is configured for deployment through Vercel.

The production frontend communicates with the deployed backend through:

```env
NEXT_PUBLIC_API_URL=https://resume-saas-bam9.onrender.com
```

---

# 💻 Local Development

## Prerequisites

Make sure you have:

* Node.js
* npm
* Supabase project
* Redis
* Gemini API key

---

## Backend Setup

Navigate to the backend:

```bash
cd F:\saas\backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```text
.env
```

Copy `.env.example` to `.env` and set the Supabase URL,
publishable key, secret key, Gemini API key, and frontend origin. Configure
`REDIS_URL` when using Redis other than the local default. Keep `.env` files
and credentials out of version control.

Then start the API:

```bash
npm run dev
```

The backend runs locally on:

```text
http://localhost:5000
```

---

## Frontend Setup

Navigate to the frontend:

```bash
cd F:\saas\frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

---

# 🧪 Testing

The backend includes automated tests covering important application and security behavior.

The current backend test suite contains:

* Integration tests
* Authentication tests
* API behavior tests
* Security-related tests
* AI job behavior
* Queue/worker-related functionality

Run the backend tests with:

```bash
npm test
```

For the frontend:

```bash
npm run lint
```

Build the production frontend:

```bash
npm run build
```

---

# 🔁 CI/CD

The backend uses GitHub Actions for automated verification.

The CI pipeline performs tasks such as:

```text
Push / Pull Request
        │
        ▼
GitHub Actions
        │
        ├── Install dependencies
        ├── Start required services
        ├── Run tests
        └── Verify application
```

The goal is to prevent broken changes from reaching the deployment stage.

Frontend CI/CD and the final production deployment workflow are being finalized alongside the frontend.

---

# 🎨 Design

Applyroom uses a **Burgundy + Travertine + White** visual system.

The design aims for a professional SaaS appearance rather than a typical developer dashboard.

Primary colors include:

```text
Burgundy       #6B1F2B
Dark Burgundy  #4A151E
Burgundy Hover #7D2937

Travertine     #E8DFD0
Light Travertine
               #F5F1E9

Background     #FAF8F4
Surface        #FFFFFF

Text           #241F1D
Muted          #756D66
Border         #DED5C8
```

The interface intentionally uses Burgundy as an accent rather than covering the entire application in a single strong color.

---

# 📌 Current Project Status

Applyroom has moved beyond the initial prototype stage.

### Backend

* Authentication implemented
* Resume management implemented
* Job management implemented
* Application management implemented
* AI processing implemented
* Redis/BullMQ background processing implemented
* WebSocket notifications implemented
* Rate limiting implemented
* Validation implemented
* Idempotency implemented
* Automated testing implemented
* CI implemented
* Production deployment implemented

### Frontend

* Landing page
* Authentication pages
* Dashboard
* Resume management
* Job management
* Application management
* AI tools
* Responsive UI
* Loading/error/empty states
* Delete confirmation dialogs
* Password visibility controls
* Burgundy/Travertine design system

The frontend is currently undergoing final end-to-end testing and product polish.

---

# 🛣️ Roadmap

### Current

* [x] Backend architecture
* [x] Authentication
* [x] Resume management
* [x] Job management
* [x] Application management
* [x] AI processing
* [x] Redis/BullMQ
* [x] WebSockets
* [x] Automated tests
* [x] Backend CI
* [x] Backend deployment
* [x] Main frontend functionality
* [x] Product redesign
* [ ] Complete frontend end-to-end QA
* [x] Backend production hardening
* [ ] Final CI/CD verification

### Later

* [ ] Stripe subscriptions
* [ ] Subscription-based plan management
* [ ] Payment webhooks
* [ ] Additional production monitoring
* [ ] Docker-based development/deployment workflow
* [ ] Additional integration testing
* [ ] Further AI improvements

---

# ⚖️ Trade-offs

Applyroom was designed around learning and applying production backend concepts through a real SaaS application.

Some deliberate decisions include:

### Supabase Auth

Using Supabase Auth avoids building password authentication and session management completely from scratch while still allowing the application to control its own authorization and database logic.

### Background AI Jobs

AI requests can take longer than normal API requests, so BullMQ and Redis are used instead of keeping users waiting on a synchronous HTTP request.

### WebSockets + Polling

WebSockets provide a better real-time experience, while polling provides a fallback when a real-time connection is unavailable.

### Layered Backend

The Route → Middleware → Controller → Service → Repository architecture adds some structure and files, but makes business logic, HTTP concerns, and database access easier to separate and maintain.

### PostgreSQL + Supabase

Supabase provides PostgreSQL, authentication, and database security features without requiring the entire infrastructure to be built and maintained manually.

---

# 🎯 Project Goal

Applyroom is being developed as a practical production-oriented SaaS project rather than a simple CRUD demonstration.

The goal is to understand how the different parts of a real application work together:

```text
Authentication
      +
Authorization
      +
Database
      +
API Design
      +
AI
      +
Redis
      +
Background Jobs
      +
WebSockets
      +
Validation
      +
Security
      +
Testing
      +
CI/CD
      ↓
A complete SaaS application
```

---

## 👨‍💻 Project

**Applyroom — AI Resume & Job Application SaaS**

Built as a full-stack project focused on practical software engineering, backend architecture, AI integration, and production-oriented development.
