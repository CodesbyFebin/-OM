#!/bin/bash
# Phase 1 Foundation Deployment (10 repos)

set -e

PHASE1_REPOS=(
  "agent-skills-cookbook"
  "awesome-agent-skills"
  "agentic-devops-cookbook"
  "awesome-agentic-devops"
  "awesome-mcp-servers-2027"
  "awesome-sovereign-ai"
  "sovereign-ai-cookbook"
  "awesome-verifiable-ai"
  "verifiable-ai-cookbook"
  "mcp-cookbook"
)

echo "🚀 Phase 1 Foundation Deployment — 10 Repos"
echo "=============================================="
echo ""

# Verify all repos exist locally
echo "✓ Verifying Phase 1 repos..."
for repo in "${PHASE1_REPOS[@]}"; do
  if [ ! -d "$repo" ]; then
    echo "❌ Missing: $repo"
    exit 1
  fi
done
echo "✓ All 10 repos verified"
echo ""

# Create on GitHub and push
echo "📤 Creating repositories on GitHub..."
FAILED=()
SUCCESS=0

for repo in "${PHASE1_REPOS[@]}"; do
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
echo "📊 Phase 1 Deployment Summary"
echo "=============================="
echo "✓ Success: $SUCCESS / 10"
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "❌ Failed: ${#FAILED[@]}"
  for repo in "${FAILED[@]}"; do
    echo "   - $repo"
  done
else
  echo "✓ All Phase 1 repos deployed successfully!"
fi

echo ""
echo "🔗 Verify on GitHub:"
echo "   gh repo list CodesbyFebin --limit 100 | grep -E '(agent-skills|agentic-devops|awesome-mcp|sovereign-ai|verifiable-ai|mcp-cookbook)'"
echo ""
echo "✅ Phase 1 deployment complete!"
