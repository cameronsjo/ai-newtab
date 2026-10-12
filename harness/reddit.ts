/**
 * Read Reddit listings through their RSS feeds.
 *
 * Anonymous requests to Reddit's .json endpoints get a 403, and the HTML pages
 * come back as login walls, but /r/<subs>/<sort>.rss still answers with the
 * top 25 posts and their text. The reading list keeps the normal listing URL;
 * the bridge swaps in the feed at fetch time and reports it under that URL.
 */
import type { BrowserBridge } from "@homepage/agent-core";

const REDDIT_HOSTS = new Set(["reddit.com", "www.reddit.com", "old.reddit.com", "new.reddit.com"]);
const SUBS = /^[A-Za-z0-9_+]{2,200}$/;
const SORTS = new Set(["hot", "new", "top", "rising", "best"]);
/** Reddit asks API clients for a descriptive User-Agent and throttles generic ones. */
const USER_AGENT = "homepage-builder/1.0 (personal daily digest)";

/** The RSS feed for a subreddit listing URL, or null when the URL isn't one. */
export function redditFeedFor(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!REDDIT_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  const [r, subs, sort = "hot", ...rest] = parsed.pathname.split("/").filter(Boolean);
  if (r !== "r" || !SUBS.test(subs) || !SORTS.has(sort) || rest.length) return null;
  const feed = new URL(`https://www.reddit.com/r/${subs}/${sort}.rss`);
  const t = parsed.searchParams.get("t");
  if (t) feed.searchParams.set("t", t);
  return feed.toString();
}

type FetchText = (url: string) => Promise<string>;

const defaultFetch: FetchText = async (url) => {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};

export function withReddit(bridge: BrowserBridge, fetchText: FetchText = defaultFetch): BrowserBridge {
  return {
    getHistory: bridge.getHistory,
    async getPageHtml({ urls, loadDelayMs }) {
      const others = urls.filter((url) => !redditFeedFor(url));
      const [feeds, rest] = await Promise.all([
        Promise.all(
          urls
            .filter((url) => redditFeedFor(url))
            .map(async (url) => {
              try {
                return { page: { url, title: `Reddit feed: ${new URL(url).pathname}`, html: await fetchText(redditFeedFor(url)!) } };
              } catch (err) {
                return { failed: { url, reason: `Reddit feed: ${(err as Error).message}` } };
              }
            }),
        ),
        others.length ? bridge.getPageHtml({ urls: others, loadDelayMs }) : Promise.resolve({ pages: [], failed: [] }),
      ]);
      return {
        pages: [...rest.pages, ...feeds.flatMap((f) => (f.page ? [f.page] : []))],
        failed: [...rest.failed, ...feeds.flatMap((f) => (f.failed ? [f.failed] : []))],
      };
    },
  };
}
