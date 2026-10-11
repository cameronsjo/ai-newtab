# The hosted homepage builder: runs the daily build and publishes it to the
# repo's gh-pages branch. Meant to run next to an RSSHub on a home server, so
# the only connections it makes are outbound (Anthropic, the reading list,
# GitHub over SSH).
FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates git openssh-client tzdata \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g bun@1.4.2 pnpm@10.11.1

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/agent-core/package.json packages/agent-core/
COPY harness/package.json harness/
COPY apps/extension/package.json apps/extension/
# Only the harness and agent-core: the extension's toolchain isn't needed here.
RUN pnpm install --frozen-lockfile --filter "@homepage/harness..." --ignore-scripts

COPY packages/agent-core packages/agent-core
COPY harness harness
COPY hosted hosted
COPY docker/entrypoint.sh docker/publish-pages.sh docker/github_known_hosts docker/

RUN mkdir -p /data /app/site && chown -R node:node /data /app
USER node
ENV AGENT_STATE_PATH=/data/agent-state.json
VOLUME /data
ENTRYPOINT ["bash", "/app/docker/entrypoint.sh"]
