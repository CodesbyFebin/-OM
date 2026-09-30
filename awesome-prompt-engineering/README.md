# awesome-prompt-engineering

Prompt Engineering Techniques

## Research Engine

This repository uses [dh-research-engine](https://github.com/CodesbyFebin/-OM/tree/main/tools/research-engine-v2) to generate a curated catalog.

### Quick Start

```bash
pip install dh-research-engine
export GITHUB_TOKEN=ghp_...
dh-research repo --repo awesome-prompt-engineering
```

### Output

- `data/projects.json` — Curated projects with verification states
- `README.md` — Publication-ready catalog  
- `reports/quality.json` — Quality metrics (internal rubric)
- `evidence/projects.ndjson` — Provenance ledger

### Documentation

- [dh-research-engine](https://github.com/CodesbyFebin/-OM/tree/main/tools/research-engine-v2#readme)
- [Deployment Guide](https://github.com/CodesbyFebin/-OM/blob/main/tools/research-engine-v2/DEPLOYMENT-70-REPOS.md)
- [Quick Start](https://github.com/CodesbyFebin/-OM/blob/main/tools/research-engine-v2/QUICKSTART-SINGLE-REPO.md)

## License

MIT
