/**
 * Route X profile pages through a self-hosted RSSHub, so the hosted build can
 * read public posts without signing in.
 *
 * The reading list and the agent only ever see https://x.com/<handle>; the
 * bridge swaps in the RSSHub feed at fetch time. That keeps the private RSSHub
 * address out of the prompt and away from the block list, which (rightly)
 * refuses local-network hosts. With no RSSHUB_URL set, x.com is fetched as-is
 * and comes back as a login wall, which the page reports as unavailable.
 */
import type { BrowserBridge } from "@homepage/agent-core";

const X_HOSTS = new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"]);
const HANDLE = /^[A-Za-z0-9_]{1,15}$/;

/** The RSSHub feed URL for an X profile URL, or null when the URL isn't one. */
export function rsshubFeedFor(url: string, rsshubUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!X_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 1 || !HANDLE.test(segments[0])) return null;
  return `${rsshubUrl.replace(/\/+$/, "")}/twitter/user/${segments[0]}`;
}

export function withRsshub(bridge: BrowserBridge, rsshubUrl: string | undefined): BrowserBridge {
  if (!rsshubUrl) return bridge;
  return {
    getHistory: bridge.getHistory,
    async getPageHtml({ urls, loadDelayMs }) {
      const feeds = new Map<string, string>(); // feed URL -> the x.com URL the agent asked for
      const fetchUrls = urls.map((url) => {
        const feed = rsshubFeedFor(url, rsshubUrl);
        if (!feed) return url;
        feeds.set(feed, url);
        return feed;
      });
      const result = await bridge.getPageHtml({ urls: fetchUrls, loadDelayMs });
      // Report results under the URL the agent asked for, so it never sees the RSSHub address.
      const back = (url: string) => feeds.get(url) ?? url;
      return {
        pages: result.pages.map((page) => ({ ...page, url: back(page.url), finalUrl: undefined })),
        failed: result.failed.map((f) => ({ ...f, url: back(f.url), reason: f.reason.replaceAll(rsshubUrl, "rsshub") })),
      };
    },
  };
}
