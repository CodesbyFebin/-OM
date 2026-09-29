# Profile README Deployment Guide

This directory contains three files ready to deploy to your GitHub profile repository (`CodesbyFebin/CodesbyFebin`).

## Files

1. **README.md** — Your main profile README
2. **AGENTS.md** — Structured claims for LLM/agent parsing
3. **llms.txt** — Machine-readable summary for language models

## How to Deploy

### Option 1: Automated (One-time setup)

1. **Clone your profile repository** (if you haven't already):
   ```bash
   git clone https://github.com/CodesbyFebin/CodesbyFebin.git
   cd CodesbyFebin
   ```

2. **Copy these files to the root**:
   ```bash
   cp profile-readme/README.md .
   cp profile-readme/AGENTS.md .
   cp profile-readme/llms.txt .
   ```

3. **Commit and push**:
   ```bash
   git add README.md AGENTS.md llms.txt
   git commit -m "chore: update profile README with 2026 best practices"
   git push origin main
   ```

### Option 2: Manual

Copy each file's content from this directory to your profile repository's root.

## Next Steps (Profile-Level Fixes)

Once deployed, apply these one-time profile improvements on GitHub:

### 1. Add descriptions to pinned repos

Go to each pinned repo → Settings → About → Description:

| Repo | Description |
|---|---|
| `rust-stark-zkvm` | STARK zkVM with custom ISA, MCP proving tools, and CI proof gates |
| `Decentralized-` | Sovereign compute mesh — signed intents, local admission, dh/v1 conformance |
| `decentralized.hosting` | Deploy apps across your own mesh. MIT licensed, no open-core trap. |
| `xfree` | Free AI, SEO, and developer micro-tools in the browser |

### 2. Pin exactly 4 repos

You currently have 3 pinned. Add `Decentralized-` as the fourth. The sweet spot for a specialist profile is 4 pinned repos.

### 3. (Optional) Computed badges via GitHub Actions

For the most on-brand upgrade, set up a daily workflow to compute contribution badges:

Create `.github/workflows/update-badges.yml`:

```yaml
name: Update README badges
on:
  schedule: [{ cron: '0 6 * * *' }]
  workflow_dispatch:
jobs:
  badges:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          gh api graphql -f u="CodesbyFebin" -f query='query($u:String!){
            user(login:$u){
              createdAt
              repositories(privacy:PUBLIC, ownerAffiliations:OWNER){ totalCount }
              contributionsCollection{ contributionCalendar{ totalContributions } }
            }
          }' > stats.json
        env: { GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}' }
      - run: |
          jq -r '"{\"schemaVersion\":1,\"label\":\"contributions (last year)\",\"message\":\"\(.data.user.contributionsCollection.contributionCalendar.totalContributions)\",\"color\":\"2ea44f\"}"' stats.json > dist/contrib-endpoint.json
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: dist
          publish_branch: output
```

Then reference in README:

```markdown
![Contributions](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FCodesbyFebin%2FCodesbyFebin%2Foutput%2Fcontrib-endpoint.json&style=flat-square)
```

## Research Summary

These files implement 2026 best practices for GitHub profiles:

- **30-second rule**: Profile answers "who, what, what level" in viewport
- **Minimalism**: Focused on your strongest assets, not decoration
- **Now focus**: Current work section gives visitors a reason to reach out today
- **Problem → Solution → Impact**: Story structure per project outperforms feature lists
- **Machine-readable**: AGENTS.md and llms.txt signal maturity to LLMs and agents
- **Computed, not copied**: Badges match GitHub exactly; principle of "prove it"

See the original research synthesis for detailed rationale.
