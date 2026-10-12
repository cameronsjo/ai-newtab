import { expect, test } from "bun:test";
import { renderSite } from "./render";

const COMPONENT = `import React from 'react';
export default function PersonalizedHomepage() {
  const [hover, setHover] = React.useState(false);
  return <a href="https://news.ycombinator.com/" onMouseEnter={() => setHover(true)}>{hover ? "Hacker News!" : "Hacker News"}</a>;
}`;

test("server-renders the component and bundles a self-contained hydration script", async () => {
  const { html, script } = await renderSite(COMPONENT, new Date("2026-10-11T06:00:00Z"));
  expect(html).toContain('<a href="https://news.ycombinator.com/">Hacker News</a>');
  expect(html).toContain('src="homepage.js?v=');
  expect(html).toContain('static.cloudflareinsights.com/beacon.min.js');
  expect(html).toContain(':root[data-theme="night"]');
  expect(html).toContain('[data-theme-toggle]');
  // Bundled, not imported from a CDN at view time.
  expect(script).not.toMatch(/from\s*["']react["']/);
  expect(script).toContain("Hacker News!");
});

test("rejects components that import anything but React", async () => {
  await expect(renderSite(`import x from 'lodash'; export default function A() { return x }`, new Date())).rejects.toThrow(/only "react"/);
});
