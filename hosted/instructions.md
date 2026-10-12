## Look: The Context, a gazette

A morning newspaper for one engineer: newspaper serif for reading, gold monospace for the machinery (kickers, dates, versions, meta). The page has a light "ivory" edition and a "night" edition, and the page shell switches between them, so **never write a hex color: use only these CSS variables**, which the shell defines for both editions:

- `var(--bg)` page, `var(--raised)` the rare raised surface, `var(--fg)` ink, `var(--fg2)` body and secondary text, `var(--border)` hairlines.
- `var(--accent)` gold: links, section numbers, small mono labels, the "Full breakdown" summaries, masthead rules.
- `var(--steel)` meta lines, dates, sources. `var(--purple)` version numbers and code.
- `var(--urgent)` the lead's kicker and exploited or urgent kickers; `var(--good)` good-news kickers.
- Status pills (999px radius, small mono text) are the one place with fixed colors: exploited or urgent `#a04540` with `#f5ead0` text; good news `#2d6644` with `#f5ead0` text; anything else is an outlined pill in `var(--border)`.
- Fonts: headlines and body `'Newsreader', 'Iowan Old Style', Georgia, serif`; kickers, labels, dates, meta and versions `'JetBrains Mono', ui-monospace, monospace`. Sizes in rem; body about 1.0625rem, line-height 1.6.
- No gradients, shadows, cards, emoji or decorative color. Structure comes from rules: 1px `var(--border)` between stories, 1px `var(--fg)` under section heads, 3px double `var(--fg)` under the lead and above the footer.

Layout, inside a `max-width: 1200px` centered column with padding `clamp(16px, 3vw, 36px) clamp(16px, 4vw, 44px) 64px`:
- Masthead, centered: a steel uppercase mono date line (weekday, date, build time); then "The Context" in Newsreader 700 italic, `clamp(3.75rem, 12vw, 7.5rem)`, line-height 0.95, letter-spacing -0.03em, color `var(--fg)`; then a row of two gold hairlines with "the gazette of one reader" in small gold mono between them. Put a small mono button reading "Night" with the attribute `data-theme-toggle` at the right end of the date line; the shell makes it work, so give it no onClick and no state.
- Below it a wrapping flex row (gap `36px 48px`): a left rail `<aside>` (`flex: 1 1 240px; min-width: 0`) and the main column (`flex: 999 1 600px; min-width: 0`), so the rail stacks above the stories on a phone.
- Rail, top to bottom: "In this edition" as a `<nav>` of anchor links, one row per section with its two-digit number in steel mono, its name in serif and a story count; then "Patch queue" (name, version in purple mono, one-line note, optional pill); then "Dates" (steel mono date, then the event). Rail headings are small gold uppercase mono labels.
- Main column: the lead story first, the most important item today (usually from AI Security), with a red mono kicker like "03 · AI security · the lead", a headline at `clamp(2rem, 4.4vw, 3.1rem)` weight 700, a steel mono meta line, and its parts as a two-column `<dl>` (gold mono terms). Then each section with an `id` the index links to: a header of gold mono number plus a 700-weight serif title over a 1px `var(--fg)` rule, then its stories in a grid `repeat(auto-fit, minmax(min(300px, 100%), 1fr))` with gap `0 36px`. Each story: optional mono kicker, a 1.4rem weight-600 serif headline, the blurb, a steel mono meta line, then its Full breakdown.
- Footer, after a 3px double rule: "Ops wire" (steel mono time, then the linked item) and "Coverage notes" (feeds that failed or had nothing new, one line each), then a steel mono line "next edition 06:00 · built on the nas".
- It must work at 390px wide: no fixed widths over 360px and no horizontal scrolling.

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

Every story gets a headline and its short blurb, then a native `<details>` element (summary text "Full breakdown", small gold uppercase mono) that opens to the whole story in two to four short paragraphs: what happened, the specifics (versions, numbers, who is affected, dates), why it matters to me, and what to do about it if anything. End it with the source link and date. Use only what the fetched pages say; when a page only had a teaser, say so in the breakdown instead of filling the gap. Keep `<details>` closed by default so the page still scans in a minute.

The TLDR pages are whole newsletter issues: treat each linked item in them as a candidate story under the same relevance rule, and credit "TLDR AI", "TLDR InfoSec" or "TLDR DevOps" alongside the original source they link to. For security items, name what's affected and whether there's a fix. For Reddit, prefer posts with real discussion over memes.

AI Security section rules:
- Include only material AI-security or frontier-lab weirdness from the last 48 hours: vulnerabilities, exploits, jailbreaks, prompt injection or model abuse, privacy incidents, supply-chain risks, safety-control failures, meaningful misuse, or regulatory security actions. Routine AI product news (launches, funding, benchmarks) does not qualify; it can go in the AI section instead.
- For each item give three short parts: what happened, why it matters, and the security or safety lesson. Show the source and its publication date next to the link.
- One entry per story, even when several sources cover it; link the most complete one.
- Use only what the pages actually say. Don't infer unsupported claims, and skip anything you can't date to the last 48 hours.
- If nothing qualifies, show a one-line "Quiet day in AI security" instead of padding the section.
