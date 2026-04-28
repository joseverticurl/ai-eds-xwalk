# QA orchestrator artifacts — `youmayalsolike`

This folder follows the layout described in [.cursor/skills/qa-orchestrator/SKILL.md](../../.cursor/skills/qa-orchestrator/SKILL.md).

## What runs locally without MCP

```bash
cd "/Volumes/D Volume/ai-eds-xwalk"
npm test
```

## Full orchestrator (Playwright MCP + defects)

1. Serve or deploy the Edge preview so `base_url` is reachable.
2. Replace `REPLACE_WITH_PREVIEW_URL` in `run-config.json`.
3. Ensure the Playwright MCP server is configured (tools prefixed `browser_`).
4. Run initializer → test-runner → condition-checker → defect-solver → round-controller per `agents/*.md` in the skill.

## Live demo (author preview)

[You may also like — ai-demo-components](https://youmaylike-comp--ai-eds-xwalk--joseverticurl.aem.live/index/ai-demo-components/you-may-also-like)

`run-config.json` → `base_url` is set to this page for orchestrator preflight (`curl` / Playwright entry).

## Manual visual QA (Figma parity)

Compare [Figma Components—TCCC](https://www.figma.com/design/1uWBLEcq2rARuQXFnsqdQD/Components---TCCC) desktop `1:1691` and mobile `1:1703` against the block: section title spacing, 20px card gap, pill badge, card radii (16px / 24px ≥900px), mobile “Read more” row.
