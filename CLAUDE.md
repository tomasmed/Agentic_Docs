# Claude Code Project Guidelines — Agentic Docs

Agentic Docs is the source-of-truth knowledge base and architectural opinion repository for Tomas Medina's autonomous AI agents and pair-programming workflows.

All operational instructions, guardrails, and commands are maintained in the canonical single source of truth:
👉 [AGENTS.md](./AGENTS.md)

## Core Philosophy & Design Guardrails
- **Dual-Persona Architecture**: Every document serves both humans (high-aesthetic HTML at `/docs/<slug>`) and AI agents (clean markdown at `/docs/<slug>.md` and `/llms.txt`).
- **Aesthetic Pillars**: Strictly follow the visual aesthetic guidelines in `src/content/docs/visual-aesthetic.md`:
  - Establish a shared **Mother Color** (5–15% tint in all neutrals; never pure `#000000` or `#ffffff`).
  - Follow the **70% Shadow / 20% Midtone / 10% Focal Specular** value hierarchy.
  - Layer subtle surface glazes instead of drawing harsh 4-sided wireframe borders.
- **Islands Architecture**: Keep static pages zero-JS by default. Use Svelte 5 (`.svelte` with runes) only for interactive widgets (theme toggles, palette pickers, TUI simulators).
- **Git Branch Protocol**: NEVER push directly to `master`. Always work on a feature branch (`feat/<name>` or `fix/<name>`) and open a Pull Request for human review.

## Deterministic CLI Reference
- **Full Verification Gate**: `npm run verify` (Executes Astro check, TypeScript validation, Vitest suite, and build in one gate)
- **Dev Server**: `npm run dev` (starts on `http://localhost:4321`)
- **Production Build**: `npm run build` (outputs static assets and `/llms.txt` to `dist/`)
- **Run Tests**: `npm test`
- **Lint Check**: `npm run lint`

## Content Authoring
- Add or modify opinion documents in `src/content/docs/<slug>.md`.
- Ensure frontmatter satisfies `src/content.config.ts` (`title`, `description`, `category`, `tags`, `agentRulesSummary`).
