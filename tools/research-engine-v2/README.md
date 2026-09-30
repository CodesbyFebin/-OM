# dh-research-engine v2

Evidence-first **content factory** for CodesbyFebin's 70-repository portfolio.
One engine, not 70 scrapers.

## The contract

- `VERIFIED` = canonical repo + README observed via GitHub API. **Not** secure/maintained/endorsed.
- `UNKNOWN` is preserved. Never rendered as false/0/No.
- The **50 target is a ceiling**, not a quota. 37 real > 50 fabricated.
- **Offline mode** produces empty catalog + NEEDS_WORK gate (not silence).
- **Network failure** → UNKNOWN, never fabrication.

## Install

```bash
cd tools/research-engine-v2
pip install -e .
```

## Run

```bash
export GITHUB_TOKEN="ghp_..."

# Single repository
dh-research repo --repo awesome-agent-skills

# Offline (no token, fixtures only)
dh-research repo --repo awesome-agent-skills --offline

# Prove invariants
dh-research selftest
```

## What you'll see

- `out/{repo-name}/data/projects.json` — verified entries with evidence ledger
- `out/{repo-name}/README.md` — publication-ready catalog
- `out/{repo-name}/reports/quality.json` — rubric score (internal, not ranking)

## Offline / no token

Engine produces **empty** catalog and `NEEDS_WORK` gate. `dh-research selftest`
verifies anti-fabrication invariants deterministically (offline, fixtures marked `SIMULATED`).

---

See `AGENTS.md` for repository contract and `tools/research-engine-v2/` layout.
