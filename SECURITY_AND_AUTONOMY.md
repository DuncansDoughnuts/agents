# Security and Autonomy Model

## Principle

DealOS is **high autonomy, low authority**. Intelligence and reversible communication can be autonomous; irreversible legal/financial acts require stronger authorization.

## Five levels

### GREEN — fully autonomous
Research, extraction, CRM writes, safe routine replies, permitted follow-ups, proposal drafts, scheduling inside rules, non-binding document preparation.

### BLUE — autonomous inside a pre-approved envelope
Small pricing concessions, standard payment terms, approved templates, approved factual capability statements.

### YELLOW — proceed only if reversible; include in weekly review
Minor unusual conditions with bounded downside. No signature or money movement.

### ORANGE — explicit owner/delegate approval
Any binding signature, material legal redline, exclusivity, IP assignment, nonstandard indemnity, material discount, financial obligation, or action above configured thresholds.

### RED — stop and alert
Suspected fraud, sanctions/identity concern, unknown banking change, request to misrepresent qualifications, security incident, prohibited kickback/contingent-fee concern, bypass request, credential compromise.

## Credential design

- Google OAuth stays in n8n.
- OpenAI/Manus get only the content needed for a task, not OAuth tokens.
- ChatGPT owner console gets a DealOS API key with API surface limited to DealOS.
- Database credentials are server-side only.
- Stripe and DocuSign secrets are server-side only.
- Every consequential action is appended to `audit_events`.

## Owner weekly budget

The weekly digest prioritizes approvals by expected value / risk / deadline. DealOS should surface no more than the configured top actionable exceptions plus any Red alerts. If exceptions regularly exceed a 60-minute review budget, tighten policies or delegate an authorized operator; do not silently expand agent authority.
