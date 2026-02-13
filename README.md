# Mariscope

Mariscope is a FuelEU Maritime compliance workspace with a React dashboard and a Node.js API.
It covers route management, compliance balance (CB), Article 20 banking, and Article 21 pooling.

## Overview

Features implemented:

- Routes tab with required columns and filters (`vesselType`, `fuelType`, `year`)
- Baseline route selection (`POST /routes/:id/baseline`)
- Comparison view from `/routes/comparison` with `% difference` and compliance flag
- Compliance CB endpoints (`/compliance/cb`, `/compliance/adjusted-cb`)
- Banking endpoints (`/banking/bank`, `/banking/apply`, `/banking/records`)
- Pooling endpoint (`POST /pools`) with greedy allocation and rule enforcement

## Architecture Summary

Hexagonal architecture is used on both backend and frontend.

Backend (`backend/src`):

- `core/domain`: pure business rules (CB math, banking, pooling, comparison)
- `core/application`: use-cases and orchestration
- `core/ports`: dependency interfaces
- `adapters/inbound/http`: Express routes/controllers
- `adapters/outbound/*`: memory and PostgreSQL implementations
- `infrastructure/*`: config, schema init, dependency wiring, server bootstrap

Frontend (`frontend/src`):

- `core/domain`: UI-facing domain contracts
- `core/application`: framework-agnostic use-cases
- `core/ports`: API port interfaces
- `adapters/infrastructure/api`: HTTP client and API adapter
- `adapters/ui`: React pages and app shell

## Tech Stack

- Backend: Node.js, TypeScript, Express, PostgreSQL
- Frontend: React, TypeScript, TailwindCSS, Recharts
- Testing: Vitest + Supertest + Testing Library

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run development servers

```bash
npm run dev
```

This runs workspace dev scripts:

- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

### 3. Configure persistence (optional)

Default is in-memory persistence.

Use PostgreSQL by setting:

- `PERSISTENCE_DRIVER=postgres`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/mariscope`

Schema and seed are auto-initialized at backend startup.

Seed notes (fresh database):

- Routes: 6 seeded routes (`R001`-`R006`)
- Baselines: `R001` for 2024 and `R004` for 2025
- Banking ledger: initial `bank_entries` are seeded to make Banking/Apply flows testable immediately

## Quality Gates

Run all checks:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## API Samples

### Get routes

```http
GET /routes?fuelType=LNG&year=2025
```

Example response (abridged):

```json
{
  "routes": [
    {
      "id": "R005",
      "vesselType": "Container",
      "fuelType": "LNG",
      "year": 2025,
      "ghgIntensityGco2ePerMj": 90.5,
      "fuelConsumptionTonnes": 4950,
      "distanceKm": 11900,
      "totalEmissionsTonnes": 4400,
      "isBaseline": false
    }
  ]
}
```

### Comparison

```http
GET /routes/comparison?year=2024
```

Example response (abridged):

```json
{
  "baseline": {
    "routeId": "R001",
    "year": 2024,
    "ghgIntensityGco2ePerMj": 91
  },
  "targetIntensityGco2ePerMj": 89.3368,
  "comparisons": [
    {
      "routeId": "R002",
      "year": 2024,
      "ghgIntensityGco2ePerMj": 88,
      "percentDiff": -3.2967032967,
      "compliant": true
    }
  ]
}
```

### Banking apply

```http
POST /banking/apply
Content-Type: application/json

{
  "shipId": "R003",
  "amountToApply": 500000
}
```

Example response:

```json
{
  "shipId": "R003",
  "year": 2024,
  "cbBefore": -869869200,
  "applied": 500000,
  "cbAfter": -869369200,
  "remainingBankedAmount": 500000
}
```

### Create pool

```http
POST /pools
Content-Type: application/json

{
  "year": 2024,
  "shipIds": ["R002"]
}
```

Example response:

```json
{
  "poolId": "pool-1",
  "year": 2024,
  "poolSumBefore": 262986240,
  "poolSumAfter": 262986240,
  "entries": [
    {
      "shipId": "R002",
      "cbBefore": 262986240,
      "cbAfter": 262986240
    }
  ]
}
```
