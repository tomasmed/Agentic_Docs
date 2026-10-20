# System Architecture & Modularity Overview — Agentic Docs

> *Note to Developers & Agents: Keep this document updated whenever module boundaries or core data flows change.*

---

## 1. System Context & Purpose

* **High-Level Purpose**: A central repository and living hub for architectural opinions, tactile UI patterns, and system guidelines that Tomas Medina's autonomous AI agents (Antigravity, Cursor, Claude Code) read, cite, and follow during engineering tasks.
* **Target Consumers**:
  * **AI Agents**: Consuming via `/llms.txt`, raw markdown (`/docs/<slug>.md`), or future search/tool endpoints.
  * **Human Engineers**: Exploring opinions and design tokens via high-aesthetic interactive web pages at `/docs/<slug>`.

---

## 2. Directory Layout & Module Responsibilities

```text
src/
├── content/
│   └── docs/          # Domain Content: Pure Markdown opinions, research, and design guidelines
├── content.config.ts  # Domain Schema: Zod validation defining required frontmatter
├── layouts/           # Presentation Chrome: BaseLayout providing atmospheric wrappers and meta tags
├── pages/             # Route Layer (SSG):
│   ├── index.astro    # Hub Landing Page
│   ├── llms.txt.ts    # Build-time compilation of the standard /llms.txt manifest
│   └── docs/
│       ├── [...slug].astro  # Human presentation layer (HTML)
│       └── [...slug].md.ts  # Agent presentation layer (Pristine raw markdown)
├── components/        # Interactive Islands: Svelte 5 components (ThemeToggle, simulators)
└── styles/            # Design System: Tailwind v4 and CSS variables (Mother Color, 70/20/10)
```

### Module Boundary Rules:
1. **Zero-JS Default**: Markdown pages in `src/pages/docs/` compile to static HTML with zero client-side JavaScript.
2. **Island Isolation**: JavaScript is only bundled for client components located in `src/components/`, hydrated via explicit Astro client directives (`client:load`, `client:visible`).
3. **Dual Content Invariance**: The content in `src/content/docs/<slug>.md` must remain the single source of truth; both the HTML reader and the `.md` endpoint derive directly from this content collection without manual duplication.
4. **Schema Discipline**: All documents in `src/content/docs/` must pass the Zod validation schema defined in `src/content.config.ts`.

---

## 3. Technology Stack Summary

* **Runtime & Framework**: Astro 5 (Static Site Generation / Islands Architecture)
* **Interactive UI Layer**: Svelte 5 (Runes `$state`)
* **Styling & Design System**: Tailwind CSS v4 + Custom CSS Design Tokens
* **Language**: TypeScript (Strict Mode)
* **Testing Stack**: Vitest
* **Verification Runner**: Node.js (`scripts/verify.mjs` via `npm run verify`)
* **Deployment Target**: Vercel Edge / Standalone Docker Container
