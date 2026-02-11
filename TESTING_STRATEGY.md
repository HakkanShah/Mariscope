# TESTING_STRATEGY.md

# 1. Unit Tests

Must cover:

- ComplianceBalance computation
- Percent difference calculation
- BankSurplus validation
- ApplyBanked validation
- CreatePool allocation logic

Each use-case must have:
- Positive case
- Negative case
- Edge case

---

# 2. Integration Tests

Test:
- GET /routes
- POST /routes/:id/baseline
- GET /compliance/cb
- POST /banking/bank
- POST /pools

Use Supertest.

---

# 3. Data Seeding

- Seed initial 5 routes.
- At least one baseline route.
- Test DB must reset per run.

---

# 4. Pooling Edge Cases

- Total CB negative → reject
- Surplus exhausted before deficit resolved
- Multiple surplus contributors
