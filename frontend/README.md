# CICADA 2067 — Frontend

A unified single-page app that merges the previously scattered frontend branches
(`Landing`, `terminal`, `admin-dashboard`) into one flow and connects it to the
[`cicada-26-backend`](https://github.com/IEEECS-VIT/cicada-26-backend) API.

## User flow

```
Landing (/)  →  Google OAuth (/login → /auth/callback)  →  Create / Join Team (/team-setup)
                                                                    ↓
                                              Terminal (/terminal) — live challenges
```

Admin access is enclosed behind `/admin` and only reachable by authenticated
admins (role `admin` / `GOD`), talking to the backend admin APIs.

**Mobile:** only the landing page (`/`) renders on mobile. Every other route shows
a "DESKTOP REQUIRED" barrier.

## Tech stack

- React 19 + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router v7
- Supabase JS (Google OAuth)
- three.js (landing tunnel + TARS)

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # fill in real values
npm run dev            # http://localhost:5173
```

### Environment variables (`.env`)

| Variable                | Purpose                                             |
|-------------------------|-----------------------------------------------------|
| `VITE_API_URL`          | Backend base URL (e.g. `http://localhost:5000`)     |
| `VITE_SUPABASE_URL`     | Supabase project URL                                |
| `VITE_SUPABASE_ANON_KEY`| Supabase anon key (Google OAuth)                    |

## Routes

| Path             | Description                                        |
|------------------|----------------------------------------------------|
| `/`              | Landing page (hero, timeline tunnel, FAQ)          |
| `/login`         | Google OAuth sign-in                               |
| `/auth/callback` | OAuth callback → backend session exchange          |
| `/dashboard`     | Post-login router (→ terminal or team setup)       |
| `/team-setup`    | Create a team or join via invite code              |
| `/terminal`      | Challenge terminal (live backend data)             |
| `/admin`         | Admin dashboard (admin-only, live backend data)    |
| `/team`          | Crew portal page                                   |
| `/puzzles`, `/insights`, `/discord` | Coming-soon pages                 |

## Project structure

```
frontend/src/
├── api/          # Backend API clients (auth, teams, challenges, admin)
├── components/   # Terminal + Footer + AdminDashboard + MobileBarrier
├── context/      # AuthContext, GameStateContext (live API state)
├── landing/      # Ported landing components (Next.js → React)
├── lib/          # tunnel.ts (WebGL timeline), supabase client
├── pages/        # Route-level pages
└── styles/       # Landing design-system CSS
```

## Build & lint

```bash
npm run build
npm run lint
```
