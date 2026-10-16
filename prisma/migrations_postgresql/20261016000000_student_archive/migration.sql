-- Student archive.
--
-- An Operator can archive a Student who has left, which hides them from
-- everyday work without deleting anything: transactions and financial audit
-- events stay append-only, and past reports keep reconciling.
--
-- archived_at records when, for the banner on an archived Student. It may only
-- be set while the Student is ARCHIVED, so the date and the status cannot
-- disagree. Students archived before this migration keep a NULL date, which
-- satisfies the constraint, so existing rows need no backfill.
--
-- operator_audit gains STUDENT_ARCHIVE and STUDENT_RESTORE. The action list
-- must stay identical to migrations/015_student_archive.sql on SQLite.

ALTER TABLE "students" ADD COLUMN "archived_at" TIMESTAMP(3);

ALTER TABLE "students"
  ADD CONSTRAINT "ck_students_archived_at_status"
  CHECK ("archived_at" IS NULL OR "status" = 'ARCHIVED');

ALTER TABLE "operator_audit" DROP CONSTRAINT "ck_operator_audit_action";

ALTER TABLE "operator_audit"
  ADD CONSTRAINT "ck_operator_audit_action"
  CHECK ("action" IN ('CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED', 'DELETED', 'STUDENT_CREATE', 'STUDENT_ARCHIVE', 'STUDENT_RESTORE'));
