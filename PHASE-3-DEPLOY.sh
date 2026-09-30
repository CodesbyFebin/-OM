#!/bin/bash
# Phase 3 Specialization & Safety Deployment (20 repos)

set -e

PHASE3_REPOS=(
  "agent-fine-tuning-cookbook"
  "awesome-agent-fine-tuning"
  "ai-safety-cookbook"
  "awesome-ai-safety"
  "ai-security-cookbook"
  "awesome-ai-security"
  "ai-compliance-cookbook"
  "awesome-ai-compliance"
  "ai-privacy-cookbook"
  "awesome-ai-privacy"
  "ai-federated-learning-cookbook"
  "awesome-ai-federated-learning"
  "ai-ethics-cookbook"
  "awesome-ai-ethics"
  "ai-bias-detection-cookbook"
  "awesome-ai-bias-detection"
  "ai-explainability-cookbook"
  "awesome-ai-explainability"
  "ai-robustness-cookbook"
  "awesome-ai-robustness"
)

echo "🚀 Phase 3 Specialization & Safety Deployment — 20 Repos"
echo "======================================================="
echo ""
echo "✓ Verifying Phase 3 repos..."
for repo in "${PHASE3_REPOS[@]}"; do
  if [ ! -d "$repo" ]; then
    echo "❌ Missing: $repo"
    exit 1
  fi
done
echo "✓ All 20 repos verified"
echo ""
echo "📤 Creating repositories on GitHub..."

SUCCESS=0
for repo in "${PHASE3_REPOS[@]}"; do
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
echo "✓ Phase 3 Deployment Complete: $SUCCESS / 20"
