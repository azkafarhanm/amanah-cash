# Amanah Cash — Engineering Workflow

**Version:** 1.0
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-03

---

## 1. Purpose

This document defines the mandatory engineering workflow for every task in the Amanah Cash repository. It complements `docs/10-agent-rules.md` by specifying the exact sequence of phases, approval gates, and quality checks an agent must follow from request to completion.

Every AI coding agent — regardless of model — must execute this workflow in order. No phase may be skipped. No gate may be bypassed.

---

## 2. Engineering Philosophy

- **Workflow is law.** The phases exist to protect quality. Skipping a phase creates risk.
- **Gates are checkpoints.** A gate blocks progress until the required quality standard is met.
- **Every phase has an output.** If a phase does not produce a verifiable output, it was not completed.
- **Human approval is explicit.** The agent never assumes approval. It waits.
- **Completion is binary.** A task is either fully complete or incomplete. Partial completion is not acceptable.

---

## 3. Workflow Overview

The following diagram shows the complete workflow from request to completion.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   REQUEST                                                                   │
│       │                                                                     │
│       ▼                                                                     │
│   CONTEXT UNDERSTANDING                                                     │
│       │                                                                     │
│       ▼                                                                     │
│   REPOSITORY EXPLORATION                                                    │
│       │                                                                     │
│       ▼                                                                     │
│   PRODUCT PRINCIPLES CHECK                                                  │
│       │                                                                     │
│       ▼                                                                     │
│   BUSINESS RULES VALIDATION                                                 │
│       │                                                                     │
│       ▼                                                                     │
│   ARCHITECTURE REVIEW                                                       │
│       │                                                                     │
│       ▼                                                                     │
│   PLANNING ──────────────────────────────┐                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   ┌────────────────────┐                 │                                  │
│   │   GATE 1           │                 │                                  │
│   │   Planning         │                 │                                  │
│   │   Approval         │                 │                                  │
│   └────────────────────┘                 │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   ARCHITECTURE DECISIONS                 │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   ┌────────────────────┐                 │                                  │
│   │   GATE 2           │                 │                                  │
│   │   Architecture     │                 │                                  │
│   │   Approval         │                 │                                  │
│   └────────────────────┘                 │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   IMPLEMENTATION                         │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   ┌────────────────────┐                 │                                  │
│   │   GATE 3           │                 │                                  │
│   │   Implementation   │                 │                                  │
│   │   Complete         │                 │                                  │
│   └────────────────────┘                 │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   TESTING                                │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   ┌────────────────────┐                 │                                  │
│   │   GATE 4           │                 │                                  │
│   │   Testing Passed   │                 │                                  │
│   └────────────────────┘                 │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   DOCUMENTATION SYNCHRONIZATION          │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   ┌────────────────────┐                 │                                  │
│   │   GATE 5           │                 │                                  │
│   │   Documentation    │                 │                                  │
│   │   Updated          │                 │                                  │
│   └────────────────────┘                 │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   SELF REVIEW                            │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   GIT REVIEW                             │                                  │
│       │                                  │                                  │
│       ▼                                  │                                  │
│   ┌────────────────────┐                 │                                  │
│   │   GATE 6           │                 │                                  │
│   │   Commit Approval  │◄────────────────┘                                  │
│   └────────────────────┘                                                    │
│       │                                                                     │
│       ▼                                                                     │
│   COMPLETION                                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Workflow

### Phase 1: Request

**Objective:** Receive and understand the human's request.

**Required Actions:**
1. Read the request in full.
2. Identify the type of task: feature, bug fix, refactor, documentation, or configuration.
3. Identify any explicit constraints or conditions stated by the human.

**Expected Output:** A clear understanding of what is being asked, with no ambiguity.

**Completion Criteria:** The agent can restate the request in one sentence.

---

### Phase 2: Context Understanding

**Objective:** Understand the broader context of the request within the project.

**Required Actions:**
1. Read `AI_CONTEXT.md` if it exists.
2. Read `CHANGELOG.md` to understand recent project activity.
3. Identify the current project phase and any recent decisions that may affect the task.

**Expected Output:** An understanding of where the project stands and how the request fits.

**Completion Criteria:** The agent can explain the request's context relative to the current project state.

---

### Phase 3: Repository Exploration

**Objective:** Understand the repository structure, conventions, and existing code before making any change.

**Required Actions:**
1. Read `docs/00-product-principles.md`.
2. Read `docs/10-agent-rules.md`.
3. List and read all relevant `docs/` files.
4. Read the source files that will be affected by the change.
5. Read any files imported by the affected files.
6. Check for existing tests related to the affected area.
7. Verify that the working tree is clean (`git status`).

**Expected Output:** A complete understanding of the codebase area being modified.

**Completion Criteria:** The agent has read every file that will be touched or that imports from a file that will be touched.

---

### Phase 4: Product Principles Check

**Objective:** Validate that the request aligns with the 12 product principles.

**Required Actions:**
1. Check the request against each of the 12 principles in `docs/00-product-principles.md`.
2. If any principle is violated, flag it immediately and halt.
3. Document which principles are relevant to the task.

**Expected Output:** A confirmation that the request respects all product principles, or a flagged violation.

**Completion Criteria:** Every applicable principle has been explicitly checked and confirmed.

---

### Phase 5: Business Rules Validation

**Objective:** Ensure the request does not violate any documented business rules.

**Required Actions:**
1. Read `docs/03-business-rules.md` if it exists.
2. Check the request against all documented business rules.
3. If a business rule is violated, flag it immediately and halt.

**Expected Output:** A confirmation that the request respects all business rules, or a flagged violation.

**Completion Criteria:** Every applicable business rule has been explicitly checked and confirmed.

---

### Phase 6: Architecture Review

**Objective:** Evaluate the architectural impact of the request.

**Required Actions:**
1. Read `docs/08-system-architecture.md` if it exists.
2. Read `docs/07-database-design.md` if it exists.
3. Read `docs/04-domain-model.md` if it exists.
4. Identify whether the change affects the data model, API surface, or component structure.
5. Identify whether the change preserves the Single Source of Truth.

**Expected Output:** An assessment of architectural impact and any required decisions.

**Completion Criteria:** The agent knows whether architectural decisions are needed before proceeding.

---

### Phase 7: Planning

**Objective:** Produce a concrete implementation plan.

**Required Actions:**
1. List every file that will be created, modified, or deleted.
2. For each file, describe the specific change.
3. Reference the product principle(s) that justify each change.
4. Identify any risks, trade-offs, or open questions.
5. Estimate whether the change fits within the MVP scope.

**Expected Output:** A written plan ready for human review.

**Completion Criteria:** The plan is complete, specific, and ready for Gate 1.

---

### Phase 8: Human Approval — Gate 1 (Planning Approval)

**Objective:** Obtain explicit human approval before proceeding.

**Required Actions:**
1. Present the plan to the human.
2. Wait for explicit approval. Do not proceed on assumption.
3. If the human requests changes, return to Phase 7.

**Expected Output:** Human approval of the plan.

**Completion Criteria:** The human has explicitly approved the plan.

---

### Phase 9: Architecture Decisions

**Objective:** Make and document any required architectural decisions.

**Required Actions:**
1. If the plan requires architectural decisions, present them now.
2. Explain the rationale for each decision.
3. Reference relevant product principles and documentation.
4. Wait for explicit human approval of each decision.

**Expected Output:** Documented architectural decisions approved by the human.

**Completion Criteria:** All architectural decisions are resolved and approved.

---

### Phase 10: Human Approval — Gate 2 (Architecture Approval)

**Objective:** Obtain explicit human approval of architectural decisions.

**Required Actions:**
1. Present the architectural decisions to the human.
2. Wait for explicit approval.
3. If the human requests changes, return to Phase 9.

**Expected Output:** Human approval of architectural decisions.

**Completion Criteria:** The human has explicitly approved the architectural decisions.

---

### Phase 11: Implementation

**Objective:** Write the code according to the approved plan.

**Required Actions:**
1. Follow the coding rules in `docs/10-agent-rules.md`.
2. Implement only what was approved in the plan.
3. Handle all error states.
4. Follow existing code conventions.
5. Do not introduce scope creep.

**Expected Output:** Working code that matches the approved plan.

**Completion Criteria:** All files listed in the plan have been created, modified, or deleted as specified.

---

### Phase 12: Human Approval — Gate 3 (Implementation Complete)

**Objective:** Confirm that implementation matches the approved plan.

**Required Actions:**
1. Present a summary of what was implemented.
2. List all files changed.
3. Wait for human confirmation.

**Expected Output:** Human confirmation that implementation is complete.

**Completion Criteria:** The human has confirmed implementation matches the plan.

---

### Phase 13: Testing

**Objective:** Verify that the change works correctly and does not break existing functionality.

**Required Actions:**
1. Run the full test suite.
2. Add new tests for new functionality (happy path + error path).
3. Verify the change on mobile viewport (primary).
4. Verify the change on desktop viewport (secondary).
5. For financial logic, test edge cases: zero, negative, overflow, concurrent.

**Expected Output:** All tests passing, new tests added where required.

**Completion Criteria:** The test suite passes with no failures and no skipped tests.

---

### Phase 14: Human Approval — Gate 4 (Testing Passed)

**Objective:** Confirm that testing is complete and passing.

**Required Actions:**
1. Present test results.
2. List any new tests added.
3. Wait for human confirmation.

**Expected Output:** Human confirmation that testing is satisfactory.

**Completion Criteria:** The human has confirmed testing is complete.

---

### Phase 15: Documentation Synchronization

**Objective:** Update all documentation affected by the change.

**Required Actions:**
1. Follow the documentation synchronization matrix in Section 7 of this document.
2. Update every affected `docs/` file.
3. Update `CHANGELOG.md` if user-visible behavior changed.
4. Verify that no documentation is now inconsistent with the implementation.

**Expected Output:** All documentation accurately reflects the current state of the system.

**Completion Criteria:** Every document identified by the synchronization matrix has been reviewed and updated if needed.

---

### Phase 16: Human Approval — Gate 5 (Documentation Updated)

**Objective:** Confirm that documentation is synchronized.

**Required Actions:**
1. Present a list of all documentation files reviewed and updated.
2. Wait for human confirmation.

**Expected Output:** Human confirmation that documentation is synchronized.

**Completion Criteria:** The human has confirmed documentation is up to date.

---

### Phase 17: Self Review

**Objective:** Review the complete change against quality standards before requesting commit approval.

**Required Actions:**
1. Perform the self-review checklist in Section 8 of this document.
2. Review architecture, readability, maintainability, performance, error handling, product principles, and scope.
3. Document any concerns or findings.

**Expected Output:** A completed self-review with no unresolved concerns.

**Completion Criteria:** Every item on the self-review checklist has been evaluated and passed.

---

### Phase 18: Git Review

**Objective:** Prepare and review the git diff before requesting commit approval.

**Required Actions:**
1. Run `git status` to verify only intended files are staged.
2. Run `git diff` to review the complete change.
3. Verify that no secrets, keys, or environment-specific values are present.
4. Draft a clear, concise commit message.

**Expected Output:** A clean diff and a proposed commit message.

**Completion Criteria:** The diff contains only the intended changes and the commit message is ready.

---

### Phase 19: Human Approval — Gate 6 (Commit Approval)

**Objective:** Obtain explicit human approval to commit.

**Required Actions:**
1. Present the diff and proposed commit message to the human.
2. Wait for explicit approval.
3. If the human requests changes, return to the appropriate phase.

**Expected Output:** Human approval to commit.

**Completion Criteria:** The human has explicitly approved the commit.

---

### Phase 20: Completion

**Objective:** Finalize the task and update project state.

**Required Actions:**
1. Commit the changes with the approved message.
2. Update `AI_CONTEXT.md` with a summary of the completed work.
3. Report completion to the human.

**Expected Output:** A committed change and updated project state.

**Completion Criteria:** All Definition of Workflow Completion criteria (Section 9) are satisfied.

---

## 5. Workflow Gates

Gates are mandatory checkpoints. An agent may not proceed past a gate until the gate has passed.

| Gate | Name | Blocks Until |
|------|------|--------------|
| 1 | Planning Approval | Human approves the implementation plan |
| 2 | Architecture Approval | Human approves all architectural decisions |
| 3 | Implementation Complete | Human confirms implementation matches the plan |
| 4 | Testing Passed | Human confirms all tests pass |
| 5 | Documentation Updated | Human confirms documentation is synchronized |
| 6 | Commit Approval | Human approves the diff and commit message |

**Rules:**
- A gate requires explicit human approval. The agent may not infer approval from silence, context, or previous sessions.
- If a gate fails, the agent must return to the relevant phase, not skip ahead.
- No code may be committed without passing all six gates.

---

## 6. Product Principles Validation

Before implementation, the agent must validate the request against the following principles from `docs/00-product-principles.md`:

| Principle | Validation Question |
|-----------|---------------------|
| Mobile First | Does this change work correctly on a mobile screen with touch interaction? |
| Fast Input | Does this change minimize the number of steps, taps, and fields for the user? |
| Single Source of Truth | Does this change preserve the rule that balances are computed from transactions, never stored? |
| Small MVP | Is this change necessary for the core MVP workflow, or can it be deferred? |
| No Scope Creep | Does this change add anything beyond what was explicitly requested? |
| Minimal Cognitive Load | Does this change keep the interface focused on the current task? |
| Production Ready | Does this change include proper error handling, data integrity, and reliability? |

If any validation fails, the agent must halt and flag the violation before proceeding.

---

## 7. Documentation Synchronization

The following matrix defines which documentation must be checked after a specific type of change.

### Database Changed

| Document | Action |
|----------|--------|
| `docs/07-database-design.md` | Update schema, relationships, and constraints |
| `docs/04-domain-model.md` | Update entity definitions if affected |
| `docs/03-business-rules.md` | Update rules if constraints changed |
| `CHANGELOG.md` | Update if user-visible behavior changed |

### UI Changed

| Document | Action |
|----------|--------|
| `docs/06-wireframe.md` | Update wireframes if layout changed |
| `docs/05-user-flow.md` | Update flow if navigation or steps changed |
| `CHANGELOG.md` | Update if user-visible behavior changed |

### Business Logic Changed

| Document | Action |
|----------|--------|
| `docs/01-functional-requirements.md` | Update if requirements changed |
| `docs/03-business-rules.md` | Update if business rules changed |
| `docs/04-domain-model.md` | Update if domain concepts changed |
| `CHANGELOG.md` | Update if user-visible behavior changed |

### API Changed

| Document | Action |
|----------|--------|
| `docs/08-system-architecture.md` | Update if architecture changed |
| `docs/01-functional-requirements.md` | Update if capabilities changed |
| `CHANGELOG.md` | Update if user-visible behavior changed |

### Configuration Changed

| Document | Action |
|----------|--------|
| `docs/08-system-architecture.md` | Update if infrastructure changed |
| `CHANGELOG.md` | Update if behavior changed |

**Rule:** When in doubt, check every document. It is better to review and confirm no update is needed than to miss a required update.

---

## 8. Self Review

Before requesting commit approval (Gate 6), the agent must review its own work against the following checklist.

### Architecture Review

- [ ] Single Source of Truth is preserved
- [ ] No unnecessary abstractions were introduced
- [ ] The change follows existing architectural patterns
- [ ] No new dependencies were added without justification

### Readability Review

- [ ] Code is easy to read and reason about
- [ ] Naming is clear and consistent with existing conventions
- [ ] No unnecessary comments were added
- [ ] Code structure follows existing patterns

### Maintainability Review

- [ ] The change is easy to modify in the future
- [ ] No hardcoded values that should be configurable
- [ ] No hidden coupling between modules
- [ ] Error states are handled explicitly

### Performance Review

- [ ] No unnecessary re-renders or computations
- [ ] No blocking operations on the main thread
- [ ] Data fetching is efficient and minimal
- [ ] Fast Input principle is respected in UI flows

### Error Handling Review

- [ ] Every API call has error handling
- [ ] Every user input is validated
- [ ] Error messages are clear and actionable
- [ ] No silent failures

### Product Principles Review

- [ ] Mobile First is respected
- [ ] Fast Input is respected
- [ ] Minimal Cognitive Load is respected
- [ ] No scope creep was introduced

### Scope Review

- [ ] Only the approved changes were implemented
- [ ] No extra features, fields, or flows were added
- [ ] No "nice to have" additions were included
- [ ] The change matches the approved plan exactly

---

## 9. Definition of Workflow Completion

The workflow is complete only when all of the following are satisfied:

- [ ] Product Principles (docs/00-product-principles.md) are respected
- [ ] All documentation identified by the synchronization matrix is reviewed and updated
- [ ] All tests are passing (existing + new)
- [ ] No scope creep — only the approved changes were implemented
- [ ] Human has approved the commit (Gate 6 passed)
- [ ] Repository remains consistent — no broken imports, no orphaned files, no stale documentation
- [ ] CHANGELOG.md is updated if user-visible behavior changed
- [ ] AI_CONTEXT.md is updated with a summary of the completed work

**If any criterion is not met, the workflow is not complete.**
