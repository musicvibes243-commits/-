# UI/UX Pro Max — installed skill

This repository has the [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
design-intelligence skill installed into `.claude/skills/`, so it loads
automatically for any Claude Code session opened on this repo.

## What is installed

| Skill | Purpose |
| --- | --- |
| `ui-ux-pro-max` | Core design intelligence: searchable styles, palettes, typography, UX guidelines, charts, per-stack rules |
| `design` | Brand identity, design tokens, logo / icon / CIP generation |
| `design-system` | Token architecture (primitive → semantic → component), component specs, slide generation |
| `ui-styling` | shadcn/ui + Tailwind implementation guidance |
| `brand` | Brand voice, messaging frameworks, asset consistency |
| `banner-design` | Social, ad, hero and print banner art direction |
| `slides` | Strategic HTML presentations with Chart.js and design tokens |

Installed with the official CLI:

```bash
npx ui-ux-pro-max-cli@latest init --ai claude
```

## Usage

The skill activates on its own for UI/UX work — just ask, e.g.
"Build a landing page for a SaaS product".

The local database can also be queried directly (Python 3 required, standard
library only — no network access):

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "saas landing page" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system --stack nextjs
```

Domains: `style`, `color`, `chart`, `landing`, `product`, `ux`, `typography`,
`icons`, `gsap`, `react`, `web`, `google-fonts`.

## Updating

```bash
npx ui-ux-pro-max-cli@latest init --ai claude --force
```

Upstream project: MIT licensed, https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
