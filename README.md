# SalesReadyAI frontend

A role-based MVP for sales onboarding and readiness. Managers build a trusted Company Brain, create 15-day programs, monitor reps, and certify readiness. Reps complete lessons, assessments, AI interviews, and roleplays with evidence-based feedback.

## Getting started

Requires Node.js 20+.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo credentials are pre-filled.

## Demo routes

- Auth: `/login`, `/invite`
- Manager: `/manager`, `/manager/company`, `/manager/setup`, `/manager/knowledge`, `/manager/research`, `/manager/programs`, `/manager/reps`, `/manager/report`
- Rep: `/rep`, `/rep/learn`, `/rep/assessment`, `/rep/interview`, `/rep/roleplay`, `/rep/feedback`, `/rep/progress`

## Architecture

- Next.js App Router with manager, rep, and auth route groups
- TypeScript and Tailwind CSS v4
- TanStack Query for server-state integration
- React Hook Form and Zod for validated forms
- `src/lib/api.ts` provides the typed backend boundary and optional Zod response validation
- Seeded data in `src/lib/demo-data.ts` keeps every MVP screen renderable

Set the server-only `API_URL` to the backend `/v1` root. It defaults to `http://localhost:3001/v1`, allowing Next.js to remain on port 3000. Authentication tokens stay in HTTP-only cookies and browser requests go through the same-origin Next.js API boundary.

Customer org admin: `/manager`. Rep: `/rep`.

## Verification

```sh
npm run lint
npm run build
```
