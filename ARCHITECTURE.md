# ARCHITECTURE.md
# Mariscope System Architecture

Mariscope follows Hexagonal Architecture (Ports & Adapters).

Goal:
- Separate business logic from frameworks.
- Enable testability.
- Enforce clear boundaries.

---

# 1. Backend Layers

## 1.1 Domain Layer (Core)

Contains:
- Route entity
- ComplianceBalance logic
- Banking rules
- Pooling logic

Rules:
- Pure TypeScript
- No DB imports
- No Express types
- No side effects

---

## 1.2 Application Layer

Contains:
- Use-cases (ComputeCB, BankSurplus, CreatePool)
- Orchestration logic
- Validation

Depends on:
- Domain
- Ports

---

## 1.3 Ports

Interfaces only:
- RouteRepository
- ComplianceRepository
- BankRepository
- PoolRepository

---

## 1.4 Adapters

Inbound:
- HTTP controllers

Outbound:
- PostgreSQL implementations

---

## 1.5 Infrastructure

- Express server setup
- DB initialization
- Dependency wiring

---

# 2. Frontend Layers

Core:
- Domain models
- Use-cases
- API ports

Adapters:
- UI (React)
- API client implementations

---

# 3. Why This Matters

Benefits:
- Test domain without DB
- Swap DB without touching logic
- Swap UI without touching domain
- Maintain long-term scalability
