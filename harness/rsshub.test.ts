import { expect, test } from "bun:test";
import type { BrowserBridge } from "@homepage/agent-core";
import { rsshubFeedFor, withRsshub } from "./rsshub";

const RSSHUB = "http://rsshub:1200";

test("maps X profile URLs to RSSHub user feeds and leaves everything else alone", () => {
  expect(rsshubFeedFor("https://x.com/trq212", RSSHUB)).toBe("http://rsshub:1200/twitter/user/trq212");
  expect(rsshubFeedFor("https://twitter.com/bcherny/", RSSHUB)).toBe("http://rsshub:1200/twitter/user/bcherny");
  expect(rsshubFeedFor("https://x.com/trq212/status/123", RSSHUB)).toBeNull();
  expect(rsshubFeedFor("https://x.com/not-a-handle", RSSHUB)).toBeNull();
  expect(rsshubFeedFor("https://news.ycombinator.com/", RSSHUB)).toBeNull();
});

test("fetches through RSSHub but reports results under the x.com URL", async () => {
  const fetched: string[] = [];
  const inner: BrowserBridge = {
    getHistory: async () => ({ sites: [], totalSitesSeen: 0 }),
    getPageHtml: async ({ urls }) => {
      fetched.push(...urls);
      return {
        pages: [{ url: urls[0], title: "feed", html: "<rss/>" }],
        failed: [{ url: urls[1], reason: `fetch ${RSSHUB}/twitter/user/nobody failed` }],
      };
    },
  };
  const result = await withRsshub(inner, RSSHUB).getPageHtml({ urls: ["https://x.com/trq212", "https://x.com/nobody"] });
  expect(fetched).toEqual(["http://rsshub:1200/twitter/user/trq212", "http://rsshub:1200/twitter/user/nobody"]);
  expect(result.pages[0].url).toBe("https://x.com/trq212");
  expect(result.failed[0].url).toBe("https://x.com/nobody");
  expect(JSON.stringify(result)).not.toContain("rsshub:1200");
});

test("is a no-op without an RSSHub address", () => {
  const inner = {} as BrowserBridge;
  expect(withRsshub(inner, undefined)).toBe(inner);
});
