#!/usr/bin/env bash
set -euo pipefail

npm run build

node ./node_modules/.bin/sirv docs --single --host 127.0.0.1 --port 4173 >/tmp/pdf-workbench-smoke.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:4173/pdf-workbench/ >/dev/null; then
    break
  fi
  sleep 0.2
done

npx playwright test --config=playwright.config.ts
