#!/usr/bin/env bash
set -euo pipefail

npm run build

port="${PORT:-}"
if [ -z "$port" ]; then
  for candidate in $(seq 4173 4210); do
    if ! lsof -iTCP:"$candidate" -sTCP:LISTEN >/dev/null 2>&1; then
      port="$candidate"
      break
    fi
  done
fi

if [ -z "$port" ]; then
  echo "No free preview port found." >&2
  exit 1
fi

PORT="$port" node scripts/pages-server.mjs >/tmp/pdf-workbench-smoke.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$port/pdf-workbench/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

PLAYWRIGHT_BASE_URL="http://127.0.0.1:$port/pdf-workbench/" npx playwright test --config=playwright.config.ts
