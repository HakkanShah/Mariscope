# Prompts I Used During Mariscope Development

This file is my personal prompt bank for building and debugging Mariscope end-to-end.

## How I Prompted
- I always referenced [`TASK.md`](TASK.md), [`ARCHITECTURE.md`](ARCHITECTURE.md), [`DOMAIN_SPEC.md`](DOMAIN_SPEC.md), and [`AGENTS.md`](AGENTS.md).
- I asked for small, verifiable increments.
- I asked for tests along with implementation.
- After every major change, I ran lint/typecheck/tests/build.

## A) Build-from-Scratch Prompts

### 1. Full foundation prompt
```text
Implement this repository according to TASK.md, ARCHITECTURE.md, DOMAIN_SPEC.md, and AGENTS.md.
Use strict TypeScript, hexagonal architecture, and include tests for all use-cases and HTTP endpoints.
Keep core domain logic framework-independent.
```

### 2. Backend architecture scaffolding
```text
Create backend modules using hexagonal architecture:
core/domain, core/application, core/ports, adapters/inbound/http, adapters/outbound/postgres, infrastructure.
Do not couple core to Express or PostgreSQL APIs.
```

### 3. Frontend architecture scaffolding
```text
Create frontend modules using hexagonal architecture:
core/domain, core/application, core/ports, adapters/ui, adapters/infrastructure/api, shared.
Do not put domain formulas inside React components.
```

## B) Feature Implementation Prompts

### 4. Routes tab + API
```text
Implement Routes end-to-end:
- GET /routes with filters
- POST /routes/:id/baseline
- frontend Routes tab with filters, table/cards, and baseline action
- tests for use-cases + endpoint + UI
```

### 5. Compare tab + API
```text
Implement Compare feature:
- GET /routes/comparison
- percentDiff formula and compliant flag per spec
- frontend chart + table + baseline handling
- tests for baseline edge cases
```

### 6. Banking feature
```text
Implement Banking feature:
- GET /banking/records
- POST /banking/bank
- POST /banking/apply
Validate rules from DOMAIN_SPEC.md and return clear API errors.
Add tests for valid and invalid apply/bank scenarios.
```

### 7. Pooling feature
```text
Implement Pooling feature:
- GET /compliance/adjusted-cb
- POST /pools with greedy allocation
Enforce:
- Sum(adjustedCB) >= 0
- deficit ship cannot exit worse
- surplus ship cannot exit negative
Include multi-ship tests.
```

## C) Refactor + Quality Prompts

### 8. Strict TypeScript cleanup
```text
Fix all TypeScript errors without using any or suppressions.
Respect exact optional property typing and maintain architecture boundaries.
```

### 9. ESLint cleanup
```text
Fix all ESLint issues while preserving behavior.
Do not disable rules globally.
```

### 10. Test hardening prompt
```text
Expand tests for edge cases:
- missing baseline
- invalid bank/apply amounts
- invalid pools
- responsive UI behavior with duplicated mobile/desktop markup
```

## D) Debugging Prompts (Important)

### 11. Generic bug triage prompt
```text
Given this error and stack trace, identify:
1) root cause
2) exact file/line to change
3) minimal fix
4) test updates needed
Do not propose broad rewrites unless necessary.
```

### 12. Frontend 400/500 debugging prompt
```text
I am getting API errors in browser console.
Cross-check frontend request shape and route against backend validators/handlers.
Show contract mismatch and patch both tests and code.
```

### 13. TypeScript compile failure debugging prompt
```text
Investigate this TS compile error from CI logs.
Fix with strict typing and explain why the previous code failed.
```

### 14. Deployment build failure debugging prompt
```text
Analyze these Render/Vercel logs and provide exact changes:
- build command
- start command
- node version
- env vars
Then patch code/config if required.
```

### 15. Database connectivity debugging prompt
```text
Diagnose DATABASE_URL / SSL / pooler issues from production logs.
Give exact environment variable values and connection-string format guidance.
```

### 16. CORS debugging prompt
```text
Frontend cannot call backend in production due to CORS.
Provide exact origin configuration and validation steps using browser devtools/network.
```

## E) Data and Seed Prompts

### 17. Seed enrichment prompt
```text
Add richer seed data for evaluator scenarios:
- baseline per year
- mixed surplus and deficit
- initial bank/apply entries
Update impacted tests.
```

### 18. Safe seed migration prompt
```text
Implement seed functions that only insert default data when tables are empty.
Avoid overwriting existing user data.
```

## F) UX and Product Prompts

### 19. User-friendly action feedback prompt
```text
Replace silent disabled states with actionable user guidance where appropriate.
When action is invalid, show explicit reason and next step.
```

### 20. Mobile responsiveness prompt
```text
Make all pages mobile-friendly:
- avoid horizontal overflow
- add small-screen card layouts
- preserve desktop tables for larger screens
- update tests if DOM structure duplicates content.
```

### 21. Visual design polish prompt
```text
Apply a unique maritime visual style:
- stronger but readable color system
- refined typography hierarchy
- elevated component surfaces
- maintain accessibility and contrast
```

### 22. Smooth transition prompt
```text
Add smooth page transition animations for tab/route changes with reduced-motion fallback.
Keep performance acceptable on mobile.
```

## G) Documentation Prompts

### 23. Evaluator-ready README prompt
```text
Rewrite README for evaluators:
- quick links to all required docs
- architecture summary
- setup, env, tests, build
- API samples
- deployment notes
- screenshots from Assets
```

### 24. Agent workflow documentation prompt
```text
Create AGENT_WORKFLOW.md with:
- agents used
- prompts and outputs
- validations/corrections
- observations and best practices
```

### 25. Submission finalization prompt
```text
Check submission readiness:
- required markdown files present
- links are clickable
- README references all artifacts
- docs are consistent with current codebase
```

## My Prompting Rules of Thumb
- I keep prompts concrete and constrained by file paths.
- I include acceptance criteria in every non-trivial prompt.
- I ask for tests in the same prompt as implementation.
- I request root-cause analysis first for debugging prompts.
