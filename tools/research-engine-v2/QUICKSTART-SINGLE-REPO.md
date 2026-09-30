# Quick Start: Single Repository Deployment

Deploy dh-research-engine to one of the 70 Awesome/Cookbook repositories in 5 minutes.

## 1. Install the Package

```bash
pip install dh-research-engine
```

## 2. Set Up Your Repository

Copy the template manifest to your repo root:

```bash
curl https://raw.githubusercontent.com/CodesbyFebin/-OM/main/tools/research-engine-v2/portfolio-manifest.template.json \
  -o portfolio-manifest.json
```

Edit `portfolio-manifest.json` to match your niche:

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

## 3. Set GitHub Token

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 4. Run the Engine

```bash
dh-research repo --repo awesome-data-engineering
```

Output appears in:
- `data/projects.json` — Machine-readable catalog
- `README.md` — Publication-ready markdown
- `reports/quality.json` — Quality metrics
- `evidence/projects.ndjson` — Provenance ledger

## 5. Verify Output

Check quality metrics:

```bash
cat reports/quality.json | jq .status
```

Expected output: `"VERIFIED"` (all projects checked) or `"NEEDS_WORK"` (partial catalog).

Review a project:

```bash
cat data/projects.json | jq '.[0]'
```

## 6. Commit & Publish

```bash
git add data/ README.md reports/ evidence/
git commit -m "Research: regenerate catalog"
git push
```

## Testing

Test without network (offline mode):

```bash
dh-research repo --repo awesome-data-engineering --offline
```

Should produce `NEEDS_WORK` status with empty `data/projects.json` (honest, no fabrication).

## Next Steps

- See `DEPLOYMENT-70-REPOS.md` for full documentation
- See `AGENTS.md` for the non-negotiable contract
- Join [GitHub Discussions](https://github.com/CodesbyFebin/-OM/discussions) for support
