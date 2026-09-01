# Tandem

A two-sided marketplace where fitness/nutrition coaches and their clients track daily habits and streaks together.

## Live Demo

**Frontend:** https://tandem-client.onrender.com

Test accounts:
- **Coach:** coach1@tandem.com / test123
- **Client:** client1@tandem.com / test123

## Problem it solves

Individual coaches lack a simple tool to monitor multiple clients at once and assign personalized tasks to each. Tandem formalizes the coach-client relationship (request → accept) and makes daily progress visible to both sides.

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL (hosted on Neon), JWT authentication
- **Frontend:** React, TypeScript, Vite
- **Hosting:** Render (Web Service for backend, Static Site for frontend), auto-deploy from GitHub

## Features

- Role-based authentication (Coach vs Client) with JWT
- Marketplace discovery — clients browse and request coaches
- Booking flow with request/accept/reject, enforced with a `UNIQUE(coach_id, client_id)` constraint
- Habit creation restricted to accepted coach-client relationships only
- Daily check-ins with streak tracking
- Coach dashboard: manage clients, create habits, review pending requests
- Client dashboard: browse coaches, check in on habits, view streaks

## Project Structure

- `client/` — React + TypeScript frontend (Vite)
- `server/` — Node.js + Express backend, PostgreSQL via Neon

## API Endpoints

**Auth**
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

**Habits**
- `POST /habits` — coach creates a habit (requires accepted client relationship)
- `GET /habits/coach/:id`
- `GET /habits/client/:id`
- `POST /habits/:id/checkin`
- `GET /habits/:id/streak`

**Coaches**
- `GET /coaches` — marketplace discovery

**Bookings**
- `POST /bookings` — client requests a coach
- `GET /bookings/coach/:id`
- `GET /bookings/coach/:id/accepted-clients`
- `PATCH /bookings/:id` — accept/reject

## Current Status

**Phase 1 (live):** Full marketplace flow without in-app payments — coach discovery, booking, habit/streak tracking between linked coach-client pairs.

**Phase 2 (planned):** Stripe integration for in-app payments.