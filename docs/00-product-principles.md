# Amanah Cash — Product Principles

**Version:** 1.1
**Status:** Approved
**Owner:** Project Owner
**Last Updated:** 2026-07-20

---

This document defines the core principles that guide every product decision in Amanah Cash. These principles are non-negotiable and serve as the foundation for design, development, and scope management.

---

## 1. Mobile First

**Description:** The application is designed, built, and optimized for mobile devices before any other form factor. Every screen, interaction, and workflow must perform flawlessly on a smartphone.

**Rationale:** The primary users operate in environments where mobile is the only available device. Designing for mobile first ensures the core experience is never compromised by adapting a desktop-centric layout. It also enforces discipline in information density and interaction design.

---

## 2. Progressive Web App (PWA)

**Description:** Amanah Cash is delivered as a Progressive Web App. It must be installable and feel native on the user's device without requiring an app store listing.

**Rationale:** A PWA eliminates friction in distribution and updates. Users access the latest version immediately. The PWA model keeps maintenance overhead low while providing a near-native experience. Offline capability is not part of the MVP and will only be considered in a future version if real operational needs justify the additional complexity.

---

## 3. Speed of Operation

**Description:** Every workflow is optimized to require the fewest possible steps, taps, and seconds to complete. Latency, loading spinners, and unnecessary confirmations are treated as defects.

**Rationale:** Operational speed is the primary value proposition. In high-volume or time-sensitive scenarios, each unnecessary second compounds into significant productivity loss. Fast interactions build user trust and drive adoption.

---

## 4. Fast Input

**Description:** Every frequent operation should require the fewest possible interactions. The application must optimize repetitive daily operations such as searching a student, recording deposits, and recording withdrawals.

**Rationale:** Amanah Cash is an operational tool. Users should be able to complete common financial transactions in just a few seconds with minimal taps or clicks.

---

## 5. Single Source of Truth

**Description:** Financial state changes through one atomic Transaction Engine. The current Balance is persisted on the Student for operational reads, while every committed mutation updates the Transaction, Student Balance, and immutable financial audit evidence together. Balance must always equal the effects of active Transactions and is never edited independently.

**Rationale:** Persisting Balance improves operational and future reporting reads, but it is safe only when the Transaction set, Balance, and audit evidence share one atomic consistency boundary. Reconciliation can reproduce Balance from active Transactions, and immutable audit events explain every create, edit, delete, restore, and ownership transfer.

---

## 6. Intentionally Small MVP Scope

**Description:** The MVP includes only the features required to validate the core workflow. Anything that is not essential for day-one operation is explicitly excluded and deferred to future iterations.

**Rationale:** A small scope accelerates time to market, reduces the surface area for bugs, and allows the team to gather real user feedback before investing in additional features. Scope discipline is a competitive advantage.

---

## 7. No Scope Creep

**Description:** Features, integrations, or design embellishments that are not part of the agreed MVP scope will not be introduced. Requests are documented and evaluated for future releases only.

**Rationale:** Uncontrolled scope is the most common cause of project failure. By holding a strict boundary on what is in scope, the team maintains focus, delivers on schedule, and avoids the cost of half-built features.

---

## 8. Simplicity Over Generality

**Description:** The system is designed to solve the specific problem well, not to be a general-purpose platform. Abstractions and generalizations are introduced only when there is a concrete, immediate need.

**Rationale:** Premature generalization adds complexity without value. A focused solution is easier to build, test, understand, and maintain. Generality is earned through real usage patterns, not anticipated ones.

---

## 9. Minimal Data Collection

**Description:** The system collects only data that has direct operational value. Every stored field must have a clear business purpose.

**Rationale:** Collecting unnecessary data increases complexity, slows down workflows, and creates unnecessary maintenance. Simplicity improves usability.

---

## 10. Trust by Design

**Description:** Every transaction, edit, soft delete, restore, ownership transfer, state change, and user action must be transparent, attributable, auditable, and unambiguous. The system never performs hidden actions or presents unclear states. Every Balance must be explainable by active Transactions and immutable audit evidence.

**Rationale:** The product name, Amanah, embodies trust. Users must have complete confidence that the system behaves predictably and that every action is accounted for. In a financial system, trust is built on the guarantee that any balance can be traced back to its underlying transactions. Trust is not a feature; it is the foundation.

---

## 11. Minimal Cognitive Load

**Description:** The interface presents only the information and actions relevant to the current step. Users are never overwhelmed with options, settings, or data that do not apply to their immediate task.

**Rationale:** Cognitive load directly impacts speed and accuracy. A clean, focused interface reduces errors, shortens training time, and enables users to complete tasks with confidence.

---

## 12. Production Ready from Day One

**Description:** The MVP is not a prototype. It is built with production standards: proper error handling, data integrity, reliability, and maintainability from the first commit.

**Rationale:** Shipping a prototype as an MVP creates technical debt that is expensive to remediate and erodes user trust. Production-ready code is an investment that pays for itself in reliability and long-term maintainability. This does not imply enterprise-scale complexity; it means the system does what it claims to do, correctly and consistently.

---

## Summary

| # | Principle | Core Focus |
|---|-----------|------------|
| 1 | Mobile First | Device priority |
| 2 | PWA | Delivery model |
| 3 | Speed of Operation | Performance |
| 4 | Fast Input | Interaction efficiency |
| 5 | Single Source of Truth | Data integrity |
| 6 | Small MVP Scope | Scope control |
| 7 | No Scope Creep | Discipline |
| 8 | Simplicity Over Generality | Architecture |
| 9 | Minimal Data Collection | Data discipline |
| 10 | Trust by Design | Integrity |
| 11 | Minimal Cognitive Load | Usability |
| 12 | Production Ready from Day One | Quality |

These principles are the lens through which every product and engineering decision is evaluated. If a proposal does not align with these principles, it is out of scope.
