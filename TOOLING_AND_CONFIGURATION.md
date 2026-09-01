# DealOS Tool Map and Exact Configuration

**Design constraint:** low fixed cost, <= 1 hour/week owner intervention, credential isolation, and exception-only human approvals.

## 1. ChatGPT — owner console, not unattended runtime

### Role
Use ChatGPT to inspect DealOS, ask questions about opportunities and approve/reject exceptions. The unattended system must run through the OpenAI API and n8n, not through an open ChatGPT browser session.

### Configuration

1. Use the OpenAPI document at `chatgpt/action-openapi.yaml` as the Action/API contract wherever your ChatGPT plan/workspace supports custom Actions or equivalent API app connectivity.
2. Point server URL to `https://YOUR_DEALOS_DOMAIN`.
3. Authenticate with header `X-DealOS-Key` using the same generated internal API key.
4. Give the owner console **read + approval** permissions only. Do not expose raw Gmail, Stripe or DocuSign credentials to ChatGPT.
5. Paste `chatgpt/owner-console-instructions.md` as the owner-console behavior instruction.

### Allowed ChatGPT operations
- show pipeline / deal detail
- explain score or escalation
- list approvals
- approve or reject one approval
- queue research

### Not allowed
- direct bank transfer
- direct signing
- direct Gmail OAuth credential access
- bypassing policy gates

## 2. OpenAI API — primary autonomous reasoning runtime

### Configuration

Environment:

```text
OPENAI_FAST_MODEL=gpt-5.6-luna
OPENAI_STANDARD_MODEL=gpt-5.6-terra
OPENAI_HIGH_MODEL=gpt-5.6-sol
OPENAI_DAILY_BUDGET_USD=15
OPENAI_MONTHLY_BUDGET_USD=300
```

Routing is defined in `policies/model_routing.yaml`. `dealos_core/app/usage.py` persists estimated spend in `model_usage` and blocks new OpenAI calls when the configured daily/monthly budget would be exceeded.

Use structured JSON output for classification and extraction. Models may **recommend** an action; n8n/Core performs the deterministic action only after policy evaluation.

## 3. Manus — optional high-value deep browser/research worker

### Role
Manus is invoked only when normal search/model research is insufficient and the opportunity exceeds the expected-value threshold.

### Configuration

1. Create a Manus API key.
2. Set `MANUS_ENABLED=true` and `MANUS_API_KEY`.
3. Default profile: `manus-1.6-lite`.
4. Set `MANUS_MIN_EXPECTED_VALUE_USD=25000`.
5. Register `https://YOUR_DEALOS_DOMAIN/hooks/manus` as a webhook.
6. DealOS verifies RSA-SHA256 webhook signatures before accepting results.
7. Use `interactive_mode=false`, private visibility, and structured output schemas.

See `manus/README.md`.

## 4. n8n — orchestration and credential boundary

### Role
n8n is the only component authorized to hold Google OAuth credentials. It also runs schedules, sends/receives mail, executes Calendar/Drive actions, polls SAM.gov, and dispatches Manus jobs.

### Required self-hosted settings

```text
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.example.com/
N8N_PROXY_HOPS=1
N8N_ENCRYPTION_KEY=<random 32-byte+ secret>
GENERIC_TIMEZONE=America/New_York
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
EXECUTIONS_DATA_PRUNE_MAX_COUNT=10000
EXECUTIONS_DATA_SAVE_ON_SUCCESS=none
EXECUTIONS_DATA_SAVE_ON_ERROR=all
```

Do not expose port 5678 directly to the internet; Caddy terminates TLS.

### n8n credentials to create

| Credential name | Type | Access |
|---|---|---|
| DealOS Gmail | Google OAuth2 / Gmail | dedicated DealOS mailbox |
| DealOS Calendar | Google OAuth2 / Calendar | dedicated/controlled calendar |
| DealOS Drive | Google OAuth2 / Drive | DealOS folder only where possible |
| DealOS Core | Header Auth if desired | `X-DealOS-Key` |

Import `n8n/workflows/*.json`.

## 5. Gmail / Google Workspace — communication bus

### Account topology
Create a dedicated address such as `deals@yourdomain.com`. Do not initially give DealOS access to your entire personal inbox.

Recommended labels:

```text
DealOS/Inbound
DealOS/Qualified
DealOS/Research
DealOS/Waiting
DealOS/Approval
DealOS/Signed
DealOS/Billing
DealOS/Suppressed
DealOS/Error
```

### OAuth scope
Prefer the least-privilege Gmail scope that lets n8n read, label, compose, reply and send. `gmail.modify` is the practical default for this workflow; do not request full mailbox scope unless a connector genuinely requires it.

### Gmail rules
- DealOS never fabricates certifications, relationships or capabilities.
- `unsubscribe`, `remove me`, `stop`, and equivalent requests enter the suppression table immediately.
- first-touch/day and total/day are capped by `policies/outreach.yaml`.
- no auto-forwarding to unknown external destinations.
- owner approvals are honored only when the sender exactly matches `OWNER_EMAIL`.

### Domain authentication
Before live outbound, configure SPF, DKIM and DMARC for the sending domain. Begin at low volume and ramp only after deliverability is healthy.

## 6. Google Calendar — autonomous scheduling

Use a dedicated DealOS calendar or a calendar the owner explicitly shares.

Policy:
- minimum notice: 24h
- max booking horizon: 30 days
- default length: 30 minutes
- only book inside configured working windows
- never cancel a human-created event automatically
- reschedule/cancel requests from a counterparty are safe only when the event is DealOS-created and identity matches

## 7. Google Drive — controlled document knowledge

Create one root folder, e.g. `DealOS Knowledge`, and subfolders:

```text
00_Identity_and_Entities/
01_Capabilities/
02_Case_Studies/
03_Pricing/
04_Legal_Templates/
05_Insurance_Certifications/
06_Government_Registrations/
07_Proposals/
08_Signed_Agreements/
09_Billing/
10_Audit_Evidence/
```

Prefer `drive.file`-style access to files created/selected for DealOS. Broader Drive scopes should be a deliberate exception.

## 8. Supabase Postgres — single source of truth

### Configuration

1. Create one production project.
2. Run `supabase/schema.sql` then `supabase/seed.sql`.
3. Enable SSL connections.
4. Use the pooled/server Postgres URL in `DATABASE_URL`.
5. Never put `service_role` keys in browser code, ChatGPT Actions, or client-side scripts.
6. Enable database backups appropriate to your recovery objective.
7. If exposing Supabase REST directly later, enable RLS on every exposed table.

Postgres contains deals, opportunities, contacts, relationship memory, approval state, suppressions, model usage and audit evidence.

## 9. Contact discovery — Hunter default, Apollo optional upgrade

A fully autonomous private-market system needs a way to convert a qualified organization + decision-maker name into a deliverable professional email. DealOS uses **Hunter** as the default low-cost API because its Email Finder can find and verify a professional email from name + company domain, and unsuccessful finder calls do not consume a finder credit under Hunter's documented model.

### Hunter configuration

```text
HUNTER_ENABLED=true
HUNTER_API_KEY=<server key>
HUNTER_MIN_OPPORTUNITY_SCORE=70
```

DealOS calls Hunter only **after** an account has passed the opportunity score threshold. This prevents wasting credits on speculative leads.

Use company/work contact data only for legitimate B2B outreach and obey suppression/opt-out rules. DealOS does not request personal email/phone by default.

### Apollo optional fallback
Apollo can be added later when Hunter/public sources are insufficient. Keep `APOLLO_ENABLED=false` initially because enrichment/search consumes plan-dependent credits. If enabled, restrict it to organization/people enrichment after qualification rather than bulk scraping.

## 10. OpenAI web search — ordinary public research

DealOS uses OpenAI's built-in web search on scheduled private-market scans and qualified research jobs. This avoids needing a separate web-search vendor in v1.

Cost control:
- maximum 4 private-lane scans/day by default;
- maximum 10 results/lane/scan;
- research only after scoring;
- Manus is reserved for deeper/high-value work.

## 11. SAM.gov — government opportunity discovery

### Configuration

1. Create/login to SAM.gov.
2. Generate an API key.
3. Set `SAM_API_KEY`.
4. Optional filters: `SAM_NAICS`, `SAM_SET_ASIDE`, `SAM_NOTICE_TYPES`.
5. `03_sam_opportunity_scan.json` polls the Opportunities v2 API hourly.
6. Scan windows overlap so transient failures do not lose opportunities; DealOS deduplicates by notice ID.

The SAM Opportunities API requires `postedFrom` and `postedTo`; the workflow generates those dynamically.

## 12. USAspending — free historical federal award intelligence

No API key is required. Use it to analyze:
- incumbents
- award history
- agencies
- recipients
- subawards
- likely contract values
- recompete patterns

Do not use historical award data as proof that a future award will occur.

## 13. DocuSign — signature completion

### Role
DealOS may prepare an envelope and route it, but owner signature remains human-controlled by default.

### Configuration

For unattended server-to-server preparation, use DocuSign OAuth/JWT after required consent:

```text
DOCUSIGN_INTEGRATION_KEY=
DOCUSIGN_USER_ID=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_PRIVATE_KEY_PATH=/run/secrets/docusign_private_key.pem
```

Use the developer/demo account until the workflow is tested. Production base URLs differ from demo. See `docusign/setup.md`.

## 14. Stripe — invoice / recurring billing / ACH

### Configuration

1. Create Stripe restricted/server secret appropriate to the integration.
2. Create webhook endpoint `https://YOUR_DEALOS_DOMAIN/hooks/stripe`.
3. Subscribe only to events DealOS uses (invoice paid/failed, subscription lifecycle).
4. Store webhook signing secret in `.env`.
5. Prefer ACH for large B2B invoices when appropriate because card economics can be worse.
6. DealOS may create a draft invoice only after commercial terms are approved/signed. Automatic refunds, transfers, lending, or arbitrary payouts remain disabled.

## 15. Caddy + VPS — low-cost HTTPS runtime

A small Linux VPS is sufficient initially. Run only Docker, firewall/SSH tooling, and monitoring. Caddy automatically handles HTTPS for the two configured domains.

Firewall:
- allow 22 only from trusted IP/VPN if possible
- allow 80/443 publicly
- do not expose 5678 or 8080 directly

## 16. GitHub — source control and change gate (recommended)

DealOS source may be hosted in a public repository **only when the repository contains no production secrets, customer data, private legal/commercial documents, or deployment-specific credentials**. Production configuration and credentials must remain in deployment secret stores, n8n credentials, and controlled data systems. A private repository is still preferred when the code itself contains confidential business logic or licensed material.

Require review before production policy changes. Never commit `.env`, OAuth tokens, DocuSign private keys, database passwords, customer data, private proposals, signed agreements, or exported production database content. Before every public release, run secret scanning and review third-party/license obligations.

Recommended protected files:
- `policies/autonomy.yaml`
- `policies/compliance.yaml`
- `policies/negotiation.yaml`
- `policies/outreach.yaml`

## 17. Optional tools, added only when ROI justifies them

| Tool type | Add when | Default now |
|---|---|---|
| HubSpot | sales team needs its UI/reporting | off |
| Clay/Apollo/ZoomInfo | contact coverage becomes bottleneck | off |
| Slack | delegated operators need alerts | off |
| Twilio/voice agent | validated phone conversion exceeds cost/risk | off |
| paid procurement databases | free SAM/USAspending insufficient | off |
| additional LLM vendors | price/reliability benchmark justifies | off |

The lowest-cost system is the one that avoids duplicate systems of record and pays for premium research only when expected deal value supports it.
