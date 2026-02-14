# Mariscope  

Mariscope is a FuelEU Maritime compliance workspace built for the full-stack assignment brief.  
It provides a React dashboard and Node.js API for route comparison, compliance balance (CB), banking (Article 20), and pooling (Article 21).

## Quick Links
- Assignment brief: [`TASK.md`](TASK.md)
- Architecture rules: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Domain/business rules: [`DOMAIN_SPEC.md`](DOMAIN_SPEC.md)
- Agent operation rules: [`AGENTS.md`](AGENTS.md)
- AI workflow log: [`AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md)
- Prompt catalog: [`Prompts.md`](Prompts.md)
- Prompting guide: [`PROMPT_GUIDE.md`](PROMPT_GUIDE.md)
- Testing strategy: [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md)
- Reflection: [`REFLECTION.md`](REFLECTION.md)

## Evaluator Checklist Mapping
| Area | Evidence |
| --- | --- |
| Architecture discipline | Hexagonal structure in `backend/src` and `frontend/src`, documented in [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Functionality completeness | Routes, Compare, Banking, Pooling tabs and matching API endpoints |
| Code quality | Strict TypeScript, ESLint clean, tests and builds passing |
| Business correctness | CB, banking, pooling rules implemented per [`DOMAIN_SPEC.md`](DOMAIN_SPEC.md) |
| AI-agent transparency | [`AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md) + [`Prompts.md`](Prompts.md) + [`REFLECTION.md`](REFLECTION.md) |
| UX | Mobile-responsive layout, user-facing action guidance, route transitions |

## Project Summary
This repository is organized as a monorepo with workspace packages:
- `frontend/` for React + TypeScript UI
- `backend/` for Node.js + TypeScript API

Core goals:
- enforce clean architecture boundaries
- keep domain rules testable and framework-independent
- provide evaluator-friendly documentation and reproducible setup

## Repository Structure
```text
.
|- frontend/
|  |- src/
|  |  |- core/
|  |  |- adapters/
|  |  `- shared/
|- backend/
|  |- src/
|  |  |- core/
|  |  |- adapters/
|  |  |- infrastructure/
|  |  `- shared/
|- Assets/
|- README.md
|- TASK.md
|- AGENT_WORKFLOW.md
`- Prompts.md
```

## Features Implemented

### Frontend Tabs
- `Routes`: list/filter routes, set baseline
- `Compare`: baseline comparison table + chart, compliant/non-compliant status
- `Banking`: bank surplus, apply ledger amount, KPI cards and records
- `Pooling`: ship selection, pool-sum validation, allocation result

### Backend Endpoints
- `GET /routes`
- `POST /routes/:id/baseline`
- `GET /routes/comparison`
- `GET /compliance/cb`
- `GET /compliance/adjusted-cb`
- `GET /banking/records`
- `POST /banking/bank`
- `POST /banking/apply`
- `POST /pools`

## Architecture Summary

### Backend
- `core/domain`: pure domain math/rules
- `core/application`: use-case orchestration
- `core/ports`: interfaces
- `adapters/inbound/http`: Express routes
- `adapters/outbound/*`: memory/Postgres adapters
- `infrastructure/*`: wiring, config, bootstrap

### Frontend
- `core/domain`: UI-facing models
- `core/application`: framework-agnostic use-cases
- `core/ports`: API contracts
- `adapters/infrastructure/api`: HTTP and API client adapters
- `adapters/ui`: React pages/components
- `shared/*`: styling, shared UI, error helpers

## UI Screenshots

### Routes
![Routes](Assets/Mariscope_routes.png)

### Compare
![Compare](Assets/Mariscope_compare.png)

### Banking
![Banking](Assets/Mariscope_banking.png)

### Pooling
![Pooling](Assets/Mariscope_pooling.png)

## Local Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Install
```bash
npm install
```

### Copy env files
Windows (PowerShell):
```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

macOS/Linux:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Run (frontend + backend)
```bash
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Environment Configuration

### Backend (`backend/.env`)
| Variable | Example | Notes |
| --- | --- | --- |
| `PORT` | `3001` | Server port |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/mariscope` | Required when `PERSISTENCE_DRIVER=postgres` |
| `PERSISTENCE_DRIVER` | `memory` or `postgres` | Storage mode |
| `CORS_ORIGIN` | `http://localhost:5173` | Frontend origin |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `NODE_ENV` | `development` | Runtime env |

### Frontend (`frontend/.env`)
| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:3001` | Backend base URL |

## Seeds and Test Data
- Fresh DB route seed includes `R001`-`R006`
- Default baselines: `R001` (2024), `R004` (2025)
- Initial banking ledger entries are seeded for realistic banking/apply flows
- Seed runs only when target tables are empty

If DB already has rows, re-seeding does not overwrite data.

## Quality Gates

From repo root:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Package-level commands:
```bash
npm run test --workspace @mariscope/backend
npm run test --workspace @mariscope/frontend
```

## API Example Requests

### Routes
```http
GET /routes?fuelType=LNG&year=2025
```

### Comparison
```http
GET /routes/comparison?year=2025
```

### Bank Surplus
```http
POST /banking/bank
Content-Type: application/json

{
  "shipId": "R002",
  "amountToBank": 100000
}
```

### Apply Banked
```http
POST /banking/apply
Content-Type: application/json

{
  "shipId": "R003",
  "amountToApply": 50000
}
```

### Create Pool
```http
POST /pools
Content-Type: application/json

{
  "year": 2024,
  "shipIds": ["R002", "R003"]
}
```

## Deployment Notes (Current Setup)
- Frontend: Vercel
- Backend: Render
- Database: Supabase Postgres

Production basics:
- Set `VITE_API_BASE_URL` in frontend deployment
- Set backend `CORS_ORIGIN` to deployed frontend URL
- Set backend `DATABASE_URL` and `PERSISTENCE_DRIVER=postgres`
- Ensure DB SSL/network settings match hosting provider requirements

## Evaluation Notes
- API contracts are aligned to assignment requirements in [`TASK.md`](TASK.md).
- Seed data is designed to demonstrate valid and invalid flows for Compare, Banking, and Pooling.
- UI includes explicit user-facing feedback for invalid actions instead of silent failures.
- Mobile UX includes responsive tab navigation and small-screen card/table adaptations.

## Submission Artifacts
Required docs are present:
- [`README.md`](README.md)
- [`AGENT_WORKFLOW.md`](AGENT_WORKFLOW.md)
- [`Prompts.md`](Prompts.md)
- [`REFLECTION.md`](REFLECTION.md)

Supporting docs:
- [`TASK.md`](TASK.md)
- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`DOMAIN_SPEC.md`](DOMAIN_SPEC.md)
- [`PROMPT_GUIDE.md`](PROMPT_GUIDE.md)
- [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md)
