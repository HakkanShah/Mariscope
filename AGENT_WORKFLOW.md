# AI Agent Workflow Log

## Scope
I used this workflow to build, harden, and polish the Mariscope assignment deliverable.

Related files:
- [`Prompts.md`](Prompts.md) (full prompt catalog and reusable templates)
- [`README.md`](README.md) (evaluator-facing project summary)
- [`REFLECTION.md`](REFLECTION.md) (learning summary)

## Agents Used
- OpenAI Codex (primary coding agent for implementation, refactoring, testing, and docs)
- GitHub Copilot (inline completion support during local editing, optional)

## Prompt Strategy
I used a phased workflow instead of one-shot generation:
1. Foundation prompt for architecture-compliant scaffolding
2. Feature prompts per use-case (routes, comparison, banking, pooling)
3. Validation prompts to resolve lint/type/test failures
4. Deployment/debug prompts for environment and connectivity issues
5. UX polish prompts for responsive design and error handling

## Prompts and Outputs
### Example 1: Build from architecture and domain docs
Prompt:
```text
Implement backend and frontend features according to TASK.md, ARCHITECTURE.md, DOMAIN_SPEC.md, and AGENTS.md.
Constraints: strict TypeScript, hexagonal architecture boundaries, and tests for each use-case.
```
Output summary:
- Implemented/validated required endpoints and use-cases for routes, compliance, banking, and pooling
- Ensured separation between `core`, `ports`, adapters, and infrastructure
- Added/updated frontend tabs and API adapter usage

### Example 2: Correct business-flow mismatch in banking/apply UX
Prompt:
```text
Diagnose why Banking Apply action is unusable with seed data. Keep domain rules intact, improve user flow, and add tests.
```
Output summary:
- Refactored banking balance handling to shared ledger semantics in repository adapters
- Updated banking records use-case and UI behavior
- Added unit + integration tests for cross-ship ledger apply behavior

### Example 3: Improve responsive UX and user guidance
Prompt:
```text
Improve mobile responsiveness and UX. Replace silent button disabling with actionable user-facing messages where possible. Keep tests green.
```
Output summary:
- Added mobile card layouts for all pages while keeping desktop tables
- Reworked action handling to show guidance messages
- Added transition polish and responsive navigation improvements

## Validation and Corrections
I ran these validation gates repeatedly:
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

Main corrections I made after validation:
- Fixed exact optional input construction in handlers and adapters
- Updated tests for responsive dual-render structures (mobile + desktop views)
- Corrected comparison behavior for years without baseline
- Corrected seed assumptions and tests after adding richer route/banking seed data

## Observations
Where agents saved me time:
- Fast scaffolding for repetitive port/adapter wiring
- Rapid iteration on integration tests and frontend behavior
- Efficient cross-file refactors under strict architecture constraints

Where I still needed manual correction:
- Initial assumptions around pooling and baseline edge-cases
- Adjusting generated tests to match updated seed semantics
- Tightening UX logic so user guidance is explicit and deterministic

## Best Practices Followed
- Kept domain rules in `core/domain` and orchestration in `core/application`
- Avoided framework/DB coupling in core logic
- Required tests for changed behavior before considering work complete
- Used incremental, test-driven corrections after each significant change
- Preserved submission artifacts requested by assignment brief
