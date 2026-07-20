# ADR-003 — Financial Data Privacy and Administrative Separation

**Status:** Accepted
**Date:** 2026-07-20
**Owner:** Project Owner

## Context

Amanah Cash manages sensitive financial records. Broad administrative visibility would conflict with the product's trust purpose even when technically convenient.

## Decision

Privacy takes precedence over administrative visibility. The Platform Admin manages the platform, not Operators' financial records.

Users must be able to trust that:

- their managed financial data is private;
- only the responsible Operator can routinely access an assigned Student's financial data; and
- the platform owner or Platform Admin cannot routinely inspect Operator Transaction history, Balances, financial reports, or Student financial data.

Administrative status does not imply financial-data access. Maintenance paths must preserve the same separation and must not introduce an undocumented support or superuser bypass.

## Required Controls

- Deny by default when role, active status, or Student ownership cannot be established.
- Scope authorization on the server for every protected operation.
- Return only data authorized for the current Operator.
- Avoid financial data in authentication sessions, client-readable cookies, logs, analytics, error reports, and administrative screens.
- Treat Student transfer as a controlled ownership change; preserve immutable financial history.
- Review any exceptional-access proposal as a new architecture and privacy decision before implementation.

## Consequences

- Platform maintenance may require privacy-preserving diagnostics rather than direct record inspection.
- Reports are Operator-scoped; platform-wide financial reports are not authorized.
- Backups, operational access, retention, incident response, and legal exceptional access need explicit deployment/security procedures before production.

