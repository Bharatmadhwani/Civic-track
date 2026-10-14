# CivicTrack — Smart Community Issue Reporting Platform

> **A modern, transparent GovTech platform empowering citizens to report local civic issues (potholes, streetlights, garbage accumulation, water supply leaks), elevate critical community priorities through democratic upvoting, and verify government resolution with photographic proof and tamper-resistant audit timelines.**

---

## 1. Project Overview & Problem Statement

### The Problem
In modern municipalities, citizens regularly encounter urgent civic issues:
* **Roads:** Hazardous potholes causing vehicle damage and two-wheeler accidents.
* **Streetlights:** Non-functional streetlamps creating unsafe, pitch-black corridors at night.
* **Garbage:** Overflowing dumpsters causing severe public health and hygiene hazards.
* **Water Supply & Drainage:** Clogged storm drains causing localized flooding, and burst underground pipelines wasting thousands of gallons of clean drinking water.

Historically, citizens have lacked a transparent, centralized system to report these issues, track the real-time progress of municipal repair teams, and verify that reported problems have actually been resolved.

### The Solution: CivicTrack
**CivicTrack** bridges the gap between citizens and municipal authorities through an intuitive MERN-stack platform:
1. **Instant Reporting:** Citizens report problems with location details, category classification, urgency, and photo evidence in under 60 seconds.
2. **Community Priority Engine:** Citizens upvote issues affecting their neighborhood. High-upvote issues are dynamically flagged as **Community Priority** to guide municipal dispatch teams.
3. **Transparent Audit Timeline:** Every status change (*Pending &rarr; In Progress &rarr; Resolved*) is logged with timestamps, the responsible officer's identity, administrative notes, and verified resolution proof photos.
4. **Administrative Console:** Municipal officers review, moderate, prioritize, and update reports with real-time database-driven analytics.

---

## 2. Technology Stack

* **Frontend:**
  * **Framework:** React 18 with Vite
  * **Styling:** Tailwind CSS (Navy Blue & Teal Civic Design Tokens)
  * **Routing:** React Router v6
  * **Icons:** Lucide React
  * **Data Visualization:** Recharts
  * **HTTP Client:** Axios with JWT request interceptors
* **Backend:**
  * **Runtime:** Node.js (v18+) & Express.js
  * **Database:** MongoDB with Mongoose ODM (includes automatic embedded In-Memory fallback for zero-configuration testing)
  * **Security & Auth:** bcryptjs (password hashing), JSON Web Tokens (JWT), express-rate-limit
  * **Media Uploads:** Multer (multipart disk storage for local uploads + external URL support)
  * **Testing:** Supertest + Node.js Native Test Runner

---

## 3. Project Structure

```text
Civic track/
├── package.json               # Root scripts to orchestrate client and server
├── .env.example               # Root environment variable template
├── .gitignore                 # Excludes node_modules, .env, and uploads
├── README.md                  # Comprehensive platform documentation
│
├── server/                    # Express.js REST API Backend
│   ├── package.json
│   ├── .env                   # Server environment variables
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # Resilient MongoDB connector with Memory Server fallback
│   │   │   └── upload.js      # Multer file upload configuration (5MB limit, image filter)
│   │   ├── models/
│   │   │   ├── User.js        # User model (name, email, passwordHash, role: citizen/admin)
│   │   │   └── Issue.js       # Issue model (category, location, photoUrl, statusHistory, upvotes)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verification & role authorization (adminOnly)
│   │   │   ├── errorMiddleware.js     # Unified error & 404 handler
│   │   │   └── rateLimitMiddleware.js # Rate limiters for auth and API routes
│   │   ├── controllers/
│   │   │   ├── authController.js      # Register, Login, GetMe
│   │   │   ├── issueController.js     # Create, Get, Details, Toggle Upvote, Update Status, Delete
│   │   │   └── dashboardController.js # Real MongoDB aggregations for KPI cards & category stats
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── issueRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── utils/
│   │   │   └── jwt.js         # Token generation and verification
│   │   ├── app.js             # Express app setup, CORS, static uploads, and middleware
│   │   └── server.js          # Server entry point with graceful shutdown
│   ├── scripts/
│   │   └── seed.js            # Database seeder (Admin, sample citizens, realistic issues)
│   ├── tests/
│   │   └── api.test.js        # Automated API test suite
│   └── uploads/               # Statically served local uploads directory
│
└── client/                    # Vite + React Frontend
    ├── package.json
    ├── vite.config.js         # API proxying to http://localhost:5000
    ├── tailwind.config.js     # Custom brand and civic palette
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── components/
        │   ├── common/        # Navbar, Footer, StatusBadge, UrgencyBadge, StatCard, EmptyState, etc.
        │   ├── issues/        # IssueCard, IssueFilters, Timeline
        │   └── admin/         # StatusUpdateModal
        ├── context/
        │   └── AuthContext.jsx # Global authentication & role management
        ├── services/
        │   ├── api.js         # Axios instance with auth interceptors
        │   ├── authService.js
        │   ├── issueService.js
        │   └── dashboardService.js
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── BrowseIssuesPage.jsx
        │   ├── ReportIssuePage.jsx
        │   ├── IssueDetailPage.jsx
        │   ├── CitizenDashboardPage.jsx
        │   ├── AdminDashboardPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── NotFoundPage.jsx
        ├── index.css
        ├── App.jsx
        └── main.jsx
```

---

## 4. Getting Started & Installation

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** Local MongoDB daemon (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.
  *(Note: If local MongoDB is not running, CivicTrack automatically falls back to an embedded in-memory MongoDB so the project runs out of the box with zero setup).*

### Quick Start (One Command)

1. Clone or open the repository root:
   ```bash
   cd "Civic track"
   ```

2. Install dependencies for root, server, and client:
   ```bash
   npm run install:all
   ```

3. Seed demo data (creates administrator and sample neighborhood issues):
   ```bash
   npm run seed
   ```

4. Run both backend and frontend concurrently:
   ```bash
   npm run dev
   ```

5. Open your browser:
   * **Frontend Application:** [http://localhost:5173](http://localhost:5173)
   * **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 5. Environment Variables Configuration

Copy `.env.example` to `server/.env`:
```env
# Server Port
PORT=5000
NODE_ENV=development

# MongoDB Connection String
# (If local MongoDB is unavailable, CivicTrack uses an embedded in-memory database)
MONGODB_URI=mongodb://127.0.0.1:27017/civictrack

# Authentication
JWT_SECRET=civictrack_super_secure_jwt_secret_key_hackathon_2025
JWT_EXPIRES_IN=7d

# Initial Admin Credentials (used during seed)
ADMIN_NAME=Municipal Admin Officer
ADMIN_EMAIL=admin@civictrack.org
ADMIN_PASSWORD=Admin@12345

# Client Origin (CORS)
CLIENT_ORIGIN=http://localhost:5173
```

---

## 6. Demo Accounts for Hackathon Judges

To facilitate frictionless evaluation, 1-click login buttons are provided on the Sign-In page (`/login`), or you may log in manually:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Municipal Administrator** | `admin@civictrack.org` | `Admin@12345` | Full administrative console, status transitions, resolution proof submission, report moderation |
| **Citizen Contributor** | `sarah.j@civictrack.org` | `Citizen@12345` | Issue reporting, democratic upvoting, personal tracking dashboard |

---

## 7. Backend REST API Reference

### Authentication Endpoints
* `POST /api/auth/register` — Register citizen account (forces `role: citizen` to block privilege escalation)
* `POST /api/auth/login` — Sign in and receive JWT token
* `GET /api/auth/me` — Retrieve profile, reported issues count, and upvote statistics (Requires JWT)

### Issue Management Endpoints
* `GET /api/issues` — Query all issues with text search, category, status, urgency filter, and pagination
* `GET /api/issues/:id` — Get single issue by ID or tracking code (e.g., `CT-DEMO-1001`)
* `POST /api/issues` — Create report with location and optional photo upload (Requires JWT)
* `POST /api/issues/:id/upvote` — Atomic upvote/downvote toggle (Enforces 1 vote per user)
* `PATCH /api/issues/:id/status` — Change status with audit notes & proof image (**Admin Only**)
  * Supports forward progression: *Pending &rarr; In Progress &rarr; Resolved*
  * Supports deliberate rollback/reopening (e.g. *Resolved &rarr; In Progress* or *In Progress &rarr; Pending*) with mandatory explanatory audit note
* `DELETE /api/issues/:id` — Delete/moderate issue (**Admin Only** or author if still Pending)

### Dashboard Analytics Endpoints
* `GET /api/dashboard/stats` — Real-time MongoDB counts for total, pending, in-progress, resolved, category breakdown, and live activity stream

---

## 8. Automated Testing & Verification

Run the automated test suite verifying all critical backend logic, security controls, and upvote uniqueness:
```bash
npm run test:server
```

### Test Suite Results (14 / 14 Passed, 0 Failures)
1. `GET /api/health` — Online status and API metadata verified
2. `POST /api/auth/register` — Citizen registration and role-tampering immunity verified (role locked to `citizen`)
3. `POST /api/auth/register` — Duplicate email registration cleanly rejected (HTTP 400)
4. `POST /api/auth/login` — Password verification and JWT issuance verified
5. Admin setup and authentication verified
6. `POST /api/issues` — Authenticated issue creation with unique `CT-YYYY-XXXX` tracking ID verified
7. `GET /api/issues` — Multi-parameter filtering (category, status, urgency, search) verified
8. `POST /api/issues/:id/upvote` — Atomic upvote toggle and duplicate vote rejection verified
9. Ordinary citizen forbidden from administrative status transitions (HTTP 403) verified
10. Admin status progression (*Pending &rarr; In Progress &rarr; Resolved*) with timeline audit verified
11. Admin status rollback without explanation note properly rejected (HTTP 400) verified
12. Admin status rollback with audit note successfully recorded in history verified
13. `GET /api/dashboard/stats` — Real database-derived aggregations verified

---

## 9. MongoDB Database Configuration

CivicTrack supports two database modes:

### Mode A: Zero-Configuration Embedded In-Memory MongoDB (Default)
If no local MongoDB daemon is running, CivicTrack automatically starts an embedded In-Memory MongoDB instance on server boot. This requires **zero setup** and allows hackathon judges to immediately launch and evaluate the application with seed data without installing or starting MongoDB services.

### Mode B: Persistent Local or Cloud MongoDB (Production / Development)
To persist data permanently across restarts:
1. **Local MongoDB:** Start the MongoDB service on your machine (`mongodb://127.0.0.1:27017/civictrack`).
2. **MongoDB Atlas (Cloud):** Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a database user, and paste your connection URI into `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/civictrack?retryWrites=true&w=majority
   ```

---

## 10. Deployment Guidance

* **Backend (Render / Railway / Fly.io):**
  * Root directory: `server`
  * Build command: `npm install`
  * Start command: `node src/server.js`
  * Environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN`
* **Frontend (Vercel / Netlify):**
  * Root directory: `client`
  * Build command: `npm run build`
  * Output directory: `dist`
  * Environment variables: `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 11. 2-3 Minute Hackathon Demo Walkthrough

1. **Landing Page:** Open [http://localhost:5173](http://localhost:5173). Highlight the live KPI cards, category breakdown, and "How It Works" 3-step loop.
2. **Citizen Issue Reporting:** Click "Report an Issue", log in using the 1-click **Demo Citizen** button (`sarah.j@civictrack.org` / `Citizen@12345`). Fill out a complaint, attach a photo, and submit. Note the generated unique tracking ID.
3. **Democratic Upvoting:** Head to "Explore Issues", locate an issue, and click the Upvote button. Observe the counter increment immediately and the **Community Priority** badge activate when threshold is crossed.
4. **Administrative Console:** Log out and log in with the 1-click **Demo Admin** button (`admin@civictrack.org` / `Admin@12345`). Navigate to the **Admin Portal**. Show the Recharts category breakdown and live activity stream.
5. **Status Transition & Resolution Proof:** In the issue table, click "Update" on a pending issue. Transition it to **In Progress** with an inspection note, then transition to **Resolved** with a public resolution note and proof image.
6. **Audit Verification:** Open the resolved issue details page to verify the permanent, chronological resolution timeline with timestamps and officer credentials.
