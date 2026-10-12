/**
 * Resolve TLDR newsletter sections to their newest issue.
 *
 * https://tldr.tech/ai is a sign-up page; the content lives at a dated issue
 * page (https://tldr.tech/ai/2026-10-09) whose date the reading list can't know
 * ahead of time. Each edition's RSS feed lists its issues newest first, so the
 * bridge reads the feed, fetches the newest issue in place of the section URL,
 * and reports the issue URL as finalUrl so the agent links to the real issue.
 */
import type { BrowserBridge } from "@homepage/agent-core";

const SECTION = /^[a-z][a-z0-9-]{0,30}$/;

/** The edition name for a TLDR section URL (https://tldr.tech/ai → "ai"), or null. */
export function tldrEdition(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname !== "tldr.tech" && parsed.hostname !== "www.tldr.tech") return null;
  const segments = parsed.pathname.split("/").filter(Boolean);
  return segments.length === 1 && SECTION.test(segments[0]) ? segments[0] : null;
}

/** The newest issue URL in a TLDR RSS feed for that edition, or null. */
export function newestIssue(rss: string, edition: string): string | null {
  const issue = new RegExp(`https://tldr\\.tech/${edition}/\\d{4}-\\d{2}-\\d{2}`, "g");
  const found = [...rss.matchAll(issue)].map((m) => m[0]);
  return found.sort().at(-1) ?? null;
}

type FetchText = (url: string) => Promise<string>;

const defaultFetch: FetchText = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};

export function withTldr(bridge: BrowserBridge, fetchText: FetchText = defaultFetch): BrowserBridge {
  return {
    getHistory: bridge.getHistory,
    async getPageHtml({ urls, loadDelayMs }) {
      const issues = new Map<string, string>(); // issue URL -> the section URL the agent asked for
      const unresolved: { url: string; reason: string }[] = [];
      const fetchUrls: string[] = [];
      await Promise.all(
        urls.map(async (url, i) => {
          const edition = tldrEdition(url);
          if (!edition) {
            fetchUrls[i] = url;
            return;
          }
          try {
            const issue = newestIssue(await fetchText(`https://tldr.tech/api/rss/${edition}`), edition);
            if (!issue) throw new Error("no issues in the feed");
            issues.set(issue, url);
            fetchUrls[i] = issue;
          } catch (err) {
            unresolved.push({ url, reason: `TLDR ${edition} feed: ${(err as Error).message}` });
          }
        }),
      );
      const toFetch = fetchUrls.filter(Boolean);
      const result = toFetch.length
        ? await bridge.getPageHtml({ urls: toFetch, loadDelayMs })
        : { pages: [], failed: [] };
      return {
        pages: result.pages.map((page) =>
          issues.has(page.url) ? { ...page, url: issues.get(page.url)!, finalUrl: page.url } : page,
        ),
        failed: [
          ...result.failed.map((f) => (issues.has(f.url) ? { ...f, url: issues.get(f.url)! } : f)),
          ...unresolved,
        ],
      };
    },
  };
}
