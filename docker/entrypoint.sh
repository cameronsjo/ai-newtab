#!/usr/bin/env bash
# Build and publish once a day at BUILD_AT (container local time), and once at
# start when RUN_ON_START=true. A failed build leaves yesterday's page up.
set -uo pipefail

BUILD_AT="${BUILD_AT:-06:00}"

publish() {
  echo "[newtab] build started $(date -Is)"
  if pnpm --silent site:build && bash /app/docker/publish-pages.sh; then
    echo "[newtab] published $(date -Is)"
  else
    echo "[newtab] build failed $(date -Is); the previous page stays up" >&2
  fi
}

if [[ "${RUN_ON_START:-false}" == "true" ]]; then publish; fi

while true; do
  now=$(date +%s)
  next=$(date -d "today ${BUILD_AT}" +%s)
  (( next <= now )) && next=$(date -d "tomorrow ${BUILD_AT}" +%s)
  echo "[newtab] next build $(date -d "@${next}" -Is)"
  sleep $(( next - now ))
  publish
done
