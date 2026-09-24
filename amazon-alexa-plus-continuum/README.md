# Continuum — Alexa+ Mission Control

Continuum is a stateful, approval-aware personal operations agent built for the **Amazon Build, Ship, Shape Developer Hackathon — Alexa+ Track**. It demonstrates the kind of context-aware, multi-step agentic workflow the Alexa+ track explicitly rewards: state across sessions, service orchestration, and owner approval before irreversible actions.

## Why it is different

Most assistants answer a question. Continuum manages a mission. It remembers user-owned context, decomposes an intent into steps, classifies risk, executes safe work immediately, and fails closed when a step would commit money or cause an irreversible external write.

The demo includes both:

1. a web-based simulated Alexa+ experience, permitted by the hackathon rules; and
2. a local MCP-style Streamable HTTP endpoint advertising protocol version `2025-11-25` with six tools.

No paid hosting or external API is required to run or judge the project.

## Run locally

```bash
npm test
npm start
# open http://localhost:8787
```

Requires Node.js 20+ and no package installation beyond Node itself.

## Demo flow

1. Ask: `Plan my day around a 3 PM meeting and draft the follow-up.`
2. Continuum recalls relevant context and builds a multi-step plan.
3. Ask: `Book dinner for four tomorrow and send everyone the details.`
4. The purchase/booking step is visibly blocked.
5. Approve it in the UI.
6. The workflow completes and the audit ledger shows the approval event.

## MCP methods

POST JSON-RPC to `/mcp`:

- `initialize`
- `tools/list`
- `tools/call`

Tools:

- `capture_memory`
- `recall_context`
- `propose_workflow`
- `approve_action`
- `execute_workflow`
- `get_state`

## Judging fit

- **Tech Implementation:** zero-dependency Node service, MCP-compatible tool surface, persistent workflow model, deterministic tests.
- **Design:** a coherent voice-assistant-style mission-control UI with explicit risk status and approval controls.
- **Potential Impact:** broad household and personal-productivity use cases without requiring users to learn a new workflow language.
- **Quality of Idea:** goes beyond single-turn Q&A and basic API wrapping; state, memory, approvals and cross-service orchestration are the product.

## Safety model

Continuum never treats remembered context as authorization. High-risk actions require an explicit approval event attached to the specific workflow step. The included adapter is a simulator; no real purchase, message, booking, deletion or external write occurs in the demo.

## Tests

`npm test` covers memory retrieval, fail-closed behavior, owner approval, required MCP protocol version and tool discovery.

## License

MIT
