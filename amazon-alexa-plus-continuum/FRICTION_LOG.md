# Amazon Developer Hackathon — Friction Log

The official rules provide up to a 10% Stage 2 bonus for useful friction logs. This log is written to be actionable rather than promotional.

## 1. Alexa+ gated preview tooling
- Task: determine whether hackathon entrants can access Alexa+ Category SDK / MCP Toolkit / CLI / Web Simulator.
- Expected: a clear self-serve developer path from the Alexa+ track page.
- Actual: official FAQ clarifies these tools are preview-only for selected partners and cannot be requested by entrants.
- Severity: High during onboarding because individual docs can imply availability.
- Workaround: build the permitted self-hosted MCP server or own web simulator.
- Suggested fix: place the access limitation and alternate path at the top of every Alexa+ hackathon setup guide.

## 2. MCP compatibility validation
- Task: confirm a self-hosted server meets the required minimum MCP spec version.
- Expected: hackathon-provided conformance command or checklist.
- Actual: rules name minimum spec `2025-11-25` but do not provide a single hackathon validation command.
- Severity: Medium.
- Workaround: explicitly advertise the protocol version during initialize and add deterministic discovery tests.
- Suggested fix: publish a tiny validation harness that checks initialize + tools/list + one tools/call round trip.

## 3. Submission repository scope
- Task: determine whether a branch/subdirectory is acceptable when the repo also contains unrelated code.
- Expected: explicit repository granularity guidance.
- Actual: rules require a GitHub repository but do not specify whether the project must be repo-root.
- Severity: Low.
- Workaround: provide an exact branch/subdirectory URL and self-contained run instructions.
- Suggested fix: state whether judges accept repo root, branch URL, or monorepo subdirectory.
