# AI Agent Workflow Log

## Agents Used

- OpenAI Codex (primary implementation, refactoring, and test generation)

## Prompts & Outputs

### Example 1

Prompt used:

```text
Complete the repository according to TASK.md with strict hexagonal architecture, implement missing backend endpoints and frontend tabs, and include tests.
```

Generated outcome (summarized):

- Added new backend use-cases and endpoints:
  - `/routes/comparison`
  - `/compliance/adjusted-cb`
  - `/banking/records`
- Refactored route domain model to required dataset fields (`vesselType`, `fuelType`, `year`, etc.)
- Added/updated frontend pages for Routes, Compare, Banking, and Pooling based on new API contracts

### Example 2

Prompt refinement:

```text
Fix strict TypeScript + ESLint failures after refactor, especially exact optional property handling and unsafe test body access.
```

Generated outcome (summarized):

- Reworked HTTP query parsing to avoid passing `undefined` into exact-optional inputs
- Added explicit response interfaces in integration tests to remove unsafe `any` access
- Updated tests to match corrected pooling rule behavior

## Validation / Corrections

Validation steps executed:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

Corrections applied during validation:

- Adjusted pooling test data where selected members had negative aggregate CB
- Tightened route handler input construction for exact optional types
- Expanded integration response typing to satisfy strict lint rules

## Observations

- Time saved:
  - Rapid generation of repetitive adapters/use-case wiring
  - Fast refactoring across many files with consistent naming
- Failure/hallucination points:
  - Initial generated tests assumed non-negative pool totals for invalid seed combinations
  - Some generated handlers passed optional fields in a way incompatible with `exactOptionalPropertyTypes`
- Effective combination:
  - Agent-driven broad refactor first, then strict quality-gate-driven tightening

## Best Practices Followed

- Kept domain logic framework-independent and inside `core/domain`
- Preserved dependency flow (`core -> ports -> adapters -> infrastructure`)
- Added/updated unit and integration tests with edge-case coverage
- Used quality gates after each major refactor step before moving forward
