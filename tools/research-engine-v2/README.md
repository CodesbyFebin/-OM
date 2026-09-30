# dh-research-engine v2

Evidence-first **content factory** for 70 awesome-* and *-cookbook repositories.

Deploy as `pip install dh-research-engine` in any repository to generate curated catalogs with verified evidence.

## The Contract

- **VERIFIED** = Canonical repo + README observed via GitHub API. Not "secure" or "endorsed".
- **UNKNOWN** is preserved. Never rendered as false/0/No.
- **50 is a ceiling**, not a quota. 37 real projects > 50 fabricated.
- **Network failure** → UNKNOWN state, never guessing.
- **Offline mode** produces honest empty catalog + NEEDS_WORK gate.

## Install

Via pip:

```bash
pip install dh-research-engine
```

Or from source (for development):

```bash
pip install -e git+https://github.com/CodesbyFebin/-OM.git#egg=dh-research-engine&subdirectory=tools/research-engine-v2
```

## Quick Start

See **[QUICKSTART-SINGLE-REPO.md](QUICKSTART-SINGLE-REPO.md)** for 5-minute setup in your awesome-* repository.

See **[DEPLOYMENT-70-REPOS.md](DEPLOYMENT-70-REPOS.md)** for full documentation and CI/CD integration.

## Usage

### 1. Create portfolio-manifest.json

In your repository root:

```json
{
  "repositories": [
    {
      "name": "awesome-data-engineering",
      "niche": "Data Engineering Tools & Platforms",
      "targetProjects": 50,
      "pair": "data-engineering-cookbook"
    }
  ]
}
```

### 2. Run the Engine

```bash
export GITHUB_TOKEN="ghp_..."
dh-research repo --repo awesome-data-engineering
```

### 3. Output

- `data/projects.json` — Curated projects with verification states + evidence
- `README.md` — Publication-ready catalog
- `reports/quality.json` — Internal quality metrics (not search ranking)
- `evidence/projects.ndjson` — Append-only provenance ledger

## Verification States

| State | Meaning | Counts to 50? |
|-------|---------|---------------|
| `VERIFIED` | GitHub API observed + README verified | ✓ Yes |
| `PARTIAL` | GitHub API observed, metadata incomplete | ✓ Yes |
| `UNKNOWN` | Unverified (network failed, 404, etc.) | ✗ No |
| `STALE` | Archived >90 days ago | ✗ No |
| `REMOVED` | Deleted or archived | ✗ No |
| `SIMULATED` | Test fixture (excluded from real catalogs) | ✗ No |

## Offline Mode

Test without GitHub token (no fabrication, guaranteed):

```bash
dh-research repo --repo awesome-data-engineering --offline
```

Produces:
- Empty `data/projects.json` (0 projects)
- `reports/quality.json` with `status: "NEEDS_WORK"`
- No hallucinated data

## Verify Invariants

Prove anti-fabrication guarantees offline:

```bash
dh-research selftest
```

Tests:
1. Offline candidate without evidence → `UNKNOWN` (not false/0)
2. Observed repo + README → `VERIFIED`
3. Fixture data → `SIMULATED` (excluded from counts)
4. URL normalization (case, trailing slash, .git suffix)

## Curation Contract

See **[AGENTS.md](AGENTS.md)** for non-negotiable rules:

1. NEVER set VERIFIED without GitHub API observation + evidence[] + timestamp
2. NEVER coerce UNKNOWN → false/0/No. Render as "unknown"
3. NEVER pad to 50. Fewer real > more invented
4. NEVER copy third-party README text. Use GitHub API description
5. NEVER claim "best", "production-ready", "secure", "battle-tested"

## CI/CD

See **[DEPLOYMENT-70-REPOS.md](DEPLOYMENT-70-REPOS.md#cicd-integration)** for GitHub Actions workflow.

Weekly refresh via GitHub Actions + automatic commit on changes.

## Architecture

- **Transport:** urllib-based HTTP client with conditional request caching (HTTP 304 Not Modified)
- **GitHub Client:** Rate-limit aware REST client with exponential backoff
- **Discovery:** Multi-phrasing GitHub Search to reduce single-keyword bias
- **Enrichment:** Metadata fetch (repo, README, releases) with evidence recording
- **Verification:** State machine (VERIFIED/PARTIAL/UNKNOWN/STALE/REMOVED/SIMULATED)
- **Quality:** 100-point internal rubric (not search ranking)
- **Output:** README, projects.json, llms.txt, quality.json

**Stdlib-only:** urllib, sqlite3, json, dataclasses. Zero supply-chain risk.

## Testing

Unit tests:

```bash
python -m unittest discover -s tests -t .
```

Offline invariants:

```bash
dh-research selftest
```

## Support

- **Questions?** See AGENTS.md and DEPLOYMENT-70-REPOS.md
- **Issues?** GitHub Issues on codesbyfebin/-OM
- **Rate-limited?** Engine pauses and reports error; retry after 60 seconds
- **No GitHub token?** Use `--offline` mode to test installation

## License

MIT
