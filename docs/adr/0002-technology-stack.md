# ADR 0002: Adopt Astro 5 (TypeScript), Svelte 5 Islands, and Static Edge Architecture

* **Status**: accepted
* **Deciders**: Tomas Medina & Antigravity Agent
* **Date**: 2026-10-19
* **Technical Story**: Bootstrap Agentic Docs repository for dual human reading and autonomous agent ingestion.

## Context and Problem Statement
The goal is to build an architectural opinion and design system documentation hub for Tomas Medina's autonomous AI agents (such as Antigravity/Cursor/Claude) to reference during engineering workflows, while maintaining high aesthetic readability for humans.
We evaluated stack options including Ruby on Rails, SvelteKit, and Astro 5, considering deployment on Vercel and full containerization.

## Decision Drivers
* **Agentic Discoverability**: First-class support for `/llms.txt`, raw `.md` content-negotiation, and zero-JS static output so AI web scrapers never encounter blank client-side rendering shells.
* **Deterministic Cost & Zero Cold Starts**: Build-time Static Site Generation (SSG) deployed to edge CDN with 0ms cold starts and scale-to-zero economics.
* **Tactile Design & Interactive Islands**: Ability to embed rich interactive components (e.g. Svelte 5 palette toggles, TUI simulators, stencil studio badges) without forcing client-side framework bloat across the rest of the site.
* **Dual Hosting Compatibility**: Zero-config deployment on Vercel Edge with full standalone Docker containerization options.

## Considered Options
* **Option 1: Ruby on Rails 8 (Kamal / Puma)**: Powerful for complex relational models, but poor fit for Vercel edge hosting and excessive operational overhead for content-driven documentation.
* **Option 2: SvelteKit 2 SPA / SSR**: Great UI feel, but SSR incurs serverless cold starts and SPA can hide content from basic agent HTTP crawlers unless pre-rendered.
* **Option 3: Astro 5 with Svelte 5 Islands**: Content collections with Zod validation, zero JavaScript by default, automatic static `.md` and `/llms.txt` compilation, and selective Svelte 5 island hydration.

## Decision Outcome
Chosen option: **Astro 5 (TypeScript) + Svelte 5 Islands + Tailwind CSS v4**.

### Positive Consequences
* Markdown documents in `src/content/docs/` automatically generate both high-aesthetic HTML reading views and clean, frontmatter-preserved raw `.md` agent endpoints.
* `/llms.txt` is dynamically compiled at build time directly from the validated content collections.
* Interactive components like theme toggles and TUI previews leverage Svelte 5 runes (`$state`) in isolated islands.
* Simple `npm run check` deterministic verification runs Astro diagnostics, TypeScript typecheck, and Vitest test suite.

### Negative Consequences / Trade-offs
* Dynamic search API is deferred to a future phase (can be enabled via Astro hybrid SSR on `/api/*` routes when required).

## Links & References
* [AGENTS.md](../../AGENTS.md)
* [Visual Aesthetic Reference](../../src/content/docs/visual-aesthetic.md)
