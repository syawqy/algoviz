#!/usr/bin/env bash
# Deploy AlgoViz to GitHub Pages.
#
# Usage:
#   ./scripts/deploy-pages.sh
#
# What it does:
#   1. Builds frontend (vite) into a temp dir
#   2. Dumps static API data
#   3. Pushes contents to the gh-pages branch
#   4. GitHub Pages auto-serves from that branch
#
# This does NOT touch web/dist/ — local dev is unaffected.
#
# After this, the site is live at:
#   https://syawqy.github.io/algoviz/
#
set -euo pipefail

cd "$(dirname "$0")/.."
BRANCH="gh-pages"
REMOTE_URL="https://github.com/syawqy/algoviz.git"

# Use a temp directory for the entire gh-pages build
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "→ Building frontend into temp dir..."
GITHUB_PAGES=1 bunx vite build --outDir "$TMP" --emptyOutDir 2>&1 | tail -4

echo "→ Building static API data..."
# Temporarily override the output dir for the static build
OUT_DIR="$TMP" bun run scripts/build-static.ts

echo "→ Adding .nojekyll..."
touch "$TMP/.nojekyll"

echo "→ Deploying to branch $BRANCH..."
cd "$TMP"
git init -q
git checkout -q -b "$BRANCH"
git config user.name "hermes"
git config user.email "xfuadi@gmail.com"
git add -A
git commit -q -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git remote add origin "$REMOTE_URL"
git push origin "$BRANCH" --force

echo ""
echo "✓ Deployed! Site live at: https://syawqy.github.io/algoviz/"
