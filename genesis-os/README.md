# Genesis OS

**A policy-governed capability runtime for composable autonomous intelligence.**

Genesis OS is a reference architecture and working kernel for systems that turn goals into auditable capability graphs instead of hard-wiring one model, one agent framework, or one application stack.

It is intentionally **not** marketed as AGI. The engineering target is narrower and testable:

> Given an objective, discover and compose capabilities, execute them through one policy boundary, evaluate the outcome, retain useful experience, and allow the surrounding capability set to grow without rewriting the kernel.

## Why this exists

The current agent ecosystem has excellent pieces but fragmented control planes: agent frameworks, memory engines, browser/computer-use systems, sandboxes, research loops, workflow systems, skill registries, model routers, financial data stacks, media generators, and vertical agents. Genesis treats those as replaceable providers behind a common contract.

The base runtime owns only the primitives that must remain coherent across every domain:

1. **Goal / plan state**
2. **Capability identity and dependencies**
3. **Authorization and risk policy**
4. **Execution lifecycle**
5. **Outcome evaluation**
6. **Episodic + procedural memory**
7. **Auditability**

Everything else is an adapter or domain pack.

## Architecture

```text
Human / Service Intent
        |
        v
+-----------------------+
| Goal + Context        |
+-----------+-----------+
            |
            v
+-----------------------+       +----------------------+
| Capability Planner    |<----->| Capability Registry  |
+-----------+-----------+       +----------------------+
            |
            v
+-----------------------+
| Central Policy Gate   |  <-- identity, permissions, risk, asset scope
+-----------+-----------+
            |
            v
+-----------------------+
| Provider / Adapter    |  <-- MCP, A2A, browser, code, data, model, human
+-----------+-----------+
            |
            v
+-----------------------+
| Evaluator             |
+-----------+-----------+
            |
            v
+-----------------------+
| Memory + Learning     |  <-- episodes -> procedures -> future reuse
+-----------+-----------+
            |
            +------------------> next heartbeat / objective
```

## Quick start

```bash
python -m pip install -e '.[dev]'
pytest -q
python -m genesis_os.cli capabilities
python -m genesis_os.cli demo
```

The demo executes a three-step capability graph:

```text
sense.local_event -> analyze.event -> act.record_decision
```

The final action is permission-gated. Remove `write_artifact` approval and the same plan is denied before the action executes.

## Capability contract

A capability is described independently from the implementation that provides it:

```json
{
  "name": "browser.navigate",
  "description": "Navigate an approved browser session",
  "tags": ["browser", "computer-use"],
  "risk": "MEDIUM",
  "requires": [],
  "permissions": ["browser_use"],
  "domains": ["general"],
  "provider": "browser-use",
  "learnable": true
}
```

This lets multiple providers compete for the same capability. A production router can choose based on reliability, latency, cost, privacy, policy, or historical success.

## Safety boundaries in the reference runtime

Genesis is meant to be useful in sensitive domains without making the kernel itself unrestricted.

- **Offensive-security execution is disabled in the base runtime.** Security integrations should default to owned-asset detection, validation, hardening, and controlled emulation.
- **Live financial execution is off by default.** Research, simulation, backtesting, and risk analysis can run independently; live execution requires a separate explicit authorization boundary.
- **Critical-risk capabilities are denied by default.**
- **Permissions are explicit, capability-scoped inputs.**
- **Generated code should run in isolated sandboxes before promotion.**

See `docs/THREAT_MODEL.md`.

## Upstream strategy

This repository does **not** vendor the upstream projects that inspired the capability map. That is deliberate. Vendoring would create licensing, patching, supply-chain, and transitive-dependency risks. Instead, Genesis uses adapters and manifests so upstream systems can be upgraded or replaced independently.

See:

- `docs/CAPABILITY_MAP.md`
- `docs/ARCHITECTURE.md`
- `docs/MARKET.md`
- `docs/IMPLEMENTATION.md`
- `research/VALIDATION.md`

## Status

### v0.1 — kernel/reference build

Implemented:

- capability registry and discovery
- dependency-aware planning
- cycle detection
- central policy gate
- risk tiers and explicit permissions
- episodic memory
- procedural-success tracking
- evaluation interface
- end-to-end runtime
- CLI demo
- security / capital-markets / research domain policies
- CI workflow
- unit and integration tests

Next production layers:

- provider scoring/router
- MCP 2026-07-28 adapter
- A2A adapter
- sandbox provider adapter (E2B/OpenShell/Firecracker class)
- graph + semantic memory adapter
- event/heartbeat scheduler
- model router
- distributed run ledger
- human approval service
- capability compiler (successful dynamic procedure -> versioned skill/workflow)
- UI/control plane

## Contributors

- [@sheldonOS](https://github.com/sheldonOS)
- [@sheldonibm](https://github.com/sheldonibm)

See [`CONTRIBUTORS.md`](CONTRIBUTORS.md).

## License

The Genesis OS reference code in this repository is Apache-2.0. Upstream projects remain governed by their own licenses; integration must be reviewed per provider.
