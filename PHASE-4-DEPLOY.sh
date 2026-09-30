#!/bin/bash
# Phase 4 Operations & Orchestration Deployment (20 repos)

set -e

PHASE4_REPOS=(
  "ai-agent-orchestration-cookbook"
  "awesome-ai-agent-orchestration"
  "ai-cost-optimization-cookbook"
  "awesome-ai-cost-optimization"
  "ai-data-pipeline-cookbook"
  "awesome-ai-data-pipeline"
  "ai-deployment-cookbook"
  "awesome-ai-deployment-patterns"
  "ai-monitoring-alerting-cookbook"
  "awesome-ai-monitoring-alerting"
  "ai-platform-engineering-cookbook"
  "awesome-ai-platform-engineering"
  "ai-economics-cookbook"
  "awesome-ai-economics"
  "ai-mlops-cookbook"
  "awesome-ai-mlops"
  "ai-infrastructure-cookbook"
  "awesome-ai-infrastructure"
  "ai-operations-cookbook"
  "awesome-ai-operations"
)

echo "🚀 Phase 4 Operations & Orchestration Deployment — 20 Repos"
echo "=========================================================="
echo ""
echo "✓ Verifying Phase 4 repos..."
for repo in "${PHASE4_REPOS[@]}"; do
  if [ ! -d "$repo" ]; then
    echo "❌ Missing: $repo"
    exit 1
  fi
done
echo "✓ All 20 repos verified"
echo ""
echo "📤 Creating repositories on GitHub..."

SUCCESS=0
for repo in "${PHASE4_REPOS[@]}"; do
  echo -n "  → $repo ... "
  if ! gh repo create "CodesbyFebin/$repo" --public --source=none 2>/dev/null; then
    echo "⚠️  (may exist)"
  fi
  
  if [ ! -d "temp-$repo" ]; then
    git clone "https://github.com/CodesbyFebin/$repo.git" "temp-$repo" 2>/dev/null || true
  fi
  
  cd "temp-$repo" 2>/dev/null || continue
  cp -r "../$repo"/* . 2>/dev/null || true
  git config user.name "Research Engine" || true
  git config user.email "research@codesbyfebin.dev" || true
  
  if git add . 2>/dev/null; then
    git commit -m "Initial: research engine setup" 2>/dev/null || true
    git branch -M main 2>/dev/null || true
    git push -u origin main 2>/dev/null
    echo "✓"
    ((SUCCESS++))
  else
    echo "❌"
  fi
  
  cd ..
  rm -rf "temp-$repo"
done

echo ""
echo "✓ Phase 4 Deployment Complete: $SUCCESS / 20"
