#!/usr/bin/env bash
# Runs automatically after `npm run build` (npm postbuild hook).
# Applies any pending Supabase migrations, then commits and pushes the
# just-built state to git — so a green local build always ships its schema
# and lands on origin.
set -euo pipefail

# Never run in Vercel/CI builds: no supabase CLI, no git credentials, and the
# deploy build must not mutate the database or the repo.
if [ -n "${VERCEL:-}" ] || [ -n "${CI:-}" ]; then
  echo "[postbuild] CI/Vercel build — skipping migrations and git push."
  exit 0
fi

cd "$(dirname "$0")/.."

# 1) Apply pending migrations to the linked Supabase project.
if command -v supabase >/dev/null 2>&1; then
  echo "[postbuild] Applying pending Supabase migrations…"
  echo Y | supabase db push --linked
else
  echo "[postbuild] supabase CLI not found — skipping migrations." >&2
fi

# 2) Commit and push.
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "chore: auto-sync after build ($(date +%Y-%m-%d\ %H:%M))"
fi

branch=$(git rev-parse --abbrev-ref HEAD)
if [ -n "$(git log "origin/${branch}..HEAD" 2>/dev/null || echo pending)" ]; then
  echo "[postbuild] Pushing ${branch} to origin…"
  git push origin "${branch}"
else
  echo "[postbuild] Nothing to push."
fi
