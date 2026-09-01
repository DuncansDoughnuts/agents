# DealOS Quickstart

## 0. Prerequisites

You need:

1. A domain or subdomain you control.
2. A Google Workspace or Gmail account dedicated to DealOS, ideally `deals@yourdomain.com`.
3. Docker + Docker Compose on one small VPS.
4. A Supabase project (or another Postgres database).
5. OpenAI API key.
6. SAM.gov API key for federal opportunity discovery.
7. Optional: Manus API, DocuSign developer/production integration, Stripe.

## 1. Copy configuration

```bash
cp .env.example .env
```

Fill every value marked `REQUIRED`.

Then copy and complete the approved-facts profile:

```bash
cp config/business_profile.example.yaml config/business_profile.yaml
cp config/account_registry.example.yaml config/account_registry.yaml
```

Fill both files with approved, non-secret facts. Keep every revenue lane `enabled: false` until its offer facts and commercial floor are configured. See `ACCOUNT_AND_KNOWLEDGE_MODEL.md`.

Generate secrets:

```bash
openssl rand -hex 32   # DEALOS_API_KEY
openssl rand -hex 32   # N8N_ENCRYPTION_KEY
```

## 2. Create database

In Supabase SQL Editor, run:

```text
supabase/schema.sql
supabase/seed.sql
```

Then copy the **server-side Postgres connection string** into `DATABASE_URL`.

## 3. Configure DNS

Create A/AAAA records:

- `n8n.yourdomain.com` -> VPS
- `dealos.yourdomain.com` -> VPS

Put those hostnames in `.env`.

## 4. Start services

```bash
./scripts/bootstrap.sh
```

Open `https://n8n.yourdomain.com`, create the first n8n owner account, and immediately enable MFA if your n8n build supports it.

## 5. Configure Google OAuth once

Follow `google_workspace/oauth_setup.md` and create these n8n credentials:

- `DealOS Gmail`
- `DealOS Calendar`
- `DealOS Drive`

Use least-privilege scopes and a dedicated DealOS account.

## 6. Import n8n workflows

Import JSON files from `n8n/workflows/` in numeric order. Re-select the appropriate Google credential after import if n8n prompts for it.

Enable workflows only after the smoke tests below pass. Keep `06_action_executor.json` inactive; activate the dedicated `06a`–`06d` executors you have configured.

## 7. Smoke tests

```bash
curl https://dealos.yourdomain.com/health
python scripts/validate_package.py
```

Then:

1. Email the DealOS Gmail account from a test address.
2. Confirm it creates a message/audit record.
3. Confirm a routine test reply enters the outbox before sending.
4. Send `unsubscribe` and verify the address enters `suppressions`.
5. Trigger a test SAM scan.
6. Confirm a high-value test record can create a research job.
7. Generate the owner weekly digest.
8. Test `APPROVE <approval-id>` and `REJECT <approval-id>` from the configured owner email.

## 8. Production enablement order

Enable in this order:

1. inbound email + CRM state
2. opportunity scanning
3. owner digests
4. outbound follow-up to your own test accounts
5. limited live outbound (5/day)
6. calendar scheduling
7. Manus fallback
8. DocuSign envelope preparation
9. Stripe invoicing
10. scale outbound to policy limits after deliverability is healthy

Never enable unrestricted autonomous signing or unrestricted money movement.
