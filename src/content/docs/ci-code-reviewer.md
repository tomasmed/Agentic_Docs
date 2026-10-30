---
title: "CI Code Reviewer: Zero-Noise, Multi-Lens PR Reviews with Bring-Your-Own-Key"
description: "A production guide to deploying an autonomous, fail-open AI code reviewer in GitHub Actions using LiteLLM, in-repo architectural lenses, and your own secret keys."
category: "agents"
tags: ["agents", "ci-cd", "github-actions", "code-review", "byok", "litellm", "sub-agents", "security"]
publishedDate: "2026-10-29"
agentRulesSummary: "1. Fail-open stance: Never exit non-zero on LLM provider outages (429/404/500); emit diagnostic comments instead of blocking CI builds. 2. Sub-agent review lenses: Decompose PR evaluation into distinct passes (ADRs, security, anti-lazy-assert, touch ergonomics) with scoped file patterns and in-repo context. 3. BYOK LiteLLM model syntax: Always prepend provider prefix (e.g. gemini/gemini-3.8-flash, anthropic/claude-3-5-sonnet-20241022). 4. Anti-lazy-assert discipline: Reject hollow assertions (assert True, empty mocks, deleted tests) as review blockers. 5. In-repo configuration: Keep .ci-reviewer.yml version-controlled in repository root for transparent developer overrides."
---

> An open-source, agentic code reviewer that plugs directly into **GitHub Actions**, CI/CD pipelines, and local developer workflows. Built on a pluggable agent harness supporting **Native LiteLLM**, **AWS Strands**, and **Microsoft Agent Framework**, it enables **Bring Your Own Key (BYOK)** across 100+ commercial and local AI models with zero vendor lock-in.

---

## 1. The Core Problem with Naive AI Reviewers

Most automated code review tools and first-generation AI review bots fail in engineering teams for three predictable reasons:

1. **The "Linter with an LLM" Noise Problem**: They spend token budgets lecturing developers about indentation, import ordering, or bracket styling—concerns that deterministic tools like `ruff`, `biome`, or `prettier` already resolve in milliseconds.
2. **SaaS Vendor Lock-in & Runaway Bills**: Commercial AI review platforms charge steep monthly per-seat fees, route your proprietary source code through closed intermediate servers, and hide the prompt harness inside a black box.
3. **The Red-Build Blocker Dilemma**: When third-party LLM APIs hit temporary rate limits (HTTP 429), snapshot deprecations (HTTP 404), or transient gateway errors (HTTP 502/503), naive CI actions exit with a fatal status code, stopping merge queues and blocking developers from shipping urgent fixes.

[`ci-code-reviewer`](https://github.com/tomasmed/ci-code-reviewer) was engineered from the ground up to reverse these anti-patterns through a few core principles:

* **High-Signal, Zero-Noise Triage**: Focus strictly on logic bugs, security/OWASP vulnerabilities, architectural drift against in-repo ADRs, and test suite integrity.
* **Bring Your Own Key (BYOK)**: Connect directly to your existing API keys (Google AI Studio, Anthropic, OpenAI, AWS Bedrock) or run air-gapped models locally via Ollama with no middleman.
* **Specialized Review Lenses**: Instead of dumping an entire diff into a single monolithic prompt, decompose the review into focused sub-agent turns (e.g., AppSec, ADR conformance, mobile ergonomics).
* **Deterministic Fail-Open Stance**: CI jobs complete cleanly with exit code `0` even if upstream LLM APIs degrade, reporting exact diagnostic failure details in PR comments rather than holding releases hostage.

```
                               Pull Request Event
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │     GitHub Ingestion Engine       │
                     │  - Fetch PR Diff & Metadata       │
                     │  - Filter ignored files & hunks   │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │     Context Aggregator Layer      │
                     │  - In-repo ADRs (docs/adr/)       │
                     │  - AGENTS.md / Architecture Specs │
                     │  - Repo rules (.ci-reviewer.yml)  │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │       Review Agent Harness        │
                     │  - Native LiteLLM / AWS Strands   │
                     │  - Sub-Agent Specialized Lenses   │
                     │  - Anti-Lazy-Assert Audit         │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │     GitHub API Publisher Layer    │
                     │  - PR Top-level Markdown Review   │
                     │  - Inline Line-Specific Comments  │
                     └───────────────────────────────────┘
```

---

## 2. Step-by-Step Setup: GitHub Actions with Your Secret Keys

Integrating `ci-code-reviewer` into any public or private GitHub repository takes under five minutes.

### Step 1: Add Your Secret Keys to GitHub Repository Settings

You do not need to purchase any seat or sign up for a third-party service. Simply store the API key for your chosen model provider in your GitHub repository secrets:

1. Navigate to your repository on GitHub: `https://github.com/<owner>/<repo>`.
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Under **Repository secrets**, click **New repository secret**.
4. Add the appropriate secret depending on your preferred provider:
   * **Google AI Studio**: Name: `GEMINI_API_KEY` (Free tier or pay-per-token API key from [Google AI Studio](https://aistudio.google.com/)).
   * **Anthropic**: Name: `ANTHROPIC_API_KEY` (From [Anthropic Console](https://console.anthropic.com/)).
   * **OpenAI**: Name: `OPENAI_API_KEY` (From [OpenAI Platform](https://platform.openai.com/)).

> [!NOTE]
> `GITHUB_TOKEN` is automatically provisioned by GitHub Actions for every workflow run. You do **not** need to generate a Personal Access Token (PAT) unless you want the reviewer bot to trigger secondary workflow events that standard tokens omit.

---

### Step 2: Create the Workflow File

Create `.github/workflows/code-review.yml` in your repository:

```yaml
name: Automated Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true

jobs:
  review:
    name: CI Code Reviewer
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run CI Code Reviewer
        uses: tomasmed/ci-code-reviewer@v1
        with:
          model: "gemini/gemini-3.8-flash"
          github_token: ${{ secrets.GITHUB_TOKEN }}
          config_path: ".ci-reviewer.yml"
          harness: "native"
        env:
          # Forward whichever API key matches your configured model
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

#### Why Concurrency Cancellation Matters
Notice the `concurrency` block:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true
```
When a developer pushes multiple commits in rapid succession to the same PR branch, `cancel-in-progress: true` immediately aborts the superseded review jobs. This prevents wasted LLM token usage and prevents noisy, outdated comments on older commits.

---

### Step 3: LiteLLM Model String Syntax & Routing Rules

`ci-code-reviewer` delegates LLM provider abstraction to **LiteLLM**. To ensure requests reach the expected endpoint, format model strings using the exact provider prefixes below:

| Provider | Model Identifier Format | Required Env Var | Notes & Routing Behavior |
| :--- | :--- | :--- | :--- |
| **Google AI Studio** | `gemini/gemini-3.8-flash`<br>`gemini/gemini-2.0-flash` | `GEMINI_API_KEY` | **Crucial:** Must include the `gemini/` prefix. |
| **Anthropic** | `anthropic/claude-3-5-sonnet-20241022` | `ANTHROPIC_API_KEY` | Highest reasoning fidelity for architectural ADR conformance. |
| **OpenAI** | `openai/gpt-4o`<br>`openai/gpt-4o-mini` | `OPENAI_API_KEY` | High-throughput structured review evaluation. |
| **Ollama (Self-Hosted)** | `ollama/qwen2.5-coder:7b` | _None_ | Configure `api_base: "http://your-runner-ip:11434"` in `.ci-reviewer.yml`. |

> [!WARNING]
> **The Gemini 404 Gotcha**: In LiteLLM, specifying `gemini-3.8-flash` or `gemini-2.0-flash` **without** the `gemini/` prefix routes the request to Google Cloud Vertex AI (which requires Google Cloud service account JSON credentials). If you are using a standard API key from Google AI Studio, omitting the prefix results in a confusing `NotFoundError: 404`. Always format as: `gemini/gemini-3.8-flash`.

---

## 3. In-Repo Configuration (`.ci-reviewer.yml`)

Create a `.ci-reviewer.yml` file in your repository root to configure ignored files, general rules, PR voting policies, and specialized review lenses:

```yaml
version: "1"

# Target LLM (LiteLLM notation)
model: "gemini/gemini-3.8-flash"

# Agent harness: "native" (fastest, lightweight) or "strands" (AWS Strands with MCP)
harness: "native"

filters:
  ignore_patterns:
    - "**/*.lock"
    - "**/package-lock.json"
    - "**/pnpm-lock.yaml"
    - "**/uv.lock"
    - "**/dist/**"
    - "**/build/**"
    - "**/*.min.js"
    - "**/coverage/**"
  max_diff_lines: 3000

rules:
  # Flag PRs that add complex logic without corresponding tests
  require_tests: true

  # Check for OWASP Top 10 vulnerabilities and hardcoded secrets
  check_security: true

  # Cross-reference with in-repo docs/adr/ and architecture rules
  check_architecture: true

  # Custom guidelines specific to your repository
  custom_guidelines:
    - "Ensure all database queries use parameterized prepared statements."
    - "Public API endpoints must validate request payloads using Zod or Pydantic."

voting:
  # Starts in safe advisory COMMENT mode
  # Set enabled to true if you want the bot to cast official APPROVE or REQUEST_CHANGES reviews
  enabled: false
  allow_approve: true
  allow_request_changes: true
```

---

## 4. Production Case Study: How JlightCalendar Uses It

A prime example of `ci-code-reviewer` in action is [`JlightCalendar`](https://github.com/tomasmed/JlightCalendar)—a full-stack family calendar and ambient wall-kiosk platform. 

JlightCalendar operates under strict domain constraints:
* It runs on wall-mounted touchscreens where small buttons cause frustrating mis-taps.
* It must display cleanly on compact mobile viewports (360px–412px) without horizontal scroll blowout.
* It handles multi-tenant family privacy ("galaxy" isolation).
* Calendar events must strictly avoid UTC drift from naive `.toISOString()` parsing.

Instead of expecting a general LLM prompt to remember all of these nuances, JlightCalendar uses **Review Lenses** to spawn specialized sub-agent turns with targeted in-repo context files:

```yaml
# Extract from JlightCalendar's .ci-reviewer.yml
lenses:
  # 1. Architecture & ADR Conformance Lens
  - name: "architecture_adrs"
    description: "Evaluates changes against in-repo ADRs and module boundaries."
    prompt: |
      You are an expert Software Architect sub-agent.
      Evaluate the git diff strictly through the lens of architectural integrity and in-repo ADRs:
      1. Cross-reference changes with Architecture Decision Records in docs/adr/.
      2. Verify module boundary separation (UI layer never calling database directly).
      3. Flag prohibited new external dependencies as critical blockers.
    context_files:
      - "docs/adr/*.md"
      - "docs/specs/*.md"
      - "AGENTS.md"
    file_patterns: []
    blocking: true
    enabled: true

  # 2. Security & Multi-Tenant Isolation Lens
  - name: "security_owasp"
    description: "Audits diff for OWASP vulnerabilities, secret leaks, and data isolation."
    prompt: |
      You are an expert Application Security (AppSec) sub-agent.
      Audit the git diff strictly for security flaws:
      1. Check for hardcoded credentials, API keys, or private tokens.
      2. Look for injection risks (SQL, shell commands, XSS, SSRF).
      3. Ensure multi-tenant galaxy isolation is strictly maintained across queries.
    context_files:
      - "docs/adr/0007-multi-galaxy-domain-model-and-auth.md"
      - "docs/adr/0009-galaxy-privacy-and-join-codes.md"
    file_patterns: []
    blocking: true
    enabled: true

  # 3. Test Integrity & Anti-Lazy-Assert Lens
  - name: "test_integrity"
    description: "Scrutinizes test modifications and enforces anti-lazy-assert discipline."
    prompt: |
      You are an expert QA and Test Integrity sub-agent.
      Audit test code in this git diff:
      1. Anti-Lazy-Assert: Flag hollow assertions (e.g. 'assert True', trivial identity checks, empty test stubs).
      2. Over-Mocking: Flag tests that mock out everything and test none of the real domain logic.
      3. Coverage Quality: Ensure tests verify actual edge cases and failure modes.
    context_files:
      - "tests/unit.test.ts"
      - "tests/system.test.ts"
      - "AGENTS.md"
    file_patterns:
      - "tests/**"
      - "src/**"
    blocking: true
    enabled: true

  # 4. Small Device UI/UX & Kiosk Ergonomics Lens
  - name: "small_device_ui_ux"
    description: "Audits touch targets and responsive layouts for mobile and touch kiosks."
    prompt: |
      You are a Lead UI/UX Designer and Mobile Interaction Specialist sub-agent.
      Audit every front-end change with extreme scrutiny from the perspective of small mobile devices (360px–412px) and wall-mounted touch kiosks:
      1. Touch Targets: Are all interactive elements at least 48px x 48px with 8px breathing room?
      2. Viewport Overflow: Are there hardcoded widths (e.g. w-[500px]) that cause horizontal scroll on phones?
      3. Touch Gestures: Ensure swipe handlers don't hijack native scrolling, and critical actions don't rely on desktop hover states.
    context_files:
      - "docs/adr/0003-display-hygiene-and-kiosk.md"
      - "docs/adr/0013-recurring-events-and-mobile-touch-ux.md"
    file_patterns:
      - "src/components/**"
      - "src/app/**"
      - "src/styles/**"
    blocking: true
    enabled: true
```

### Why Scoped File Patterns Matter
Notice `file_patterns` on the `small_device_ui_ux` lens:
```yaml
file_patterns:
  - "src/components/**"
  - "src/app/**"
  - "src/styles/**"
```
If a pull request only modifies backend database migrations in `drizzle/` or server-side utility functions in `lib/`, the `small_device_ui_ux` sub-agent **does not run at all**. This saves significant LLM token costs, reduces execution latency, and ensures PR comments remain 100% relevant to the touched code.

---

## 5. Dogfooding: How `ci-code-reviewer` Reviews Itself

A key indicator of reliable developer tooling is self-dogfooding. The [`ci-code-reviewer`](https://github.com/tomasmed/ci-code-reviewer) repository reviews every single one of its own pull requests using its own codebase.

In `.github/workflows/review.yml`:

```yaml
name: Dogfood Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    name: Agentic Code Review (Dogfood)
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install uv
        uses: astral-sh/setup-uv@v5
        with:
          enable-cache: true

      - name: Set up Python
        run: uv python install 3.12

      - name: Install dependencies
        run: uv sync --extra dev

      - name: Run CI Code Reviewer (Dogfood)
        run: |
          uv run ci-code-reviewer review \
            --pr "${{ github.event.pull_request.number }}" \
            --config ".ci-reviewer.yml"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

### What the Dogfooding Harness Catches
In `ci-code-reviewer`'s own `.ci-reviewer.yml`, the dogfooding lenses enforce:
1. **Strict Layering**: Verification that `src/config/`, `src/models/`, `src/harness/`, and `src/providers/` maintain pure dependency boundaries with no circular imports.
2. **Fail-Open Implementation**: Auditing that provider error handlers always catch HTTP 4xx/5xx exceptions and return degraded review objects rather than throwing unhandled exceptions.
3. **Anti-Lazy-Assert Test Integrity**: Flagging any test additions that resort to empty stubs or vacuous `assert True` checks to artificially inflate line coverage.

---

## 6. Local Developer Workflow (CLI & Pre-PR Review)

Developers don't need to wait for GitHub Actions to get AI feedback. `ci-code-reviewer` can be run directly from the command line using [`uvx`](https://docs.astral.sh/uv/):

```bash
# Review a local git diff against main before opening a PR
git diff origin/main...HEAD > feature.diff
uvx ci-code-reviewer review --diff-file feature.diff --model gemini/gemini-3.8-flash

# Review an existing GitHub PR in dry-run mode (outputs findings to terminal without commenting)
uvx ci-code-reviewer review --pr 42 --dry-run
```

This allows engineers to catch architectural regressions, security oversights, and missing edge-case tests locally before requesting human peer review.

---

## 7. The Fail-Open Philosophy: Why Red Builds are the Enemy

Traditional CI linters and test runners are designed to fail closed: if a test fails, the build turns red and stops.

AI reviewers, however, rely on network calls to probabilistic external endpoints. If an AI reviewer fails closed:
* A transient Cloudflare hiccup at an AI provider turns an otherwise perfect PR red.
* Developers become blocked from merging critical production hotfixes.
* Engineers lose trust in the tool and disable it entirely.

`ci-code-reviewer` adopts a strict **Fail-Open Stance** ([ADR 0003](https://github.com/tomasmed/ci-code-reviewer/blob/master/docs/adr/0003-fail-open-stance-and-degraded-provider-fallback.md)):

```
┌────────────────────────────────────────────────────────┐
│  Provider Call Encountered Error: 429 Too Many Requests│
│  Degraded Mode: Fallback Active                        │
├────────────────────────────────────────────────────────┤
│  ✓ CI Action exits with status code 0 (Build stays green)│
│  ℹ Exact diagnostic logged in PR summary table          │
│  ⚠ Human reviewers alerted to inspect PR manually       │
└────────────────────────────────────────────────────────┘
```

The workflow exits code `0`, preserving developer velocity while transparently documenting the provider issue in the PR discussion.

---

## 8. Summary & Directives for Synthetic Agents

When an autonomous coding agent (Cursor, Claude Code, Antigravity) is instructed to set up automated code reviews for a repository:

1. **Check Prerequisites**: Ensure the repository has test suites and clear architectural guidelines (`AGENTS.md` or `docs/adr/`).
2. **Provision `.github/workflows/code-review.yml`**: Ensure `permissions: { contents: read, pull-requests: write }` and `concurrency` cancellation are configured.
3. **Draft `.ci-reviewer.yml`**: Tailor file ignore patterns to the repository's tech stack (lockfiles, generated code) and define domain-specific sub-agent lenses.
4. **Enforce LiteLLM Provider Prefixes**: Never output bare model names like `gemini-3.8-flash`; always prefix with `gemini/`, `anthropic/`, or `openai/`.
5. **Verify Fail-Open Semantics**: Never configure custom scripts that convert advisory LLM review comments into fatal pipeline crashes.
