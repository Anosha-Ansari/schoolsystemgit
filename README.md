# SmartSchool ERP

A frontend school management system / ERP built with React 19, TypeScript, and Tailwind CSS. Covers admissions, students, teachers, attendance, examinations, results, fees, library, transport, hostel, parent/student portals, messaging, and analytics — all running against a seeded in-browser dataset, no backend required.

> **Note:** This is a frontend-only demo. There is no real server, database, or authentication backend — all data lives in a seeded, in-memory store (`src/lib/db.ts`) and resets on page reload. The "JWT" auth and API layer (`src/lib/api.ts`) simulate what a real Express/MongoDB backend would look like, so the UI can be wired up to a real API later with minimal changes.

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 7** for build tooling
- **Tailwind CSS 4**
- **React Router 7** (HashRouter, lazy-loaded routes)
- **Zustand** for state management
- **TanStack Query** for data fetching/caching
- **Recharts** for charts/analytics
- **Framer Motion** for animations

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
```

Copy `.env.example` to `.env` if/when you connect a real backend (not required for the current mock-data build).

### Development

```bash
npm run dev
```

Runs the app at `http://localhost:5173` (default Vite port).

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

Outputs a production build to `dist/`. Note: this project uses `vite-plugin-singlefile`, so the entire build is bundled into a single HTML file.

### Preview production build

```bash
npm run preview
```

## Demo Accounts

All demo accounts use the password: **`school123`**

| Role | Email |
|---|---|
| Super Admin | superadmin@smartschool.pk |
| Admin | admin@smartschool.pk |
| Teacher | teacher@smartschool.pk |
| Student | student@smartschool.pk |
| Parent | parent@smartschool.pk |
| Accountant | accountant@smartschool.pk |
| Librarian | librarian@smartschool.pk |

## Project Structure

```
src/
├── components/       # Shared UI (layout, charts, primitives)
├── lib/
│   ├── db.ts         # Seeded in-browser "database"
│   ├── api.ts        # Simulated API layer, RBAC, fake JWT
│   ├── store.ts       # Zustand stores (auth, UI, query client)
│   └── portal.tsx     # Portal-related helpers
├── pages/            # Route-level page components, grouped by domain
├── utils/            # Small utilities (e.g. classnames helper)
├── App.tsx           # Route definitions
└── main.tsx          # App entry point
```

## Features

- **Public site**: home, about, admissions, academics, faculty, events, gallery, contact
- **Auth**: login, register, forgot/reset password, email verification (simulated)
- **Students**: list, profile, class management, calendar
- **Teachers & Ops**: staff list/profile, payroll, leaves, library, transport, hostel
- **Attendance & Exams**: attendance hub, exam creation, marks entry, results, assignments
- **Finance & Communications**: fees, revenue, overdue tracking, reports, notices, messaging, AI insights, audit log, events admin
- **Portals & Settings**: parent portal, student portal, settings, roles, system health, profile
- **Role-based access control** across 7 roles (super admin, admin, teacher, student, parent, accountant, librarian)

## Known Limitations

- No real backend — data does not persist between sessions.
- Auth tokens are simulated and are **not cryptographically secure**; do not reuse this auth approach in production.
- Passwords are stored in plaintext in the seed data (for demo purposes only).
- No automated tests currently.

## Roadmap / Ideas for Improvement

- [ ] Connect to a real backend (Express/MongoDB or similar) and swap out the mock `api.ts` layer
- [ ] Replace the fake JWT with real signed tokens and hashed passwords
- [ ] Add unit/integration tests (Vitest + React Testing Library)
- [ ] Add ESLint configuration
- [ ] Add `.env.example` for environment configuration

## License

Not yet licensed — add a `LICENSE` file if you plan to share or open-source this project.
