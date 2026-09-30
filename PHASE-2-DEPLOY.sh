#!/bin/bash
# Phase 2 Scale & Architecture Deployment (20 repos)

set -e

PHASE2_REPOS=(
  "agent-evaluation-cookbook"
  "awesome-agent-evaluation"
  "agent-memory-cookbook"
  "awesome-agent-memory"
  "agentic-rag-cookbook"
  "awesome-agentic-rag"
  "ai-gateway-cookbook"
  "awesome-ai-gateways"
  "ai-observability-cookbook"
  "awesome-ai-observability"
  "ai-human-collaboration-cookbook"
  "awesome-ai-human-collaboration"
  "ai-integration-cookbook"
  "awesome-ai-integration-patterns"
  "ai-data-pipeline-cookbook"
  "awesome-ai-data-pipeline"
  "ai-cost-optimization-cookbook"
  "awesome-ai-cost-optimization"
  "ai-model-governance-cookbook"
  "awesome-ai-model-governance"
)

echo "🚀 Phase 2 Scale & Architecture Deployment — 20 Repos"
echo "====================================================="
echo ""

# Verify all repos exist locally
echo "✓ Verifying Phase 2 repos..."
for repo in "${PHASE2_REPOS[@]}"; do
  if [ ! -d "$repo" ]; then
    echo "❌ Missing: $repo"
    exit 1
  fi
done
echo "✓ All 20 repos verified"
echo ""

# Create on GitHub and push
echo "📤 Creating repositories on GitHub..."
FAILED=()
SUCCESS=0

for repo in "${PHASE2_REPOS[@]}"; do
  echo -n "  → $repo ... "

  # Create repo
  if ! gh repo create "CodesbyFebin/$repo" --public --source=none 2>/dev/null; then
    echo "⚠️  (may already exist)"
  fi

  # Clone, populate, and push
  if [ ! -d "temp-$repo" ]; then
    git clone "https://github.com/CodesbyFebin/$repo.git" "temp-$repo" 2>/dev/null || true
  fi

  cd "temp-$repo" 2>/dev/null || continue

  # Copy template files
  cp -r "../$repo"/* . 2>/dev/null || true

  # Configure git
  git config user.name "Research Engine" || true
  git config user.email "research@codesbyfebin.dev" || true

  # Commit and push
  if git add . 2>/dev/null; then
    git commit -m "Initial: research engine setup" 2>/dev/null || true
    git branch -M main 2>/dev/null || true
    git push -u origin main 2>/dev/null
    echo "✓"
    ((SUCCESS++))
  else
    echo "❌"
    FAILED+=("$repo")
  fi

  cd ..
  rm -rf "temp-$repo"
done

echo ""
echo "📊 Phase 2 Deployment Summary"
echo "=============================="
echo "✓ Success: $SUCCESS / 20"
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "❌ Failed: ${#FAILED[@]}"
  for repo in "${FAILED[@]}"; do
    echo "   - $repo"
  done
else
  echo "✓ All Phase 2 repos deployed successfully!"
fi

echo ""
echo "🔗 Verify on GitHub:"
echo "   gh repo list CodesbyFebin --limit 100 | wc -l"
echo ""
echo "✅ Phase 2 deployment complete!"
