/**
 * The hosted build: run the agent against the reading list in hosted/, render
 * the result, and write a static site to site/ for GitHub Pages.
 *
 * Runs on a server with no browser, so there is no history and pages are
 * fetched anonymously. The reading list stands in for both.
 *
 * Run: pnpm site:build          (needs ANTHROPIC_API_KEY)
 *      pnpm site:build <file>   (skip the agent; render an existing .tsx)
 */
import Anthropic from "@anthropic-ai/sdk";
import { MODEL_CHOICES, normalizeReadingList, runHomepageBuild, type BrowserBridge, type HomepageModel } from "@homepage/agent-core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FileKVStore, STATE_PATH, nodeBridge } from "./node-bridge";
import { renderSite } from "./render";

const ROOT = join(import.meta.dir, "..");
const SITE_DIR = join(ROOT, "site");

const HOSTED_NOTE = `This build runs on a server, not in the user's browser. getHistory returns nothing,
and getPageHtml fetches pages anonymously, so a login wall means that page is unavailable.
Build the page from the reading list.`;

/** No browser, so no history: the reading list is the whole picture. */
const hostedBridge: BrowserBridge = {
  async getHistory() {
    return { sites: [], totalSitesSeen: 0 };
  },
  getPageHtml: nodeBridge.getPageHtml,
};

async function buildWithAgent(): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const readingList = normalizeReadingList(readFileSync(join(ROOT, "hosted/reading-list.txt"), "utf-8").split("\n"));
  if (!readingList.length) throw new Error("hosted/reading-list.txt has no pages in it");
  const instructions = readFileSync(join(ROOT, "hosted/instructions.md"), "utf-8").trim();
  const model = MODEL_CHOICES.find((m) => m.id === process.env.HOMEPAGE_MODEL)?.id as HomepageModel | undefined;

  const result = await runHomepageBuild({
    client: new Anthropic({ apiKey }),
    bridge: hostedBridge,
    store: new FileKVStore(STATE_PATH),
    userSystemPrompt: `${HOSTED_NOTE}\n\n${instructions}`,
    readingList,
    model,
    callbacks: {
      onPhase: (phase, detail) => console.log(`[${phase}]${detail ? ` ${detail}` : ""}`),
      onLog: (line) => console.log(`  · ${line}`),
    },
  });
  console.log(`session ${result.sessionId}, ${result.code.length} bytes from ${result.source}`);
  return result.code;
}

async function main() {
  const tsx = process.argv[2] ? readFileSync(process.argv[2], "utf-8") : await buildWithAgent();
  const { html, script } = await renderSite(tsx, new Date());

  mkdirSync(SITE_DIR, { recursive: true });
  writeFileSync(join(SITE_DIR, "index.html"), html);
  writeFileSync(join(SITE_DIR, "homepage.js"), script);
  writeFileSync(join(SITE_DIR, "homepage.tsx"), tsx);
  console.log(`wrote ${SITE_DIR}/index.html (${html.length}b)`);
}

main().catch((err) => {
  console.error("[publish-site] fatal:", err);
  process.exit(1);
});
