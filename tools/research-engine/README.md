# GitHub Research Engine

Evidence-first generator for CodesbyFebin Awesome repositories. It discovers real GitHub projects via the GitHub REST API, enriches metadata, deduplicates canonical repositories, records provenance, and generates a machine-readable catalog plus publication-ready Markdown.

## Run

```bash
export GITHUB_TOKEN=github_token_here
python research_engine.py \
  --repo awesome-agent-identity \
  --niche "agent identity" \
  --target 50 \
  --out ./awesome-agent-identity
```

Outputs include `README.md`, `data/projects.json`, JSON Schema, rejected candidates, methodology, `llms.txt`, and a quality report.

## Important verification boundary

The engine's `VERIFIED` state means the canonical repository and descriptive metadata were observed. It does not imply that a project is secure, maintained, production-ready, or endorsed. Human review is required before publication.

## Portfolio operation

Run one research job per Awesome repository. Keep each niche explicit; do not use one generic query across the portfolio. Cookbook repositories should be generated from tested original recipes rather than copied third-party code.

## Portfolio runner (v3)

Run every repository declared in a manifest:

```bash
export GITHUB_TOKEN=...
python portfolio_runner.py --manifest portfolio-manifest.example.json --out ./generated-portfolio
```

Awesome repositories use the real GitHub research engine and target up to 50 qualified canonical projects. Cookbook repositories receive three executable baseline recipes with tests, but remain explicitly `NEEDS_DOMAIN_IMPLEMENTATION` until the generic patterns are replaced/extended with domain-specific protocol code and integration tests.

The runner also validates declared pair names and emits `docs/ECOSYSTEM.md` plus a portfolio-wide report. It does not guarantee SEO/AEO/GEO ranking.
