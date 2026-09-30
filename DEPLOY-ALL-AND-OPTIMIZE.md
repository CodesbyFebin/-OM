# Deploy All 70 Repos + Optimize — Complete Guide

**Mission:** Create all 70 GitHub repos live with complete setup in one session  
**Time:** ~30-45 minutes (deployment + verification)  
**Prerequisites:** `gh` CLI authenticated, Python 3.10+

---

## Step 1: Merge PR #2 (Research Engine v2)

On your machine, merge the feature branch:

```bash
cd /home/user/-OM

# Verify everything is committed
git status
# Should show: "nothing to commit, working tree clean"

# Switch to main
git checkout main

# Pull latest
git pull origin main

# Merge the feature branch
git merge claude/profile-readme-2026-qccd4v

# Push to main
git push origin main

# Verify PR #2 merged on GitHub
# https://github.com/CodesbyFebin/-OM/pull/2
# Status should show: "Merged"
```

**What gets merged:**
- ✅ Recipe generator module (`recipe_generator.py`)
- ✅ CLI integration (`recipes` subcommand)
- ✅ Test suite (8/8 passing tests)
- ✅ Portfolio architecture documentation
- ✅ Deployment guides & checklists
- ✅ Pip-installable package configuration

---

## Step 2: Deploy All 70 Repos (One Command)

**Fast deployment (all 70 at once with parallelization):**

```bash
cd /tmp/70-repos

# Make script executable
chmod +x DEPLOY-ALL-70-FAST.sh

# Deploy all 70 repos (~20-30 minutes)
./DEPLOY-ALL-70-FAST.sh
```

**Expected output:**
```
🚀 Fast Deploy All 70 Repositories
===================================

✓ GitHub authenticated
✓ Verified all 70 repos locally

Starting deployment...

[033%] Deployed 23/70 repos...
[066%] Deployed 46/70 repos...
[100%] Deployed 69/70 repos...

✓ All deployment jobs complete!

📊 Deployment Summary
====================
✓ Total repos: 70
✓ Created on GitHub: 70
✓ Templates deployed: 70
✓ Initial commits: 70

✅ Fast deployment complete!
```

**Time:** ~20-30 minutes

---

## Step 3: Verify All 70 Repos Created

```bash
# Check total count
gh repo list CodesbyFebin --limit 100 | wc -l
# Should show: 70

# View all repos
gh repo list CodesbyFebin --limit 100

# Spot-check structure (pick a random repo)
gh repo view CodesbyFebin/awesome-agent-skills --json name,description,url
gh api repos/CodesbyFebin/awesome-agent-skills/contents
# Should show: .github/, .gitignore, README.md, portfolio-manifest.json
```

---

## Step 4: Install & Test Research Engine

```bash
# Install latest from merged main
pip install --upgrade dh-research-engine

# Verify installation
dh-research --help
dh-research selftest
# Should output: ✓ SELFTEST PASSED

# Export your GitHub token
export GITHUB_TOKEN=ghp_... # your real token
```

---

## Step 5: Quick Test (Phase 1 Sample)

Test on one Foundation repo to verify setup works:

```bash
cd /tmp/test-70-repos
mkdir -p /tmp/test-70-repos && cd /tmp/test-70-repos

# Run on Foundation repo
dh-research repo --repo awesome-agent-skills

# Check results
ls -la out/awesome-agent-skills/
cat out/awesome-agent-skills/reports/quality.json | jq '.score'
# Target: ≥70
```

---

## Step 6: Configure Automation (Optional but Recommended)

Enable weekly auto-refresh for all Awesome repos:

```bash
# Add GitHub token secret to all 35 Awesome repos
for repo in $(cd /tmp/70-repos && ls -1d awesome-* | sort); do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
  echo "✓ Secret set for $repo"
done

echo "✓ Automation configured for 35 Awesome repos"
```

**Result:** Every Sunday 2am UTC, all repos automatically refresh their catalogs.

---

## Step 7: Optimize All Repos (Optional - Best Practices)

Apply best practices to all repos:

```bash
# 1. Add repository descriptions
for repo in $(cd /tmp/70-repos && ls -1d awesome-* | sort); do
  niche=$(cat /tmp/70-repos/$repo/portfolio-manifest.json | jq -r '.repositories[0].niche')
  gh repo edit "CodesbyFebin/$repo" --description "$niche - Curated with dh-research-engine"
  echo "✓ Updated description for $repo"
done

# 2. Add topics to repos
for repo in $(cd /tmp/70-repos && ls -1d awesome-* | sort); do
  gh repo edit "CodesbyFebin/$repo" --add-topic "awesome-list" --add-topic "research-engine" --add-topic "curated"
  echo "✓ Added topics to $repo"
done

# 3. Enable branch protection on main (optional)
for repo in $(cd /tmp/70-repos && ls -1d awesome-* | sort); do
  gh api repos/CodesbyFebin/$repo/branches/main/protection \
    -f required_status_checks='{"strict":false,"contexts":[]}' \
    -f enforce_admins=false \
    -f required_pull_request_reviews=null \
    -f restrictions=null
  echo "✓ Branch protection enabled for $repo"
done
```

---

## Step 8: Full Portfolio Validation

Verify all 70 repos are live and optimized:

```bash
# 1. Count total
echo "Total repos:"
gh repo list CodesbyFebin --limit 100 | wc -l
# Should show: 70

# 2. Check descriptions are set
echo ""
echo "Sample descriptions:"
for repo in awesome-agent-skills awesome-agent-evaluation awesome-agent-fine-tuning; do
  desc=$(gh repo view CodesbyFebin/$repo --json description -q)
  echo "  $repo: $desc"
done

# 3. Verify workflows are in place
echo ""
echo "Workflows verified:"
for repo in awesome-agent-skills awesome-agentic-devops awesome-mcp-servers-2027; do
  count=$(gh api repos/CodesbyFebin/$repo/contents/.github/workflows 2>/dev/null | jq 'length' || echo 0)
  [ "$count" -gt 0 ] && echo "  ✓ $repo" || echo "  ❌ $repo"
done

# 4. Test research engine on one repo per phase
echo ""
echo "Testing research engine on sample repos..."
export GITHUB_TOKEN=ghp_...

for repo in awesome-agent-skills awesome-agent-evaluation awesome-agent-fine-tuning awesome-ai-agent-orchestration; do
  echo "Testing $repo..."
  dh-research repo --repo $repo 2>&1 | tail -2
done
```

---

## Complete Deployment Checklist

### Pre-Deployment
- [ ] PR #2 reviewed and ready to merge
- [ ] Working tree clean: `git status`
- [ ] All 70 repos verified locally in `/tmp/70-repos/`
- [ ] `gh` CLI authenticated: `gh auth status`
- [ ] Python 3.10+: `python --version`

### Deployment
- [ ] Merge PR #2 to main: `git merge claude/profile-readme-2026-qccd4v`
- [ ] Run fast deployment: `./DEPLOY-ALL-70-FAST.sh`
- [ ] Verify all 70 repos created: `gh repo list | wc -l` = 70
- [ ] Spot-check 3-5 repos for correct structure

### Testing
- [ ] Install research engine: `pip install dh-research-engine`
- [ ] Run selftest: `dh-research selftest` ✓
- [ ] Test Phase 1 sample: `dh-research repo --repo awesome-agent-skills`
- [ ] Check quality metrics: quality.json score ≥70

### Optimization
- [ ] Add descriptions to all repos (optional)
- [ ] Add topics to all repos (optional)
- [ ] Enable branch protection (optional)
- [ ] Configure secrets for auto-refresh (optional)

### Validation
- [ ] All 70 repos on GitHub ✓
- [ ] All have correct templates ✓
- [ ] Research engine works ✓
- [ ] Quality metrics acceptable ✓

---

## Timeline

| Step | Duration | Notes |
|------|----------|-------|
| Merge PR #2 | 5 min | On your machine |
| Deploy all 70 | 20-30 min | Parallel deployment |
| Verify repos | 5 min | Count & spot-check |
| Test engine | 10 min | 1-2 sample repos |
| Configure automation | 5 min | Optional |
| Optimize repos | 10 min | Optional |
| **Total** | **~60 min** | **~1 hour complete** |

---

## Commands Quick Reference

```bash
# 1. Merge PR #2
cd /home/user/-OM
git checkout main && git pull origin main
git merge claude/profile-readme-2026-qccd4v
git push origin main

# 2. Deploy all 70
cd /tmp/70-repos
chmod +x DEPLOY-ALL-70-FAST.sh
./DEPLOY-ALL-70-FAST.sh

# 3. Verify
gh repo list CodesbyFebin --limit 100 | wc -l
# Output: 70

# 4. Test
export GITHUB_TOKEN=ghp_...
pip install dh-research-engine
dh-research repo --repo awesome-agent-skills

# 5. Check quality
cat out/awesome-agent-skills/reports/quality.json | jq '.score'

# 6. Configure automation (optional)
for repo in $(cd /tmp/70-repos && ls -1d awesome-* | sort); do
  gh secret set GITHUB_TOKEN --body "ghp_..." -R "CodesbyFebin/$repo"
done
```

---

## What Gets Created

### On GitHub
- ✅ 70 public repositories
- ✅ 35 Awesome Lists (discovery)
- ✅ 35 Cookbooks (recipes)
- ✅ Portfolio-manifest.json (niche definitions)
- ✅ .gitignore (excludes research outputs)
- ✅ README.md (quick start)
- ✅ .github/workflows/research-engine.yml (weekly refresh)

### Locally
- ✅ Portfolio catalog (data/projects.json)
- ✅ Quality metrics (reports/quality.json)
- ✅ Evidence ledger (evidence/projects.ndjson)
- ✅ Updated README with project list

### Package
- ✅ dh-research-engine pip package
- ✅ Recipe generator CLI
- ✅ Anti-fabrication guarantees
- ✅ HTTP caching for efficiency

---

## Success Indicators

After deployment completes, you should have:

| Indicator | Target | How to Check |
|-----------|--------|-------------|
| Repos created | 70 | `gh repo list CodesbyFebin \| wc -l` |
| Repos have templates | 100% | `gh api repos/.../contents` |
| Research engine works | ✓ | `dh-research repo --repo awesome-X` |
| Quality score Phase 1 | ≥70 | `cat out/.../quality.json \| jq .score` |
| Automation ready | ✓ | `gh workflow list -R CodesbyFebin/awesome-X` |
| Anti-fabrication | ✓ | `dh-research selftest` |

---

## Troubleshooting

### "Repository already exists"
→ Normal if repos partially created before. Script handles this.

### "Authentication failed"
→ Run `gh auth logout && gh auth login`

### "API rate limit"
→ GitHub allows 5000 requests/hour. 70 repos = ~200 requests.
→ If hit, wait 1 hour and re-run (safe to retry).

### Some repos fail
→ DEPLOY-ALL-70-FAST.sh logs issues to stdout.
→ Manual retry: `cd /tmp/70-repos/{repo} && git push -u origin main`

### Research engine takes too long
→ Normal for 50+ project discovery. Takes 5-10 minutes per repo.
→ Check progress with: `tail -f out/*/data/projects.json`

---

## After Deployment

### Immediate (Next 30 min)
1. ✅ Verify all 70 repos on GitHub
2. ✅ Test research engine on sample
3. ✅ Configure automation secrets (optional)

### Short-term (Next 2-3 days)
1. Run engine on all repos to populate catalogs
2. Monitor quality metrics
3. Adjust manifests if needed

### Long-term (Ongoing)
1. Weekly auto-refresh (Sunday 2am UTC)
2. Monitor discovery trends
3. Update cookbooks with new patterns

---

## Files Ready in `/tmp/70-repos/`

- ✅ `DEPLOY-ALL-70-FAST.sh` — Fast parallel deployment (NEW)
- ✅ `PHASE-1-DEPLOY.sh` — Phase-by-phase alternative
- ✅ `PHASE-2-DEPLOY.sh` — Phase-by-phase alternative
- ✅ `PHASE-3-DEPLOY.sh` — Phase-by-phase alternative
- ✅ `PHASE-4-DEPLOY.sh` — Phase-by-phase alternative
- ✅ All 70 repository templates
- ✅ Complete documentation

---

## Next Steps

1. **Merge PR #2:** `git merge claude/profile-readme-2026-qccd4v`
2. **Deploy all 70:** `./DEPLOY-ALL-70-FAST.sh`
3. **Verify:** `gh repo list CodesbyFebin | wc -l` = 70
4. **Test:** `dh-research repo --repo awesome-agent-skills`
5. **Optimize:** Configure secrets and descriptions (optional)

**Total time:** ~1 hour for complete live portfolio

---

**Ready?** Start with: `./DEPLOY-ALL-70-FAST.sh` on your machine
