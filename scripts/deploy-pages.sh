#!/usr/bin/env bash
# Deploy AlgoViz to GitHub Pages.
#
# Usage:
#   ./scripts/deploy-pages.sh
#
# What it does:
#   1. Builds frontend (vite)
#   2. Dumps static API data (all problems, patterns, daily)
#   3. Pushes web/dist/ contents to the gh-pages branch
#   4. GitHub Pages auto-serves from that branch
#
# After this, the site is live at:
#   https://syawqy.github.io/algoviz/
#
set -euo pipefail

cd "$(dirname "$0")/.."
DIST="web/dist"
BRANCH="gh-pages"
REMOTE_URL="https://github.com/syawqy/algoviz.git"

echo "→ Building frontend..."
GITHUB_PAGES=1 bun run build

echo "→ Building static API data..."
bun run scripts/build-static.ts

echo "→ Deploying $DIST to branch $BRANCH..."

# Use a temp directory so we don't pollute the working tree
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Copy built files
cp -r "$DIST"/* "$TMP"/

# Initialise an orphan branch in the temp dir
cd "$TMP"
git init -q
git checkout -q -b "$BRANCH"
git config user.name "hermes"
git config user.email "xfuadi@gmail.com"

# Add a .nojekyll so GitHub Pages doesn't filter _ prefixed files
touch .nojekyll

git add -A
git commit -q -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Force push to the real repo
git remote add origin "$REMOTE_URL"
git push origin "$BRANCH" --force

echo ""
echo "✓ Deployed! Site live at: https://syawqy.github.io/algoviz/"
