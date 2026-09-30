# Deploying dh-research-engine to 70 Repositories

This guide covers setting up the research engine in each of the 70 Awesome/Cookbook repositories.

## Architecture

Each of the 70 repositories:
- **Installs** dh-research-engine via pip
- **Owns** its portfolio-manifest.json (niche definition + target projects)
- **Generates** local output:
  - `data/projects.json` — curated projects in that niche
  - `README.md` — publication-ready catalog
  - `reports/quality.json` — internal quality metrics
  - `evidence/projects.ndjson` — append-only provenance ledger

No central orchestration. Each repo is independent.

## Per-Repository Setup

### 1. Install the Package

```bash
pip install dh-research-engine
```

Or, for development:

```bash
pip install -e git+https://github.com/CodesbyFebin/-OM.git#egg=dh-research-engine&subdirectory=tools/research-engine-v2
```

### 2. Create portfolio-manifest.json

In your repository root, create `portfolio-manifest.json`:

```json
{
  "repositories": [
    {
      "name": "awesome-agent-skills",
      "niche": "Agent Skills & Capabilities",
      "targetProjects": 50,
      "pair": "agent-skills-cookbook"
    }
  ]
}
```

**Fields:**
- `name` — Repository identifier (must match repository name)
- `niche` — Human-readable niche definition
- `targetProjects` — Desired catalog size (default: 50, max: 50)
- `pair` — Related cookbook repo name (optional)

### 3. Create GitHub Token

Set environment variable:

```bash
export GITHUB_TOKEN=ghp_...
```

Or for CI/CD, add as repository secret.

### 4. Run the Engine

**Online mode** (requires GitHub token):

```bash
dh-research repo --repo awesome-agent-skills
```

**Offline mode** (no token, produces honest empty catalog):

```bash
dh-research repo --repo awesome-agent-skills --offline
```

**Output:**
- `data/projects.json` — Curated projects (VERIFIED/PARTIAL/UNKNOWN states)
- `README.md` — Ready-to-publish catalog
- `reports/quality.json` — Quality assessment (internal rubric)
- `evidence/projects.ndjson` — Provenance ledger

### 5. Commit and Publish

```bash
git add data/ README.md reports/ evidence/
git commit -m "Research: regenerate catalog from GitHub API"
git push
```

## Verification States

Each project in the catalog has a state:

| State | Meaning | Counts in 50? |
|-------|---------|---------------|
| `VERIFIED` | Observed via GitHub API + README verified | ✓ Yes |
| `PARTIAL` | GitHub API observed, metadata incomplete | ✓ Yes |
| `UNKNOWN` | Unverified (network failed, not found, etc.) | ✗ No |
| `STALE` | Archived >90 days ago | ✗ No |
| `REMOVED` | Deleted or archived | ✗ No |
| `SIMULATED` | Test fixture data | ✗ No |

**Honest over complete:** A catalog with 37 VERIFIED projects is better than 50 with fabrication.

## Curation Best Practices

### 1. Verify Evidence Chain

Before committing `data/projects.json`, check `evidence/projects.ndjson`:

```bash
tail -5 evidence/projects.ndjson | jq .
```

Each project should have:
```json
{
  "url": "https://github.com/...",
  "state": "VERIFIED",
  "evidence": [
    {"type": "repository", "url": "https://api.github.com/...", "note": "..."},
    {"type": "readme", "url": "https://raw.githubusercontent.com/..."}
  ]
}
```

### 2. Handle Stale/Removed Projects

If a project is archived or deleted:
- State becomes `STALE` or `REMOVED`
- No longer counts toward 50
- Add note to `evidence[].notes[]`

### 3. Quality Gate

Check `reports/quality.json`:

```bash
cat reports/quality.json | jq .
```

If `status` is `NEEDS_WORK`:
- `qualified_projects` < `target_projects` means more discovery needed
- `unfilled_slots` shows remaining work
- Run again with fresh GitHub token to retry rate-limited projects

### 4. Non-Negotiable Rules

Per AGENTS.md:

1. **NEVER** claim VERIFIED without GitHub API evidence + timestamp
2. **NEVER** coerce UNKNOWN to false/0/"No" — render as "unknown"
3. **NEVER** pad to 50 — fewer real > more invented
4. **NEVER** copy third-party README — use API description
5. **NEVER** claim "best", "production-ready", "battle-tested"

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/research-engine.yml`:

```yaml
name: Research Engine

on:
  schedule:
    - cron: "0 2 * * 0"  # Weekly Sunday 2am UTC
  workflow_dispatch:

jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: "3.10"
      - run: pip install dh-research-engine
      - run: dh-research repo --repo awesome-agent-skills
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: research-output
          path: |
            data/
            reports/
            evidence/
      - name: Commit changes
        run: |
          git config user.name "Research Engine"
          git config user.email "research@example.com"
          git add data/ README.md reports/ evidence/
          git diff --cached --exit-code || git commit -m "Research: update catalog"
          git push
```

## Rate Limiting

GitHub Search API: 30 requests/min (authenticated)
GitHub Core API: 5000 requests/hour (authenticated)

If rate-limited:
- Engine pauses and reports error
- Retry after rate-limit window (typically 60 seconds)
- Can resume later without losing progress (uses HTTP caching)

## Troubleshooting

### "401 Unauthorized"

```bash
export GITHUB_TOKEN=ghp_...
# Verify token has public_repo scope
```

### "unknown repo awesome-agent-skills"

Ensure `portfolio-manifest.json` exists and contains that repo name in the `"name"` field.

### "NEEDS_WORK" status with 0 projects

- Network unavailable? Try `--offline` mode to confirm offline behavior is honest
- Rate-limited? Check `reports/quality.json` for retry guidance
- Niche too narrow? Check search queries in debug output

### Cache Issues

Engine caches HTTP responses in `.dh-cache/http.db`. To force refresh:

```bash
rm .dh-cache/http.db
dh-research repo --repo awesome-agent-skills
```

## Testing

### Unit Tests

```bash
cd tools/research-engine-v2
python -m unittest discover -s tests -t .
```

### Selftest (Offline Verification)

```bash
dh-research selftest
```

Proves 4 anti-fabrication invariants without network access.

## Support

- Issues: GitHub Issues on codesbyfebin/-OM
- Docs: README.md and AGENTS.md in tools/research-engine-v2/
- Contract: AGENTS.md (non-negotiable rules)
