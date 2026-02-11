# AGENTS.md
# Mariscope – AI Agent Operating Manual

This file defines how AI coding agents must operate when contributing to Mariscope.

Mariscope is a FuelEU Maritime compliance platform.

Tech Stack:
- Backend: Node.js + TypeScript + PostgreSQL
- Frontend: React + TypeScript + TailwindCSS
- Architecture: Hexagonal (Ports & Adapters)
- Testing: Unit + Integration

Agents must strictly follow architecture and domain rules.

---

# 1. Core Principles

1. Architecture discipline over speed.
2. Domain logic must be pure and framework-independent.
3. All business logic must be testable.
4. Strict TypeScript – no `any`.
5. Tests are mandatory for each feature.

---

# 2. Architecture Rules

## Backend Structure

backend/src/
  core/
    domain/
    application/
    ports/
  adapters/
    inbound/http/
    outbound/postgres/
  infrastructure/
  shared/

Rules:
- core has zero framework dependencies.
- application orchestrates domain logic.
- ports define interfaces only.
- adapters implement ports.
- infrastructure wires everything together.

Dependency flow:
core → ports → adapters → infrastructure

Never reverse this.

---

## Frontend Structure

frontend/src/
  core/
    domain/
    application/
    ports/
  adapters/
    ui/
    infrastructure/api/
  shared/

Rules:
- React components cannot contain domain math.
- API logic lives in infrastructure adapters.
- Use-cases must be framework-agnostic.

---

# 3. Business Logic Constraints

Target Intensity (2025): 89.3368 gCO2e/MJ

Energy in scope:
fuelConsumption × 41000 MJ/t

Compliance Balance:
(Target − Actual) × Energy

Positive → Surplus  
Negative → Deficit  

Banking:
- Only positive CB can be banked.
- Cannot apply more than banked.

Pooling:
- Sum(adjusted CB) ≥ 0
- Deficit ship cannot exit worse.
- Surplus ship cannot exit negative.
- Use greedy allocation.

---

# 4. Testing Requirements

Each use-case must have:
- Unit tests
- Edge case tests

HTTP endpoints must have:
- Integration tests
- Supertest coverage

Pooling must include multi-ship scenarios.

---

# 5. Agent Operating Rules

When generating code:
- Do not hallucinate missing regulation rules.
- Ask clarification questions if ambiguous.
- Do not couple domain to Express or DB.
- Always include test files.
- Suggest a commit message after changes.

---

# 6. Completion Checklist

Before finishing any task:
- Tests pass
- Strict types enforced
- ESLint clean
- Architecture respected
