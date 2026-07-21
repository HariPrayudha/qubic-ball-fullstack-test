# Stats Service — Node.js / TypeScript (second backend)

Standalone statistics endpoint that reads the same MySQL database (read-only) and returns
ticket aggregates. Demonstrates the second backend technology (Node.js) alongside the
PHP/Laravel main API. Does not depend on the main application.

Stack: Node.js, TypeScript, Express 5, mysql2, Zod, Vitest.

```bash
cp .env.example .env
npm install
npm run dev       # http://localhost:4000/stats
npm test          # Vitest
```

## Endpoints
- `GET /health` — liveness probe
- `GET /stats` — `{ total, byStatus, avgResolutionHours, createdLast7Days }`
