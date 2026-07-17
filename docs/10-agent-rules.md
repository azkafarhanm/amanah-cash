# Amanah Cash — Agent Rules

**Version:** 1.0
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-03

---

## 1. Purpose

This document defines the operating rules for every AI coding agent working in the Amanah Cash repository. Any agent — OpenCode, Claude Code, Codex, Gemini CLI, or similar — must follow these rules to ensure consistent engineering practices, maintain product quality, and protect the project's architectural integrity.

Following these rules allows any agent to enter this repository without prior chat history, memory, or context and immediately produce work aligned with the project's standards.

---

## 2. Core Philosophy

- **Inspect before act.** Never implement without first understanding the repository, its documentation, and its architectural decisions.
- **Documentation is source of truth.** All product and engineering decisions are recorded in `docs/`. Read them before making any change.
- **Agents are assistants, not authorities.** Every output must be reviewed by a human. Agents propose; humans decide.
- **Scope discipline is non-negotiable.** The MVP is intentionally small. Any suggestion outside scope must be flagged, not implemented.
- **Quality over speed of generation.** Correct, maintainable, well-structured work is the goal — not fast token output.

---

## 3. Agent Responsibilities

1. **Explore thoroughly.** Read repository documentation, existing code, and relevant dependencies before making any change.
2. **Respect product principles.** The 12 principles in `docs/00-product-principles.md` are the immutable foundation of all decisions.
3. **Plan before coding.** Propose an approach and wait for approval before implementation.
4. **Update documentation.** When behavior changes, update all affected documentation.
5. **Maintain the Single Source of Truth.** Financial data must always be derivable from transaction history. Never create redundant or manual balance stores.
6. **Flag scope violations.** If a request contradicts the MVP scope or product principles, raise it immediately.
7. **Test changes.** Verify correctness, run existing tests, and add new tests where appropriate.
8. **Review own output.** Before submitting, review the work for correctness, consistency, and alignment with project standards.

---

## 4. Repository Exploration Rules

1. Always read `docs/00-product-principles.md` and `docs/10-agent-rules.md` at the start of every session.
2. Read `AI_CONTEXT.md` if it exists — it contains session summaries and project state.
3. Before modifying a module, read its source file in full, plus any files it imports.
4. Check `CHANGELOG.md` to understand recent changes and project trajectory.
5. Search for existing patterns before creating new files. Align with established conventions.
6. Verify that the current working tree is clean before starting work. Uncommitted changes may indicate stale context.
7. Read `docs/` directory listings to identify all available documentation.

---

## 5. Planning Rules

1. **Never implement immediately.** Always propose a plan first.
2. State which files will be created, modified, or deleted.
3. Reference the relevant product principle(s) that justify the change.
4. Reference the relevant documentation that the change affects.
5. Estimate whether the change fits within the MVP scope. If uncertain, flag it.
6. Wait for explicit human approval before writing code.
7. If the plan requires architectural decisions, explain the rationale before implementing.

---

## 6. Communication Rules

1. Be concise and direct. Use professional language.
2. When reporting results, include: what was done, what was verified, and what remains.
3. When proposing a change, always include the rationale referencing product principles or documentation.
4. When blocking on a decision, state the options and recommend one.
5. Do not use emojis unless explicitly asked.
6. Avoid unnecessary preamble or postamble. State the answer directly.

---

## 7. Documentation Rules

1. All documentation lives in `docs/`. Use numbered prefixes for ordering.
2. When a behavior changes, update all affected documentation before considering the task done.
3. When adding a feature, check if any existing `docs/` file needs updating or if a new one should be created.
4. `CHANGELOG.md` must be updated whenever user-visible behavior changes.
5. Documentation uses Markdown. Keep a professional, consistent style.
6. Do not create documentation files that duplicate information already captured in another document.

---

## 8. Architecture Rules

1. Always preserve the Single Source of Truth. Balances are computed, never stored.
2. Mobile First. Design data models and APIs for mobile consumption first. Desktop is secondary.
3. Design for PWA delivery. The application must be installable and work within a service worker context.
4. Prefer simplicity over generality. Solve the specific problem. Do not build abstractions for hypothetical future needs.
5. Keep the MVP minimal. If a component, module, or abstraction is not needed for the core workflow, defer it.
6. Every architectural decision must be explainable. If it cannot be justified concisely, reconsider it.
7. Design for offline-readiness at the data layer (even though offline sync is post-MVP), so the transition is smooth when the time comes.

---

## 9. Coding Rules

1. Never generate code without understanding the surrounding modules. Read the file and its imports first.
2. Follow existing code conventions: file naming, component structure, typing style, and import ordering.
3. Never break existing functionality intentionally. If a refactor changes behavior, flag it.
4. Prioritize maintainability over cleverness. Write code that is easy to read and reason about.
5. Do not introduce new dependencies without justification. Every dependency increases maintenance burden.
6. Always handle error states. Every API call, user input, and data transformation must have a fallback.
7. Do not commit secrets, keys, or environment variables. Use environment variable references.
8. Do not add comments unless the code's purpose is not self-evident from the code itself.
9. Never hardcode values that could change per environment or per user configuration.
10. Optimize for Fast Input. Data entry flows must minimize steps, taps, and required fields.

---

## 10. Testing Rules

1. Every new feature must include tests that cover the happy path and at least one error path.
2. Run the full test suite before submitting any change.
3. Do not disable existing tests to make a build pass. Fix the code or flag the broken test.
4. Test on the target device form factor (mobile) first. Desktop testing is secondary.
5. For financial logic, test edge cases: zero values, negative values, overflow, concurrent operations.
6. If no test framework exists yet, document what testing strategy should be adopted before writing code.

---

## 11. UI/UX Rules

### General

- Always think Mobile First. Design for a small screen with touch interaction.
- Optimize for Fast Input. Reduce taps, use smart defaults, and minimize required fields.
- Minimize cognitive load. Present only the information and actions relevant to the current step.
- No distracting effects in operational screens. Productivity first.

### Landing Page / Marketing Site

- Premium SaaS quality.
- Modern and elegant design.
- Smooth, purposeful animations.
- Visual inspiration: Stripe, Linear, Vercel.
- May use Framer Motion for animations.
- May use components from 21st.dev, Magic UI, and Aceternity UI.
- The landing page is a separate experience from the application — animation and visual flair are welcome here.

### Application Dashboard (App)

- Minimal and fast.
- Professional appearance.
- Very low animation — only essential transitions.
- Productivity first. No decorative effects.
- Information density appropriate for operational use.
- Clean typography, clear hierarchy, high contrast.

---

## 12. Git Rules

1. Commit only when explicitly told to by a human.
2. Before committing, inspect `git status`, `git diff`, and recent log to understand the commit context.
3. Stage only the files relevant to the change. Do not commit unrelated files.
4. Write clear, concise commit messages that describe what changed and why.
5. Do not amend pushed commits or force-push unless explicitly instructed.
6. If a commit hook rejects a change, fix the issue and create a new commit. Do not skip hooks.
7. Before creating a pull request, inspect the diff from the base branch and verify the change is complete.

---

## 13. Definition of Done

A task is complete only when all of the following are satisfied:

- [ ] Product Principles (docs/00-product-principles.md) are respected
- [ ] All affected documentation is updated
- [ ] Tests are written and passing
- [ ] No scope creep — only the agreed changes were implemented
- [ ] CHANGELOG.md is updated if user-visible behavior changed
- [ ] Code has been reviewed against the architecture rules in this document
- [ ] All error states are handled
- [ ] The change works on mobile (primary) and desktop (secondary)
- [ ] No secrets, keys, or environment-specific values are committed
- [ ] No unnecessary dependencies were introduced

---

## 14. Forbidden Behaviors

1. **Never implement immediately without reading the repository.**
2. **Never assume requirements.** If a requirement is unclear, ask.
3. **Never invent features.** If a feature is not in the documentation or the human's request, do not add it.
4. **Never suggest or implement features outside the agreed MVP scope.**
5. **Never skip reading existing documentation before making a change.**
6. **Never modify the Single Source of Truth** by storing balances that should be computed from transactions.
7. **Never introduce scope creep** by adding extra fields, buttons, pages, or flows beyond what was requested.
8. **Never disable or skip tests** to push a change through.
9. **Never add comments that state the obvious.** Let the code speak.
10. **Never commit without review.** Always present the diff for human approval first.
11. **Never assume a library is available.** Check `package.json` (or equivalent) before using it.
12. **Never modify `docs/00-product-principles.md`** — it is immutable. Propose changes separately.
13. **Never generate code for a module you have not read.**
14. **Never ignore error handling** for the sake of speed.
