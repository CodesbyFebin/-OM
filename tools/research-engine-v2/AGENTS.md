# AGENTS.md — dh-research-engine v2

**Purpose:** Evidence-first content factory for 70 awesome-* and *-cookbook repositories.

Install via `pip install dh-research-engine`. Each repository owns its catalog.

## Core Contract (Non-Negotiable)

1. **NEVER** set `VERIFIED` without GitHub API observation + evidence[] + checked_at
2. **NEVER** coerce `UNKNOWN` → false/0/No. Always render as "unknown"
3. **NEVER** pad to 50 projects. Fewer real > more invented
4. **NEVER** copy third-party README text. Use GitHub API description field
5. **NEVER** claim "best", "production-ready", "secure", "battle-tested"
6. Fixture data (`SIMULATED`) excluded from qualified/50 count

**Why?** Because discovery is evidence-first: VERIFIED requires observation. Network failure → UNKNOWN, never fabrication.

## Verification States

Only these states are valid in `data/projects.json`:

| State | Condition | Real Data? | Counts to 50? |
|-------|-----------|-----------|---------------|
| `VERIFIED` | GitHub repo observed + README fetched + checked_at | Yes | ✓ Yes |
| `PARTIAL` | GitHub repo observed, README missing | Yes | ✓ Yes |
| `UNKNOWN` | Network error, 404, rate-limited | No | ✗ No |
| `STALE` | Repository archived >90 days ago | Yes | ✗ No |
| `REMOVED` | Repository deleted | No | ✗ No |
| `SIMULATED` | Test fixture (never in production) | No | ✗ No |

## Per-Repository Setup

Each of the 70 repositories:

1. Installs: `pip install dh-research-engine`
2. Creates `portfolio-manifest.json` with repo name and niche
3. Sets `GITHUB_TOKEN` env var
4. Runs: `dh-research repo --repo {name}`
5. Commits output: `data/`, `README.md`, `reports/`, `evidence/`

## Key Modules

- `github_client.py` — Rate-limit aware, cache-backed REST client
- `discover.py` — Multi-phrasing GitHub Search discovery
- `enrich.py` — Metadata fetch + evidence recording
- `verify.py` — State machine (VERIFIED → observation required)
- `quality.py` — Internal 100-point rubric (NOT ranking guarantee)
- `cache.py` — HTTP caching with ETag/Last-Modified support
- `transport.py` — RealTransport (urllib) vs FixtureTransport (tests)

## Validate Before Commit

```bash
dh-research selftest  # Offline invariant check (no network)
python -m unittest discover -s tests -t .  # Full test suite
```

## Offline Mode

Test without GitHub token (proves no fabrication):

```bash
dh-research repo --repo awesome-agent-skills --offline
```

Produces:
- Empty `data/projects.json` (0 projects)
- `reports/quality.json` with `status: "NEEDS_WORK"`
- No hallucinated data

## See Also

- **QUICKSTART-SINGLE-REPO.md** — 5-minute setup in your awesome-* repo
- **DEPLOYMENT-70-REPOS.md** — Full documentation & CI/CD integration
