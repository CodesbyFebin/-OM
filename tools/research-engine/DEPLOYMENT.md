# Portfolio Deployment Guide

Operational guide for deploying the 70-repository CodesbyFebin publishing portfolio.

---

## Pre-Deployment Checklist

- [ ] GitHub account with push access  
- [ ] GitHub Personal Access Token with `repo` + `public_repo` scopes
- [ ] 70 repository names reserved on GitHub
- [ ] 10+ GB disk space available
- [ ] Python 3.9+
- [ ] portfolio-manifest.json validated (70 entries, all pairs linked)
- [ ] README.md and CONTRIBUTING.md prepared

---

## Phase 1: Environment Setup (1-2 hours)

### 1.1 Install

```bash
cd tools/research-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 1.2 Configure GitHub Token

```bash
export GITHUB_TOKEN="github_pat_XXXXXXX"
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/rate_limit | jq '.rate_limit'
```

### 1.3 Verify Manifest

```bash
python3 -c "import json; m=json.load(open('portfolio-manifest.json')); \
  print(f'Awesome: {len([x for x in m[\"repositories\"] if x[\"type\"]==\"awesome\"])}'); \
  print(f'Cookbook: {len([x for x in m[\"repositories\"] if x[\"type\"]==\"cookbook\"])}')"
```

---

## Phase 2: Test Single Repository (4-8 hours)

### 2.1 Dry Run

```bash
python research_engine.py \
  --repo awesome-mcp-servers-2027 \
  --niche "Model Context Protocol servers" \
  --target 5 \
  --max-candidates 20 \
  --out ./test-output
```

### 2.2 Curator Review

- [ ] Read 3 project descriptions
- [ ] Open 5 canonical URLs
- [ ] Check topics accuracy
- [ ] Verify licenses
- [ ] Review methodology

### 2.3 Full Run

```bash
rm -rf test-output
python research_engine.py \
  --repo awesome-mcp-servers-2027 \
  --niche "Model Context Protocol servers" \
  --target 50 \
  --out ./phase1/awesome-mcp-servers-2027
```

---

## Phase 3: Portfolio Generation (24-48 hours)

### 3.1 Run Portfolio Runner

```bash
mkdir -p generated-portfolio
export GITHUB_TOKEN="..."
python portfolio_runner.py \
  --manifest portfolio-manifest.json \
  --out ./generated-portfolio
```

### 3.2 Audit Output

```bash
ls -1 generated-portfolio/ | wc -l  # Should be 36 (35 repos + docs/)

for repo in generated-portfolio/awesome-*/; do
  if [ ! -f "$repo/README.md" ] || [ ! -f "$repo/data/projects.json" ]; then
    echo "MISSING: $repo"
  fi
done

jq -s 'map(.publication_gate) | group_by(.) | \
  map({gate: .[0], count: length})' \
  generated-portfolio/*/quality-report.json
```

---

## Phase 4: GitHub Preparation (2-4 hours)

### 4.1 Create Repositories

**Option A: Using GitHub CLI**

```bash
cat portfolio-manifest.json | jq -r '.repositories[] | \
  select(.type=="awesome") | .name' | while read repo; do
  gh repo create "CodesbyFebin/$repo" --public
  echo "Created $repo"
done
```

**Option B: Manual via GitHub Web UI**

- Name: exact names from portfolio-manifest.json
- Description: niche from manifest
- Public
- Initialize with README (optional; we'll overwrite)

### 4.2 Set Topics

```bash
cat portfolio-manifest.json | jq -r '.repositories[] | \
  select(.type=="awesome") | "\(.name) \(.topics | join(","))"' | \
  while read repo topics; do
  gh repo edit "CodesbyFebin/$repo" --add-topic "$topics"
  echo "Updated topics for $repo"
done
```

---

## Phase 5: Deploy Content (4-8 hours)

### 5.1 Initialize Git

```bash
cd generated-portfolio
for repo in awesome-*/; do
  cd "$repo"
  git init
  git config user.name "CodesbyFebin"
  git config user.email "codesbyfebin@gmail.com"
  git add .
  git commit -m "Initial commit: evidence-first catalog via research engine"
  cd ..
done
```

### 5.2 Push to GitHub

```bash
for repo in awesome-*/; do
  cd "$repo"
  git remote add origin "https://github.com/CodesbyFebin/$repo.git"
  git branch -M main
  git push -u origin main
  cd ..
  echo "Pushed $repo"
done
```

### 5.3 Verify

- [ ] README.md visible and formatted
- [ ] data/projects.json with verification states
- [ ] docs/METHODOLOGY.md present
- [ ] llms.txt machine-readable
- [ ] Topics set correctly

---

## Phase 6: Cross-Linking (2-3 hours)

After all repositories live on GitHub:

1. Update README.md in each repo to include links to:
   - Paired Cookbook repository
   - Related Awesome repositories (3-8)
   - Portfolio ecosystem guide

2. Verify bidirectional links

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| HTTP 403 rate limit | Wait 1 hour or regenerate token |
| Missing projects.json | Rerun with `--max-candidates 100` |
| Git push auth fails | Regenerate GitHub token with `repo` scope |
| Disk full | Delete `.cache/research/` |

---

## Success Criteria

✓ Ready to ship when:

1. All 35 Awesome repos generated with ≥40 projects each
2. Portfolio-report.json shows ≥32 PASS gates out of 35
3. All cross-links validated and bidirectional
4. Repositories live and discoverable on GitHub
5. Quality audit passes ≥85/100 per repository

---

For full details, see tools/research-engine/README.md
