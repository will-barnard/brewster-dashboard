#!/usr/bin/env bash
# first-deploy.sh — One-time setup for a fresh server
# Usage: ./first-deploy.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Brewster Dashboard — First Deploy ==="

# 1. Check prerequisites
for cmd in docker git; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "Error: '$cmd' is not installed." >&2
    exit 1
  fi
done

# Check for docker compose (v2 plugin or standalone)
if docker compose version &> /dev/null; then
  COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
  COMPOSE="docker-compose"
else
  echo "Error: Neither 'docker compose' nor 'docker-compose' found." >&2
  exit 1
fi

# 2. Create .env if missing
if [ ! -f .env ]; then
  echo "No .env file found — copying from .env.example"
  cp .env.example .env
  echo ""
  echo "*** IMPORTANT: Edit .env before continuing! ***"
  echo "  - Set a strong JWT_SECRET"
  echo "  - Set COOKIE_DOMAIN=.will-barnard.com"
  echo "  - Set CLIENT_ORIGIN to your allowed origins"
  echo ""
  read -rp "Press Enter after editing .env to continue (or Ctrl+C to abort)..."
fi

# 3. Build and start
echo "Building Docker image..."
$COMPOSE build

echo "Starting container..."
$COMPOSE up -d

# 4. Seed super admin
echo "Seeding super admin user..."
$COMPOSE exec dashboard node server/seed.js
$COMPOSE exec dashboard node server/seed.js

echo ""
echo "=== Deploy complete ==="
echo "Dashboard is running on port $(grep -oP 'PORT=\K.*' .env || echo '3000')"
$COMPOSE ps
