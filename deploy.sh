#!/usr/bin/env bash
# deploy.sh — Pull latest changes and rebuild
# Usage: ./deploy.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Drugan's Drums Dashboard — Deploy ==="

# Check for docker compose
if docker compose version &> /dev/null; then
  COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
  COMPOSE="docker-compose"
else
  echo "Error: Neither 'docker compose' nor 'docker-compose' found." >&2
  exit 1
fi

# 1. Pull latest code
echo "Pulling latest changes..."
git pull

# 2. Rebuild and restart
echo "Rebuilding Docker image..."
$COMPOSE build

echo "Restarting container..."
$COMPOSE up -d

# 3. Run seed in case a new migration added default data
echo "Running seed (idempotent)..."
$COMPOSE exec dashboard node server/seed.js

echo ""
echo "=== Deploy complete ==="
$COMPOSE ps
