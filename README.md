# 🤖 Agentic Docs

> The single source of truth for architectural opinions, tactile UI design patterns, and engineering principles — built for autonomous AI agents to ingest and human engineers to explore.

[![Deterministic Verification](https://github.com/tomasmed/Agentic_Docs/actions/workflows/ci.yml/badge.svg)](https://github.com/tomasmed/Agentic_Docs/actions)
[![Astro 5](https://img.shields.io/badge/Astro-5.4-BC52EE.svg?logo=astro)](https://astro.build)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00.svg?logo=svelte)](https://svelte.dev)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)

---

## 🌟 The Philosophy: Dual-Persona Documentation

Standard engineering documentation fails in the agentic era for two reasons:
1. **Client-Side Rendering (CSR) breaks agents**: Heavy SPAs deliver empty `div` shells that simple HTTP scrapers cannot read without running full headless browser instances.
2. **Essays vs. Machine Actionability**: Humans want rich narrative metaphors, visual diagrams, and aesthetic depth; LLM agents need concise negative constraints, exact CSS variables, and copyable prompt directives without burning 50,000 tokens of context.

**Agentic Docs solves this with a Dual-Serving Pipeline:**

```
                                 GET /docs/visual-aesthetic
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
            Browser (Accept: text/html)              Agent (Accept: text/markdown or .md)
      ┌───────────────────────────────────┐       ┌───────────────────────────────────────┐
      │         Interactive Reader        │       │           Pristine Markdown           │
      │ • High-aesthetic typography       │       │ • Frontmatter-preserved agent rules   │
      │ • Switchable Creamy / OSL palettes│       │ • Zero HTML tags or hydration scripts │
      │ • Interactive Svelte 5 islands    │       │ • Sub-50ms static edge response       │
      │ • One-click "Copy Prompt" card    │       │ • Indexed automatically in /llms.txt  │
      └───────────────────────────────────┘       └───────────────────────────────────────┘
```

---

## 🎨 Foundational Content: Visual Aesthetic Reference

The founding document ([src/content/docs/visual-aesthetic.md](./src/content/docs/visual-aesthetic.md)) treats digital interface design the same way master miniature painters treat a 32mm miniature primed in matte black:

* **The "Mother Color"**: Every background, elevated card, and inactive border carries a 5–15% atmospheric undertone (warm espresso, moss slate, or midnight petrol). Pure `#000000` and `#ffffff` are strictly forbidden.
* **The 70 / 20 / 10 Value Hierarchy**: 70% dark/receding canvas, 20% readable midtones/containers, and 10% peak focal specular/accents.
* **Glazing Over Wireframes**: Separating containers through 3–6% subtle surface value steps and intentional breathing room rather than harsh 4-sided wireframe borders.
* **Two Signature Archetypes**:
  * **Archetype A: "Super Creamy"**: Matte PBT keycaps, lo-fi stationery, and Unix desktop rices (Mocha, Matcha, Latte, Oat).
  * **Archetype B: "Cyberpunk OSL"**: Wet asphalt reflecting fluorescent light, 3-layer light spill, and tactical HUDs (Over-Volt Blue, Yakuza Purple, Red Dragon, Neon Green).

---

## ⚡ Quick Start & Development

### Prerequisites
* **Node.js**: v22+ (tested on Node v24)
* **npm**: v10+

### Installation & Commands
```bash
# Clone the repository
git clone https://github.com/tomasmed/Agentic_Docs.git
cd Agentic_Docs

# Install dependencies
npm install

# Start local development server (http://localhost:4321)
npm run dev

# Run the 4-phase deterministic verification gate
npm run verify

# Build static production artifacts (HTML + Markdown + /llms.txt)
npm run build
```

---

## 🛡️ Deterministic Verification Gate (`scripts/verify.mjs`)

This repository enforces an inviolable, cross-platform gate executed via `npm run verify` (or `node scripts/verify.mjs`):

```text
=== [ Deterministic Verification Gate (Node.js) ] ===
Platform: win32 | Node: v24.14.0 | Dir: E:\AgenticDocs

[*] Phase 1: Linter & Template Diagnostics... (npx astro check)
✓ Phase 1 passed

[*] Phase 2: Static Type System Validation... (npx tsc --noEmit)
✓ Phase 2 passed

[*] Phase 3: Unit & Regression Tests...       (npx vitest run)
✓ Phase 3 passed

[*] Phase 4: Production Build & Route Gen...  (npx astro build)
✓ Phase 4 passed

--------------------------------------------------
 RESULT: ALL PHASES PASSED
--------------------------------------------------
```

Any code submitted via Pull Request must pass this gate 100% green.

---

## ✍️ Authoring New Opinion Documents

To add a new opinion or research doc:
1. Create a markdown file in `src/content/docs/<slug>.md`.
2. Provide frontmatter matching the schema defined in `src/content.config.ts`:

```yaml
---
title: "Your Opinion Title"
description: "A 1-2 sentence summary of what this document covers."
category: "design" # 'design' | 'architecture' | 'agents' | 'systems'
tags: ["tui", "tokens", "patterns"]
publishedDate: "2026-10-19"
agentRulesSummary: "1. Explicit rule one. 2. Explicit rule two."
---

Your markdown essay and guidelines here...
```

3. Run `npm run verify` to confirm valid types and static route generation.

---

## 📁 Repository Blueprint

```text
├── .agents/                           # Specialized agent persona rubrics
│   ├── bootstrap.md                   # Instructions for the Commit 1 ritual
│   ├── pr-reviewer.md                 # Rules & rubric for PR Review agents
│   ├── code-implementer.md            # TDD & implementation guidelines
│   └── architect.md                   # Architecture & ADR review guidelines
├── docs/
│   ├── adr/                           # Architectural Decision Records (MADR)
│   │   ├── 0001-record-architecture-decisions.md
│   │   ├── 0002-technology-stack.md   # Astro 5 + Svelte 5 + Static Edge
│   │   └── README.md
│   └── architecture/
│       └── overview.md                # System context, module rules, tech stack
├── scripts/
│   ├── verify.mjs                     # Cross-platform Node verification runner
│   ├── verify.ps1                     # PowerShell delegation shim
│   └── verify.sh                      # Bash delegation shim
├── src/
│   ├── components/
│   │   └── ThemeToggle.svelte         # Svelte 5 theme switcher island
│   ├── content/
│   │   └── docs/                      # Research & opinion markdown files
│   │       └── visual-aesthetic.md
│   ├── layouts/
│   │   └── BaseLayout.astro           # Base layout with theme & agent meta tags
│   ├── pages/
│   │   ├── index.astro                # Landing page & console box
│   │   ├── llms.txt.ts                # Auto-generates /llms.txt at build time
│   │   └── docs/
│   │       ├── [...slug].astro        # Interactive reader
│   │       └── [...slug].md.ts        # Raw markdown serving endpoint
│   ├── styles/
│   │   └── global.css                 # Tailwind v4 & tactile/OSL color ramps
│   └── content.config.ts              # Zod collection schema
├── test/
│   └── llms.test.ts                   # Vitest suite
├── AGENTS.md                          # Universal Root Agent Contract (SSOT)
├── CLAUDE.md                          # Claude Code entry point
└── astro.config.mjs                   # Astro configuration with Svelte & Tailwind
```

---

## 🔗 Related Work & Inspirations
* [tomasmed.dev](https://tomasmed.dev) — Personal site & The Bot Wall
* [Centaur Games](https://centaur.tomasmed.dev) — Sovereign Operator Trials
