# DealOS v1.0.1 Public Release Notes

This release packages the validated v1.0.0 DealOS baseline with public-repository and dual-agent onboarding improvements.

## Added

- `USING_WITH_CHATGPT_AND_CLAUDE.md` with side-by-side startup and operating instructions.
- `CLAUDE.md` as the Claude Code project-memory entrypoint, importing the canonical `AGENTS.md` rules.
- Public-repository safety guidance that keeps credentials, customer data, signed agreements, and production state out of Git.

## Preserved

- DealOS Core/Postgres remains the system of record.
- n8n remains the deterministic credentialed executor.
- `AGENTS.md` remains the canonical agent operating contract.
- Existing autonomy, compliance, outreach, negotiation, signature, and money-movement boundaries are unchanged.

## Public release boundary

The repository is source code and configuration templates, not a pre-authorized live deployment. Operators must provide their own credentials and approved business facts. Do not commit `.env`, OAuth tokens, private keys, database passwords, customer data, private proposals, signed agreements, or production exports.

The 505 source skills under `skills/source_505/` are retained from the prior packaged baseline. Public users are responsible for respecting any applicable ownership, licensing, trademark, confidentiality, or redistribution requirements for material they enable or reuse.
