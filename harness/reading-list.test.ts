import { describe, expect, test } from "bun:test";
import { MAX_PAGES_PER_BUILD, buildKickoffMessage, normalizeReadingList } from "@homepage/agent-core";

describe("normalizeReadingList", () => {
  test("adds a scheme to bare hosts, keeps paths, drops junk and duplicates", () => {
    expect(
      normalizeReadingList([
        " news.ycombinator.com ",
        "https://www.reddit.com/r/ClaudeAI/",
        "# a comment",
        "",
        "ftp://example.com/file",
        "https://news.ycombinator.com/",
      ]),
    ).toEqual(["https://news.ycombinator.com/", "https://www.reddit.com/r/ClaudeAI/"]);
  });
});

describe("buildKickoffMessage reading list", () => {
  const now = new Date("2026-10-10T08:00:00");

  test("omitted when empty", () => {
    expect(buildKickoffMessage({ now, readingList: [] })).not.toContain("reading list");
  });

  test("asks for every page when the list fits the cap", () => {
    const msg = buildKickoffMessage({ now, readingList: ["https://a.com/", "https://b.com/"] });
    expect(msg).toContain("- https://a.com/");
    expect(msg).toContain("Include every one");
  });

  test("asks the agent to choose when the list exceeds the cap", () => {
    const list = Array.from({ length: MAX_PAGES_PER_BUILD + 2 }, (_, i) => `https://site${i}.com/`);
    expect(buildKickoffMessage({ now, readingList: list })).toContain(`choose the ${MAX_PAGES_PER_BUILD}`);
  });
});
