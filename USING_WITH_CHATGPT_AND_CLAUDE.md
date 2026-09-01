# Using DealOS with ChatGPT vs Claude

DealOS is model-agnostic at the operator layer. Its durable source of truth is the repository: configuration, policies, `AGENTS.md`, DealOS Core, Postgres state, and deterministic n8n workflows. ChatGPT or Claude can act as the human-facing engineering/operator console, but neither model should receive raw production secrets in prompts.

## Fastest path: ChatGPT + Codex

Use this path when you want ChatGPT to inspect, modify, test, and maintain the DealOS repository.

### 1. Connect the repository

In ChatGPT, connect GitHub from **Settings -> Apps** and authorize the DealOS repository. Newly created repositories can take a few minutes to appear after authorization.

For code-changing work, open the repository with **Codex** (desktop, CLI, or another Codex surface that has write access). Codex reads repository `AGENTS.md` instructions as persistent project guidance.

### 2. Start with this prompt

```text
Open this DealOS repository and read AGENTS.md, README.md, QUICKSTART.md,
SECURITY_AND_AUTONOMY.md, TOOLING_AND_CONFIGURATION.md, and
USING_WITH_CHATGPT_AND_CLAUDE.md before making changes.

Treat Postgres/DealOS Core as the system of record and n8n as the credentialed
executor. Never place secrets in prompts, source files, commits, logs, or model
memory. Run scripts/validate_package.py and the test suite before and after any
material change. Tell me which integrations are configured, which are missing,
and the safest next action. Do not claim a live connector works until it has
been tested against the configured environment.
```

### 3. For day-to-day ownership

After deployment, ChatGPT can be used as an owner console in two ways:

- **Repository/engineering console:** ask Codex to diagnose, improve, test, or deploy the codebase while obeying `AGENTS.md`.
- **Deal operator console:** expose only the approved DealOS Core API through the schema under `chatgpt/`; ChatGPT should call DealOS, not hold Gmail, Stripe, DocuSign, database, or other raw credentials itself.

Useful owner prompts:

```text
Summarize the current DealOS pipeline, approvals, deadlines, expected value,
and exceptions that require my attention. Prioritize by expected profit per
owner minute and cite the underlying DealOS records.
```

```text
Audit the last seven days of autonomous actions against policies/autonomy.yaml,
policies/outreach.yaml, policies/compliance.yaml, and policies/negotiation.yaml.
Flag any drift, unsupported claim, suppression failure, or action without the
required approval.
```

### 4. What ChatGPT should not do

Do not paste `.env`, OAuth refresh tokens, private keys, database passwords, or customer secrets into ChatGPT. Keep those in the deployment secret store / n8n credential store. Do not use a general web-browsing agent as a substitute for the deterministic action executor for consequential actions.

## Fastest path: Claude Code

Use this path when you want Claude to work directly from a local or remote clone with shell access.

### 1. Clone and enter the repository

```bash
git clone <YOUR_DEALOS_REPOSITORY_URL>
cd DealOS
```

Install/authenticate Claude Code using Anthropic's current instructions, then launch it from the repository root:

```bash
claude
```

The repository includes a root `CLAUDE.md`. Claude Code automatically loads project memory from that file. `CLAUDE.md` imports the shared DealOS control-plane rules from `AGENTS.md` so ChatGPT/Codex and Claude follow the same operating contract.

### 2. Start with this prompt

```text
Read CLAUDE.md and every file it imports, then read README.md, QUICKSTART.md,
SECURITY_AND_AUTONOMY.md, TOOLING_AND_CONFIGURATION.md, and
USING_WITH_CHATGPT_AND_CLAUDE.md. Validate the package before changing it.
Inventory configured vs missing integrations without exposing secrets. Work
incrementally, preserve policy boundaries, run tests after edits, and keep git
diffs small and reviewable.
```

### 3. Recommended Claude Code workflow

Use Claude Code for repository work, diagnostics, implementation, test repair, deployment preparation, and controlled MCP integration. Keep external business actions routed through DealOS Core -> policy evaluation -> n8n rather than giving Claude unrestricted direct credentials.

For long tasks, use git commits as checkpoints and keep durable status in repository files or DealOS state instead of relying only on conversational memory.

### 4. Permission posture

Do not run Claude Code with unrestricted permission bypass for a production DealOS environment. Keep destructive shell commands, production deployment, data deletion, external communication, signature, and financial actions gated by the operating policies and the human authorization rules in this repository.

## ChatGPT vs Claude: practical differences

| Need | ChatGPT / Codex | Claude Code |
|---|---|---|
| Persistent repo instructions | `AGENTS.md` | `CLAUDE.md` importing `AGENTS.md` |
| Work directly on code | Codex | Claude Code |
| Ask questions over connected GitHub | ChatGPT GitHub app | Clone/repository access in Claude Code |
| Owner-facing DealOS console | Strong fit through DealOS Core/OpenAPI | Possible, but this package treats Claude primarily as an engineering/operator client |
| Shell/local environment | Codex environment/CLI | Native Claude Code workflow |
| Production secrets | Keep outside prompts; use deployment/n8n secret stores | Keep outside prompts; use environment/secret stores |
| Consequential business actions | Route through DealOS Core + n8n + policy gates | Route through DealOS Core + n8n + policy gates |

## One operating contract, not two systems

Do not fork business logic into separate “ChatGPT DealOS” and “Claude DealOS” versions. `AGENTS.md`, policies, schemas, DealOS Core, database state, and n8n workflows remain canonical. `CLAUDE.md` is a compatibility entrypoint for Claude Code; ChatGPT/Codex uses `AGENTS.md` directly.
