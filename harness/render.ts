/**
 * Turn the agent's TSX into something a page can show: a server-rendered
 * snapshot plus the ES module that hydrates it. Shared by the hosted build;
 * mirrors the transform verify-homepage.ts proves out.
 */
import { transform } from "sucrase";
import React from "react";
import { renderToString } from "react-dom/server";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Evaluate the component with React as its only import, as the contract allows. */
export function loadComponent(tsx: string): React.ComponentType {
  const js = transform(tsx, { transforms: ["typescript", "jsx", "imports"], jsxRuntime: "classic", production: true }).code;
  const module_ = { exports: {} as any };
  const require_ = (name: string) => {
    if (name === "react") return React;
    throw new Error(`component imported "${name}"; only "react" is allowed`);
  };
  new Function("require", "module", "exports", "React", js)(require_, module_, module_.exports, React);
  const Component = module_.exports.default ?? module_.exports.PersonalizedHomepage;
  if (typeof Component !== "function") throw new Error(`no default-exported component (got ${typeof Component})`);
  return Component;
}

/**
 * Bundle React, the component and a hydrate call into one self-contained
 * script, so the page needs no CDN at view time.
 */
async function bundleHydration(tsx: string): Promise<string> {
  // Inside harness/ so the bundler resolves react from harness/node_modules.
  const dir = mkdtempSync(join(import.meta.dir, ".site-build-"));
  try {
    writeFileSync(join(dir, "homepage.tsx"), tsx);
    writeFileSync(
      join(dir, "entry.tsx"),
      `import React from "react";
import { hydrateRoot } from "react-dom/client";
import Homepage from "./homepage";
hydrateRoot(document.getElementById("root")!, React.createElement(Homepage));
`,
    );
    const result = await Bun.build({
      entrypoints: [join(dir, "entry.tsx")],
      minify: true,
      target: "browser",
      define: { "process.env.NODE_ENV": JSON.stringify("production") },
    });
    if (!result.success) throw new AggregateError(result.logs, "bundling the homepage failed");
    return await result.outputs[0].text();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** index.html (server-rendered) plus homepage.js, which hydrates it. */
export async function renderSite(tsx: string, builtAt: Date): Promise<{ html: string; script: string }> {
  const markup = renderToString(React.createElement(loadComponent(tsx)));
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="built-at" content="${builtAt.toISOString()}">
<title>Today</title>
<meta name="theme-color" content="#292c33">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>html,body{margin:0;background:#292c33}</style>
</head>
<body>
<div id="root">${markup}</div>
<!-- The page above is complete on its own; hydrating only adds hover states and other interactivity. -->
<script src="homepage.js?v=${builtAt.getTime()}" defer></script>
<!-- Cloudflare Web Analytics, the same beacon as the rest of cameronsjo.github.io. -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "9db7302de886402680e0838d0f35f7db"}'></script>
</body>
</html>
`;
  return { html, script: await bundleHydration(tsx) };
}
