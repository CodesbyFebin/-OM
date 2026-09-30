# AGENTS.md — dh-research-engine v2

**Purpose:** Turn `portfolio-manifest.json` into real-data Awesome/Cookbook repos.

## Core contract (non-negotiable)

1. NEVER set `VERIFIED` without GitHub API observation + evidence[] + checked_at.
2. NEVER coerce UNKNOWN → false/0/No. Render "unknown".
3. NEVER pad to 50. Fewer real > more invented.
4. NEVER copy third-party README text. Use API description field.
5. NEVER claim "best", "production-ready", "secure", "battle-tested".
6. Fixture data (`SIMULATED`) excluded from qualified/50 count.

## Authoritative data

- `portfolio-manifest.json` — 70 repositories (35 Awesome + 35 Cookbook)
- `portfolio/taxonomy.json` — niche definitions, synonyms, categories
- `out/{repo}/data/projects.json` — per-repo catalog (projects + VERIFIED/PARTIAL/UNKNOWN states)
- `evidence/projects.ndjson` — append-only provenance ledger

## Key modules

- `github_client.py` — Rate-limit aware, cache-backed REST client
- `discover.py` — Multi-phrasing GitHub Search discovery
- `enrich.py` — Metadata fetch + evidence recording
- `verify.py` — State machine (VERIFIED → observation required)
- `quality.py` — Internal 100-point rubric (NOT ranking guarantee)

## Validate before commit

```bash
python -m unittest discover -s tests -t .
dh-research selftest
```

## Offline mode

```bash
dh-research repo --repo awesome-agent-skills --offline
# Produces: empty catalog + quality.json with status=NEEDS_WORK
# No fabrication, no guessing.
```
