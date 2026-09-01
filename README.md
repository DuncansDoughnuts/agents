# DealOS v1.0.1

**Mission:** operate a low-cost, exception-only deal origination and brokering system with a target of **<= 60 minutes of owner intervention per week**.

DealOS is designed to autonomously discover opportunities, research counterparties, qualify deals, perform bounded outreach and negotiation, prepare proposals/teaming packages, schedule meetings, maintain institutional memory, and coordinate signature/billing workflows. It deliberately requires an owner or delegated authorized human for actions that can materially bind the business, such as final signatures, unusual legal terms, large financial commitments, or high-risk compliance exceptions.

## Opinionated stack

| Layer | Default | Purpose |
|---|---|---|
| Owner console | ChatGPT/Codex or Claude Code + Gmail | Ask questions, inspect pipeline, maintain code, approve exceptions |
| Reasoning runtime | OpenAI API | Routine classification through complex deal strategy |
| Deep browser/research fallback | Manus API | High-value research jobs only |
| Orchestration / credentials | self-hosted n8n | Gmail, Calendar, Drive, schedules, webhooks, deterministic actions |
| System of record | Supabase Postgres | Deals, contacts, messages, approvals, audit, knowledge |
| Communication | Gmail / Google Workspace | Counterparty and owner communication |
| Scheduling | Google Calendar | Autonomous meeting coordination |
| Knowledge files | Google Drive + Postgres facts | Controlled source documents, evidence references, and deal memory |
| Government discovery | SAM.gov + USAspending | Opportunities and historical award intelligence |
| Public market research | OpenAI web search | Recent buying/need signals and account research |
| Contact discovery | Hunter (Apollo optional) | Verified professional contact lookup after qualification |
| Signature | DocuSign | Envelope preparation and owner-signature workflow |
| Billing | Stripe Billing/Invoicing/ACH | Invoices, subscriptions, payment collection |
| TLS / ingress | Caddy | HTTPS for n8n and DealOS Core |

HubSpot is **not required**. DealOS intentionally keeps Postgres as the source of truth to minimize cost and prevent split-brain state. HubSpot can be added later as a mirrored presentation layer.

## Included

- Dockerized DealOS Core API
- Supabase/Postgres schema
- 13 importable n8n workflow templates
- ChatGPT Action OpenAPI schema + owner-console instructions
- Manus API and webhook configuration
- Gmail / Calendar / Drive OAuth configuration
- SAM.gov + USAspending configuration
- DocuSign JWT setup guide
- Stripe setup guide
- five-level autonomy policy
- bounded negotiation, outreach, model-routing and compliance policies
- 12 DealOS agent/skill wrappers
- all **505 original source skills**, unchanged, under `skills/source_505/`
- package validation and bootstrap scripts

## Important deployment truth

This package is **integration-ready, not pre-authorized**. No software package can safely contain your live Gmail, bank, Stripe, DocuSign, SAM.gov, OpenAI, Manus, or database secrets. A one-time setup is required to create/authorize credentials and fill `.env`. After that, the architecture is designed for exception-only weekly ownership.

Start with [`QUICKSTART.md`](QUICKSTART.md), then complete [`TOOLING_AND_CONFIGURATION.md`](TOOLING_AND_CONFIGURATION.md).

If you want an AI coding/operator console, read [`USING_WITH_CHATGPT_AND_CLAUDE.md`](USING_WITH_CHATGPT_AND_CLAUDE.md). The repository supports both ChatGPT/Codex through `AGENTS.md` and Claude Code through `CLAUDE.md`, with one shared operating contract.

## Account knowledge

Use `config/business_profile.yaml` + `config/account_registry.yaml` for approved non-secret operating context. See `ACCOUNT_AND_KNOWLEDGE_MODEL.md`. Credentials remain outside model context.

## Public-branch note

This GitHub branch is the public release landing layer created through the connected GitHub API. The full validated v1.0.1 package is checksum-addressed by `FULL_PACKAGE_SHA256.txt`; production secrets are intentionally excluded from source control.