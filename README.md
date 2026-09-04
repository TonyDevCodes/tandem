# Tandem - Coach & Client Habit Tracker Marketplace

A full-stack marketplace that connects fitness/nutrition coaches with their clients for daily habit tracking, progress monitoring, and payments.

**Live Demo:** [https://tandem-client.onrender.com](https://tandem-client.onrender.com)
**Test Accounts:**
- Client: `client1@tandem.com` / `test123`
- Coach: `coach1@tandem.com` / `test123`

---

## Features

### Phase 1 – Core Marketplace
- Two-sided marketplace (Coaches ↔ Clients)
- Booking system (request → accept/reject)
- Habit creation & daily check-ins
- Automatic streak calculation
- Role-based dashboards (Coach vs Client)
- JWT authentication with protected routes

### Phase 2 – Payments
- Stripe Connect Express integration
- Coaches set their own session price
- "Authorize now, capture later" payment flow
- Coaches receive payments directly
- Full payment status handling (authorized → captured/canceled)

---

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Custom design system

**Backend**
- Node.js + Express
- PostgreSQL (Neon)
- JWT Authentication
- Role-based access control

**Payments**
- Stripe Connect Express
- Stripe Elements

**Deployment**
- Frontend & Backend on Render
- Auto-deploy from GitHub

---

## Architecture Highlights

- Clean separation between client and server
- Database constraints to prevent invalid states
- Secure payment flow with manual capture
- Middleware for role and relationship checks
- End-to-end tested booking + payment logic

---

## Getting Started

### Backend
```bash
cd server
npm install
# Add your .env (DATABASE_URL, JWT_SECRET, STRIPE keys)
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

---

## API Endpoints

**Auth**
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

**Coaches**
- `GET /coaches` — marketplace discovery
- `PATCH /coaches/me` — coach sets their price

**Bookings**
- `POST /bookings` — client requests a coach (creates Stripe PaymentIntent)
- `GET /bookings/coach/:id`
- `GET /bookings/coach/:id/accepted-clients`
- `PATCH /bookings/:id` — accept (capture payment) / reject (cancel authorization)

**Habits**
- `POST /habits` — coach creates a habit (requires accepted client relationship)
- `GET /habits/coach/:id`
- `GET /habits/client/:id`
- `POST /habits/:id/checkin`
- `GET /habits/:id/streak`

**Stripe**
- `POST /stripe/connect` — coach Connect Express onboarding
- `GET /stripe/status` — check onboarding status

---

## Project Status

- Phase 1: Completed
- Phase 2 (Stripe Connect): Completed
- Future: Notifications, advanced analytics, mobile responsiveness improvements
