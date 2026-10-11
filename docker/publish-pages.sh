#!/usr/bin/env bash
# Push site/ to the gh-pages branch as a single fresh commit. The branch holds
# only today's page, so it never grows.
set -euo pipefail

: "${PAGES_REPO:?set PAGES_REPO, e.g. cameronsjo/ai-newtab}"
: "${DEPLOY_KEY_B64:?set DEPLOY_KEY_B64 to a base64-encoded deploy key with write access}"

key=$(mktemp)
trap 'rm -f "$key"' EXIT
printf '%s' "$DEPLOY_KEY_B64" | base64 -d > "$key"
chmod 600 "$key"
# GitHub's published host keys, so the first connection can't be intercepted.
export GIT_SSH_COMMAND="ssh -i $key -o IdentitiesOnly=yes -o UserKnownHostsFile=$(dirname "$0")/github_known_hosts -o StrictHostKeyChecking=yes"

cd "${SITE_DIR:-/app/site}"
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git -c user.name="newtab-builder" -c user.email="newtab-builder@users.noreply.github.com" \
  add -A
git -c user.name="newtab-builder" -c user.email="newtab-builder@users.noreply.github.com" \
  commit -q -m "Homepage for $(date +%F)"
git push -q --force "${PAGES_REMOTE:-git@github.com:${PAGES_REPO}.git}" gh-pages
rm -rf .git
