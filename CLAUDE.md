# DealOS Claude Code project memory

@AGENTS.md

## Claude Code entrypoint

Before material work, read:
- `README.md`
- `QUICKSTART.md`
- `SECURITY_AND_AUTONOMY.md`
- `TOOLING_AND_CONFIGURATION.md`
- `USING_WITH_CHATGPT_AND_CLAUDE.md`

## Working rules

- Treat the repository and DealOS Core/Postgres state as authoritative; do not invent live state.
- Investigate referenced files before making claims about them.
- Never put production credentials or customer secrets into source, commits, logs, prompts, or durable model memory.
- Route consequential external actions through DealOS Core policy evaluation and the n8n executor.
- Preserve approval gates for signatures, unusual legal/commercial terms, high-risk compliance exceptions, and money movement.
- Run `python scripts/validate_package.py` and the applicable tests after material changes.
- Use git as a checkpoint mechanism for long work; keep changes reviewable and do not force-push or destroy unrelated work.
