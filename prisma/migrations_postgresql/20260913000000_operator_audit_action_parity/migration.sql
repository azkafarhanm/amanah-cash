-- PostgreSQL integrity parity for operator_audit.action.
--
-- migrations/007_operator_self_provisioning_audit.sql constrains this column to
-- six values on SQLite. 0_init created it as a bare TEXT column and
-- 20260908000000_integrity_guards, whose job was exactly this kind of parity,
-- did not cover it. Production has therefore been the looser of the two targets:
-- a mistyped action is rejected on a developer's machine and accepted silently
-- in the audit trail of record.
--
-- Safe to apply: every existing row was checked before this migration was
-- written, and all of them carry 'STUDENT_CREATE'.

ALTER TABLE "operator_audit"
  ADD CONSTRAINT "ck_operator_audit_action"
  CHECK ("action" IN ('CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED', 'DELETED', 'STUDENT_CREATE'));
