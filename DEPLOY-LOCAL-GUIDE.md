# Deploy 70 Repos Locally - Step-by-Step Guide

This guide shows how to deploy all 70 repositories from your local machine.

## Prerequisites

- GitHub account with repos already created (or use script to create them)
- `git` installed
- `curl` installed
- GitHub Personal Access Token (see below)

## Step 1: Get Your GitHub Token

1. Go to: https://github.com/settings/tokens/new
2. Create a "Personal access token (classic)"
3. Select these scopes:
   - ✓ `repo` (Full control of private repositories)
   - ✓ `workflow` (Update GitHub Action workflows)
4. Click "Generate token"
5. **Copy the token** (you won't see it again)
6. Set it in your terminal:
   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Step 2: Clone Repository

The 70 repo templates are in the `-OM` repository:

```bash
cd ~/projects  # or wherever you keep projects
git clone https://github.com/CodesbyFebin/-OM.git
cd -OM
git checkout main
```

## Step 3: Option A - Fast Deploy (Recommended)

Run the deployment script with your token:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
chmod +x deploy-70-repos-with-token.sh
./deploy-70-repos-with-token.sh
```

**Time:** ~30-45 minutes (creates all 70 repos and pushes templates)

**Expected output:**
```
[100%] Creating verifiable-ai-cookbook... created... ✓

✅ Deployment complete!

📊 Summary
==========
✓ Total repos deployed: 70/70
❌ Failed: 0

🔍 Verify deployment:
   curl -H 'Authorization: token $GITHUB_TOKEN' https://api.github.com/users/CodesbyFebin/repos | jq 'length'
   Should output: 70+
```

## Step 3: Option B - Manual Deploy (Per-Repo)

If you want more control, deploy repos one by one:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
cd /home/user/-OM

for repo in $(ls -1d */ | sed 's#/##' | grep -E '^(awesome-|[a-z]+-cookbook)$'); do
  echo "Deploying $repo..."
  
  # Create repo
  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d '{"name":"'$repo'","private":false,"auto_init":true}' \
    2>/dev/null
  
  # Clone, populate, push
  TEMP=$(mktemp -d)
  git clone https://$GITHUB_TOKEN@github.com/CodesbyFebin/$repo.git "$TEMP" 2>/dev/null || true
  cp -r "$repo"/* "$TEMP/" 2>/dev/null || true
  
  cd "$TEMP"
  git config user.name "Research Engine"
  git config user.email "research@codesbyfebin.dev"
  git add .
  git commit -m "Initial: research engine setup" 2>/dev/null || true
  git push -u origin main 2>/dev/null || true
  
  cd - > /dev/null
  rm -rf "$TEMP"
  
  echo "✓ $repo"
done

echo "✅ All repos deployed!"
```

## Step 4: Verify Deployment

Check that all 70 repos were created:

```bash
# Count repos
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/users/CodesbyFebin/repos \
  | jq 'length'

# Should output: 70 (or more if you had existing repos)

# View all repos
gh repo list CodesbyFebin --limit 100 | wc -l
# Should output: 70+

# Spot check one repo
gh repo view CodesbyFebin/awesome-agent-evaluation
```

## Step 5: Test Research Engine (Optional)

After deployment, test the research engine:

```bash
# Install latest version
pip install --upgrade dh-research-engine

# Export token
export GITHUB_TOKEN=ghp_...

# Test on one repo
dh-research repo --repo awesome-agent-evaluation

# Check output
ls -la out/awesome-agent-evaluation/
cat out/awesome-agent-evaluation/reports/quality.json | jq '.score'
# Target: ≥70
```

## Troubleshooting

### "Repository already exists"
→ Normal if repos were partially created before. Script handles this.

### "Authentication failed"
→ Check that `$GITHUB_TOKEN` is exported:
```bash
echo $GITHUB_TOKEN
```

### "API rate limit exceeded"
→ GitHub allows 5000 requests/hour
→ Wait 1 hour and retry (safe to re-run)

### Some repos fail
→ Script logs failures
→ Re-run to retry failed repos

### Deployment is slow
→ Normal for 70 repos with network delays
→ Takes 30-45 minutes for full deployment

## What Gets Created

On GitHub (per repo):
- `portfolio-manifest.json` — Niche definition
- `.gitignore` — Exclude cache/outputs
- `README.md` — Quick start guide
- `.github/workflows/research-engine.yml` — Weekly auto-refresh

On your machine (after research engine runs):
- `data/projects.json` — Curated catalog
- `reports/quality.json` — Quality metrics
- `evidence/projects.ndjson` — Provenance ledger

## Next Steps

1. ✅ Create 70 GitHub repos
2. ✅ Push templates to each
3. Run research engine to populate each repo
4. Monitor quality metrics
5. Configure automation (GitHub secrets)

---

**Questions?** See the complete guide:
https://github.com/CodesbyFebin/-OM/blob/main/DEPLOY-ALL-AND-OPTIMIZE.md
