# Amanah Cash — Development Workflow

**Version:** 1.1
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-18

---

## 1. Purpose

This document defines the standard workflow for implementing and reviewing Amanah Cash changes.

## 2. Workflow

```text
Requirement
    ↓
Design
    ↓
Implementation
    ↓
Testing
    ↓
Documentation
    ↓
Review
    ↓
Commit
    ↓
Release
```

Each step must produce enough evidence for the next step. A step may be marked not applicable only with an explicit reason.

## 3. Requirement

1. Identify the requested behavior or engineering change.
2. Reference the applicable FR, NFR, Business Rule, architecture decision, or roadmap milestone.
3. Confirm the work is inside MVP scope.
4. Identify affected documentation and tests.
5. Stop for clarification if the change would alter an approved requirement.

Output: a concise requirement statement and traceability list.

## 4. Design

1. Inspect existing code and approved documentation.
2. Define affected layers and transaction boundaries.
3. Preserve Student aggregate, append-only Transactions, and derived Balance.
4. Prefer the smallest design that satisfies the requirement.
5. Record risks involving money, concurrency, retry, persistence, or migration.

Output: an implementation plan listing files, responsibilities, tests, and documentation impact.

## 5. Implementation

1. Work only within the approved plan.
2. Keep Presentation, Application, Domain, and Persistence responsibilities separate.
3. Implement Domain invariants before presentation integration.
4. Use the database as the authoritative atomicity and integrity boundary.
5. Avoid unrelated refactoring and dependency changes.

Output: a focused working diff.

## 6. Testing

1. Add or update tests that trace to the requirement.
2. Run focused tests while developing.
3. Run the complete applicable test suite before review.
4. Verify financial edge cases and concurrency where relevant.
5. Perform mobile-primary manual verification for UI behavior.

Output: recorded commands, results, and any limitations.

## 7. Documentation

1. Update requirement, design, workflow, or operational documents affected by the implementation.
2. Update `CHANGELOG.md` when appropriate.
3. Treat the `AI_CONTEXT.md` update as the mandatory post-review finalization step defined in Section 8.1.
4. Verify links, requirement IDs, terminology, and cross-document consistency.

Output: documentation included in the same reviewable diff.

## 8. Review

1. Inspect the complete diff.
2. Confirm only intended files changed.
3. Review requirement traceability and architecture alignment.
4. Review financial integrity, failure handling, and scope.
5. Confirm tests and manual checks passed.
6. Resolve every blocking review finding before commit.

Output: an approved diff ready to commit.

## 8.1 Implementation Task Closure

Every implementation task must finish in this order:

```text
Planning
    ↓
Implementation
    ↓
Validation
    ↓
Review
    ↓
Update AI_CONTEXT.md
    ↓
Final Report
```

`AI_CONTEXT.md` is the project handover document, not a changelog. Replace stale state instead of appending task history. Keep it concise and limited to the current milestone, current sprint, active branch, completed work, current architecture decisions, current blockers, and next recommended task.

The final report for every implementation task must include this Closing Checklist:

```text
- [x] Implementation completed
- [x] Validation completed
- [x] Documentation updated (if needed)
- [x] AI_CONTEXT.md updated
- [x] Ready for commit
```

An item may be checked only when its evidence exists. If any item remains unchecked, the task is not closed and the final report must state what remains. The final report must explicitly say `AI_CONTEXT.md has been updated.` When an update is impossible, it must explain why and must not claim the task is complete.

## 9. Commit

Commit only the reviewed change. Do not mix unrelated work.

Commit format:

```text
<type>: <imperative summary>
```

Allowed types:

| Type | Use |
|------|-----|
| `feat` | Approved user-visible capability |
| `fix` | Defect correction |
| `docs` | Documentation-only change |
| `test` | Test-only change |
| `refactor` | Behavior-preserving code structure change |
| `chore` | Tooling or maintenance without product behavior change |

Examples:

```text
feat: add student creation flow
fix: serialize concurrent withdrawals
docs: define transaction retry behavior
```

The summary must describe the reviewed outcome. Reference requirement IDs in the commit body when they materially aid traceability.

## 10. Release

1. Confirm the intended commits are present.
2. Confirm migrations and deployment steps are documented.
3. Run release verification against the selected environment.
4. Confirm PWA, database, and server behavior remain aligned.
5. Update release notes and changelog version information.

Output: a reproducible release with recorded verification.

## 11. Branch Strategy

- Keep the default branch releasable.
- Create one short-lived branch for one coherent change.
- Branch from the current default branch.
- Use a concise branch name such as `feat/student-creation`, `fix/withdrawal-lock`, or `docs/domain-model`.
- Keep commits focused and reviewable.
- Merge only after required checks and review pass.
- Delete the branch after merge.
- Do not maintain long-lived environment or feature branches for the MVP.

## 12. Pull Request Content

Every pull request must include:

- Problem or requirement being addressed.
- Applicable FR, NFR, Business Rule, or architecture references.
- Summary of the design and affected layers.
- Exact scope and explicit exclusions.
- Tests run and results.
- Manual verification performed.
- Documentation changed.
- Risks involving finance, concurrency, retry, or migration.

## 13. Pull Request Checklist

- [ ] Change is authorized by approved documentation.
- [ ] No product feature or business rule was invented.
- [ ] Layer responsibilities are preserved.
- [ ] Balance remains derived from complete Transaction history.
- [ ] Financial history remains append-only.
- [ ] Monetary values remain whole IDR.
- [ ] Withdrawal check and insertion remain atomic.
- [ ] Retry cannot create an unintended duplicate.
- [ ] Validation exists at appropriate boundaries.
- [ ] Errors are explicit and do not expose internals.
- [ ] Relevant automated tests pass.
- [ ] Relevant manual checks pass.
- [ ] Documentation and changelog are synchronized.
- [ ] Diff contains no unrelated changes or secrets.

## 14. Manual Verification Checklist

Apply the items relevant to the change:

- [ ] Create a valid Student.
- [ ] Verify empty, normalized, too-long, and duplicate Student names.
- [ ] Search by partial name with case differences.
- [ ] Record a valid whole-Rupiah Deposit.
- [ ] Verify invalid zero, negative, decimal, non-numeric, and out-of-range Amounts.
- [ ] Record a valid Withdrawal.
- [ ] Verify insufficient Balance creates no Transaction.
- [ ] Confirm Balance equals complete persisted history.
- [ ] Load older history until complete and preserve newest-first order.
- [ ] Verify history-page failure does not alter Balance.
- [ ] Verify Retry does not duplicate a Transaction.
- [ ] Verify network failure does not imply offline persistence.
- [ ] Verify loading, empty, validation, system error, and retry states.
- [ ] Verify browser Back and Cancel behavior.
- [ ] Verify 320px–480px mobile layout and 44px touch targets.
- [ ] Verify tablet and desktop remain usable without new functionality.

## 15. Requirement Traceability

Each change must maintain this chain where applicable:

```text
Requirement ID
  → Business Rule / NFR
  → Domain invariant or architecture responsibility
  → Implementation file
  → Automated test
  → Manual verification
  → Documentation update
```

A pull request must make this chain understandable without relying on undocumented conversation history.

## 16. Definition of Done

A change is done only when:

- Approved scope is fully implemented and no extra scope is present.
- Requirement and architecture traceability is recorded.
- Domain and database invariants remain correct.
- Financial concurrency and retry behavior are safe where applicable.
- Relevant automated tests pass without skipped failures.
- Relevant manual verification passes.
- Mobile-primary behavior is verified for UI changes.
- Error states are explicit.
- Documentation, `AI_CONTEXT.md`, and `CHANGELOG.md` are updated when applicable.
- The implementation-task Closing Checklist is complete and included in the final report.
- Complete diff is reviewed and contains only intended files.
- Commit follows the approved convention.
- Release-impacting changes have reproducible deployment and verification instructions.
