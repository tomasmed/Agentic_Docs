# AGENTS.md — Universal Agent Operating Contract & Repository Guide

> **Note to Agents**: This repository is the Single Source of Truth (SSOT) for instructions. Adhere strictly to the commands, constraints, and workflows outlined below.

---

## 1. Project Status & Technology Stack

* **State**: `INITIALIZED`
* **Ecosystem**: `Astro 5 (TypeScript) + Svelte 5 + Tailwind v4`
* **Primary Language**: `TypeScript`
* **Package / Build Tool**: `npm`
* **Hosting Target**: Vercel Edge / Standalone Docker Container
* **Domain**: `docs.tomasmed.dev`

---

## 2. Deterministic Command Matrix

Agents must **never guess commands**. Use the exact CLI invocations below:

| Action | Command (PowerShell) | Command (Bash / POSIX) | Description |
| :--- | :--- | :--- | :--- |
| **Full Verify** | `npm run verify` | `npm run verify` | **Runs lint + types + tests + build in one gate.** |
| **Dev Server** | `npm run dev` | `npm run dev` | Starts local dev server at `http://localhost:4321` |
| **Build** | `npm run build` | `npm run build` | Compiles static site, `/llms.txt`, and `.md` routes |
| **Test All** | `npm test` | `npm test` | Executes the complete Vitest test suite |
| **Test Single** | `npm test -- <path>` | `npm test -- <path>` | Run a specific test file or filter |
| **Lint Check** | `npm run lint` | `npm run lint` | Runs `astro check` diagnostics without mutating |
| **Format / Fix** | `npm run fix` | `npm run fix` | Runs `astro check` verification |

---

## 3. Inviolable Guardrails

1. **Verify Before Completion**:
   * Never declare a task complete or ask for review without running the **Full Verify** command (`npm run verify`).
   * If verification fails, inspect the stderr, fix the issue, and rerun until 100% green.

2. **No Hallucinated Dependencies**:
   * Do not add external packages or libraries to `package.json` without explicit user consent or an approved Architecture Decision Record in `docs/adr/`.

3. **No Editing Generated / Protected Files**:
   * Do not edit lockfiles (`package-lock.json`) manually.
   * Do not touch build output directories (`dist/`, `.astro/`).

4. **Preserve Architecture & ADRs**:
   * Check `docs/adr/` before introducing any new architectural pattern or external integration.
   * Follow the module boundaries defined in `docs/architecture/overview.md`.

5. **Test Discipline (No Lazy Asserts)**:
   * Unit tests must test genuine business logic and edge cases. Never write trivial asserts like `expect(true).toBe(true)` or empty test stubs to bypass verification gates.

6. **Feature Branches & PR Gate (No Direct Master Pushes)**:
   * **NEVER push commits directly to `master` (or `main`).**
   * All development and agent tasks must occur on a dedicated feature or bugfix branch (e.g. `feat/<name>` or `fix/<name>`).
   * Pushing to remote is allowed only on the feature branch.
   * Work must be submitted via GitHub Pull Request (`gh pr create`) against `master` for human verification and approval prior to merging.

---

## 4. Agentic Docs Domain Rules & Architecture

1. **Dual-Persona Content Serving**:
   * Every research/opinion piece lives in `src/content/docs/<slug>.md`.
   * The system automatically generates both:
     - **Human Reader**: Interactive view with tactile typography at `/docs/<slug>`.
     - **Agent Raw Markdown**: Pristine markdown with preserved YAML frontmatter at `/docs/<slug>.md`.
     - **Agent Discovery Index**: Standardized `/llms.txt` at the root compiled at build time.

2. **Content Collection Schema Enforced**:
   * Every document in `src/content/docs/` must satisfy the Zod schema in `src/content.config.ts`:
     - `title`: Clear human-readable title.
     - `description`: 1–2 sentence summary.
     - `category`: `'design' | 'architecture' | 'agents' | 'systems'`.
     - `tags`: Array of string descriptors.
     - `agentRulesSummary`: Explicit, numbered system directives for LLM consumption.

3. **Visual Aesthetic Guardrails**:
   * Adhere strictly to the design principles established in `src/content/docs/visual-aesthetic.md`:
     - **Mother Color**: Always use a shared 5–15% atmospheric undertone across neutral ramps; never use raw `#000000` or `#ffffff`.
     - **70/20/10 Hierarchy**: 70% dark/receding canvas, 20% readable midtones/containers, 10% peak focal specular/accents.
     - **Glazing over Wireframes**: Separate containers using subtle surface value stepping (3–6%) and breathing room rather than 4-sided wireframe borders.
     - **Directional NMM Contrast**: Differentiate card edges with brighter top/left catch-lights and recessed darker bottoms.

4. **Islands Architecture**:
   * Markdown documentation pages must remain zero-JS static HTML by default.
   * Interactive components (theme switchers, TUI simulators, palette pickers) must be isolated Svelte 5 components using runes (`$state`) and hydrated via `client:load` or `client:visible`.

---

## 5. Spec-Driven Development (SDD) Workflow

For non-trivial features, avoid conversational "vibe coding". Follow the 4-stage pipeline:

```
specs/active/spec.md  ──▶  specs/active/plan.md  ──▶  specs/active/tasks.md  ──▶  Implement & Verify
  (Intent & Rules)           (Architecture/Files)       (Atomic Checklist)          (Deterministic Gate)
```

1. **Specify (`spec.md`)**: Define user stories, functional requirements, and edge cases.
2. **Plan (`plan.md`)**: Outline technical design, files to create/touch, and potential failure modes.
3. **Tasks (`tasks.md`)**: Break the plan into numbered, atomically testable micro-tasks (`[ ] 1. ...`).
4. **Execute**: Work through one task at a time, checking boxes (`[x]`) only after verifying changes with `npm run verify`.

---

## 6. Specialized Agent Personas & In-Repo Delegations

* **PR Review Agent**: See `.agents/pr-reviewer.md` before commenting on pull requests or diffs.
* **Core Coding & TDD Agent**: See `.agents/code-implementer.md` for implementation and test writing rules.
* **Architectural Review Agent**: See `.agents/architect.md` for evaluating structural changes and ADRs.
* **Project Bootstrap Agent**: See `.agents/bootstrap.md` for bootstrap history and stack details.

---

## 7. Commit Style

All git commits must follow the **Conventional Commits** specification:
* `feat(scope): add user authentication endpoint`
* `fix(scope): handle null pointer in payment gateway response`
* `test(scope): add unit tests for discount calculator`
* `refactor(scope): extract token validation to middleware`
* `docs(scope): update ADR 0002 with caching strategy`
