## Look: Artificer, dark

A serious, dense morning briefing for an engineer, not a newspaper. Use exactly these colors and fonts:

- Page `#292c33`. Raised cards `#313540` with a 1px `#4a4f5c` border and 8px corners. Dividers `#4a4f5c`.
- Text `#e8e6e1`, secondary text `#c5c8c6`, meta lines (source, date) `#b8cad4`.
- Accent: burnished gold `#dbbb6f` for links, the wordmark and small section labels.
- Status pills (999px radius, small mono text): exploited or urgent `#a04540` with `#f5ead0` text; critical or "look when you can" `#c4808a` with `#20203e` text; good news `#2d6644` with `#f5ead0` text.
- Urgent callout: `#3a1f1d` background, 1px `#a04540` border, 12px corners, label text `#e6a8a2`.
- Version numbers and code: `#b095e0`.
- Headings, labels, pills, dates and meta lines: `'JetBrains Mono', monospace`. Body text: `'iA Writer Quattro V', 'Iowan Old Style', Charter, 'Source Sans 3', system-ui, sans-serif`. Sizes in rem, body about 1.0625rem with line-height 1.55.
- No gradients, shadows, emoji or decorative color. Everything else stays on the page surface: no colored masthead bar.

Layout:
- Header on the page surface: a small steel uppercase mono date line, then the wordmark "the context" in gold mono, a row of count pills on the right, and a hairline rule under it.
- At most one urgent callout at the top, and only when something in the relevance rule below needs action today. Otherwise leave it out.
- Below the header, a main column with the sections and a narrower side column (patch queue, ops wire, dates). Use a wrapping flex row (main `flex: 999 1 560px; min-width: 0`, side `flex: 1 1 300px`) so the side column drops under the main one on a phone.
- It must work at 390px wide: no fixed widths over 360px, no horizontal scrolling, padding `clamp(16px, 4vw, 40px)`, grids as `repeat(auto-fit, minmax(240px, 1fr))`.

## What's relevant

I care about AI and the tools I actually use, not enterprise IT. Only include a security or ops item when it touches one of:
- AI models, agents, coding agents, MCP, and the labs that make them (Anthropic above all);
- self-hosting and homelab software: containers, Kubernetes, reverse proxies, identity and SSO, VPN and mesh networking, DNS filtering, media servers, NAS operating systems;
- developer tooling: GitHub and GitHub Actions, package registries, Node, Bun, Python and Go, terminals and editors;
- macOS, iOS and consumer routers or network gear.

Leave out enterprise appliances and products (VPN concentrators, firewalls, ADCs, backup suites, Windows fleet management, ERP), ransomware against companies I don't use, arrests, and breach roundups, however severe. A max-severity bug in something I don't run is not news to me.

## Sections

In this order: AI, From the Claude team (posts from the x.com accounts on the reading list, plus Claude Code releases), AI Security, Homelab & Ops, From Reddit (grouped by subreddit).
Always read the x.com accounts on the reading list; they arrive as feeds of recent posts. Summarise what each person actually said and link the post itself. If a feed has nothing from the last week, say so in one line instead of resurfacing old posts.
Lead with what's genuinely new since yesterday. Keep each blurb to two or three sentences and say why it matters to me.

## Full breakdowns

Every story gets a headline and its short blurb, then a native `<details>` element (summary text "Full breakdown", gold mono) that opens to the whole story in two to four short paragraphs: what happened, the specifics (versions, numbers, who is affected, dates), why it matters to me, and what to do about it if anything. End it with the source link and date. Use only what the fetched pages say; when a page only had a teaser, say so in the breakdown instead of filling the gap. Keep `<details>` closed by default so the page still scans in a minute.

The TLDR pages are whole newsletter issues: treat each linked item in them as a candidate story under the same relevance rule, and credit "TLDR AI", "TLDR InfoSec" or "TLDR DevOps" alongside the original source they link to. For security items, name what's affected and whether there's a fix. For Reddit, prefer posts with real discussion over memes.

AI Security section rules:
- Include only material AI-security or frontier-lab weirdness from the last 48 hours: vulnerabilities, exploits, jailbreaks, prompt injection or model abuse, privacy incidents, supply-chain risks, safety-control failures, meaningful misuse, or regulatory security actions. Routine AI product news (launches, funding, benchmarks) does not qualify; it can go in the AI section instead.
- For each item give three short parts: what happened, why it matters, and the security or safety lesson. Show the source and its publication date next to the link.
- One entry per story, even when several sources cover it; link the most complete one.
- Use only what the pages actually say. Don't infer unsupported claims, and skip anything you can't date to the last 48 hours.
- If nothing qualifies, show a one-line "Quiet day in AI security" instead of padding the section.
