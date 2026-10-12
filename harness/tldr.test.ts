import { expect, test } from "bun:test";
import type { BrowserBridge } from "@homepage/agent-core";
import { newestIssue, tldrEdition, withTldr } from "./tldr";

const RSS = `<rss><channel><link>https://tldr.tech</link>
<item><link>https://tldr.tech/ai/2026-10-08</link></item>
<item><link>https://tldr.tech/ai/2026-10-09</link></item>
</channel></rss>`;

test("recognises TLDR section URLs only", () => {
  expect(tldrEdition("https://tldr.tech/ai")).toBe("ai");
  expect(tldrEdition("https://tldr.tech/infosec/")).toBe("infosec");
  expect(tldrEdition("https://tldr.tech/ai/2026-10-09")).toBeNull();
  expect(tldrEdition("https://tldr.tech/")).toBeNull();
  expect(tldrEdition("https://example.com/ai")).toBeNull();
});

test("picks the newest issue in the feed", () => {
  expect(newestIssue(RSS, "ai")).toBe("https://tldr.tech/ai/2026-10-09");
  expect(newestIssue(RSS, "devops")).toBeNull();
});

test("fetches the newest issue and reports it under the section URL", async () => {
  const fetched: string[] = [];
  const inner: BrowserBridge = {
    getHistory: async () => ({ sites: [], totalSitesSeen: 0 }),
    getPageHtml: async ({ urls }) => {
      fetched.push(...urls);
      return { pages: urls.map((url) => ({ url, title: url, html: "<p/>" })), failed: [] };
    },
  };
  const feeds: Record<string, string> = { "https://tldr.tech/api/rss/ai": RSS };
  const bridge = withTldr(inner, async (url) => {
    if (!feeds[url]) throw new Error("HTTP 404");
    return feeds[url];
  });
  const result = await bridge.getPageHtml({
    urls: ["https://news.ycombinator.com/", "https://tldr.tech/ai", "https://tldr.tech/nope"],
  });
  expect(fetched).toEqual(["https://news.ycombinator.com/", "https://tldr.tech/ai/2026-10-09"]);
  expect(result.pages[1]).toMatchObject({ url: "https://tldr.tech/ai", finalUrl: "https://tldr.tech/ai/2026-10-09" });
  expect(result.failed).toEqual([{ url: "https://tldr.tech/nope", reason: "TLDR nope feed: HTTP 404" }]);
});
