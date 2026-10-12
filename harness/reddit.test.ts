import { expect, test } from "bun:test";
import type { BrowserBridge } from "@homepage/agent-core";
import { redditFeedFor, withReddit } from "./reddit";

test("maps subreddit listings to their RSS feeds", () => {
  expect(redditFeedFor("https://old.reddit.com/r/devops+sre/top/?t=day")).toBe("https://www.reddit.com/r/devops+sre/top.rss?t=day");
  expect(redditFeedFor("https://www.reddit.com/r/ClaudeAI/")).toBe("https://www.reddit.com/r/ClaudeAI/hot.rss");
  expect(redditFeedFor("https://www.reddit.com/r/ClaudeAI/comments/abc/x/")).toBeNull();
  expect(redditFeedFor("https://www.reddit.com/user/someone/")).toBeNull();
  expect(redditFeedFor("https://news.ycombinator.com/")).toBeNull();
});

test("reads Reddit through the feed and everything else through the bridge", async () => {
  const fetched: string[] = [];
  const inner: BrowserBridge = {
    getHistory: async () => ({ sites: [], totalSitesSeen: 0 }),
    getPageHtml: async ({ urls }) => {
      fetched.push(...urls);
      return { pages: urls.map((url) => ({ url, title: url, html: "<p/>" })), failed: [] };
    },
  };
  const feeds: string[] = [];
  const bridge = withReddit(inner, async (url) => {
    feeds.push(url);
    if (url.includes("broken")) throw new Error("HTTP 429");
    return "<feed/>";
  });
  const result = await bridge.getPageHtml({
    urls: ["https://news.ycombinator.com/", "https://old.reddit.com/r/homelab/top/?t=day", "https://old.reddit.com/r/broken/"],
  });
  expect(fetched).toEqual(["https://news.ycombinator.com/"]);
  expect(feeds).toEqual(["https://www.reddit.com/r/homelab/top.rss?t=day", "https://www.reddit.com/r/broken/hot.rss"]);
  expect(result.pages.map((p) => p.url)).toEqual(["https://news.ycombinator.com/", "https://old.reddit.com/r/homelab/top/?t=day"]);
  expect(result.pages[1].html).toBe("<feed/>");
  expect(result.failed).toEqual([{ url: "https://old.reddit.com/r/broken/", reason: "Reddit feed: HTTP 429" }]);
});
