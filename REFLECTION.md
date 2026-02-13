# Reflection

Using an AI coding agent was most effective for bulk structural work: creating and refactoring multiple use-cases, ports, adapters, and tests under the same architectural constraints. The biggest gain was speed in producing consistent code patterns across backend and frontend layers.

The main tradeoff was verification overhead. Generated code was often close but not production-ready on first pass. Two recurring correction areas were strict TypeScript constraints (`exactOptionalPropertyTypes`) and domain-specific validity in tests (for example, pool member selections that violated total CB rules). This reinforced that AI output needs deterministic validation, not trust.

Compared to fully manual implementation, the workflow improved throughput significantly for repetitive tasks (endpoint plumbing, DTO mapping, test scaffolding). Manual effort was still critical for domain correctness, edge-case handling, and making sure the architecture boundaries stayed intact.

If repeating this assignment, I would improve the process by front-loading a tighter API contract matrix before coding. That would reduce rework between backend and frontend shape changes. I would also define reusable test fixtures earlier so generated tests are less likely to use invalid business scenarios.

Overall, AI provided strong acceleration, while engineering rigor still came from explicit validation loops and targeted manual corrections.
