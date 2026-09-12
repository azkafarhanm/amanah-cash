import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("logout and restore expose a post-session success notice", async () => {
  const [logout, login, dataSettings, flashToast] = await Promise.all([
    readFile("src/components/auth/logout-button.tsx", "utf8"),
    readFile("src/app/(auth)/login/page.tsx", "utf8"),
    readFile("src/components/settings/data-settings.tsx", "utf8"),
    readFile("src/components/ui/flash-toast.tsx", "utf8")
  ]);

  assert.match(logout, /LOGOUT_CALLBACK_URL/);
  assert.match(login, /FlashToast/);
  assert.match(login, /logged-out/);
  assert.match(dataSettings, /RESTORE_CALLBACK_URL/);
  assert.doesNotMatch(dataSettings, /window\.confirm/);
  assert.match(flashToast, /toastContainer/);
});

test("student mutations expose completion feedback at their destination", async () => {
  const [createModal, operatorDetail] = await Promise.all([
    readFile("src/components/students/create-student-modal.tsx", "utf8"),
    readFile("src/app/(app)/(operator)/operator/students/[id]/page.tsx", "utf8")
  ]);

  assert.match(createModal, /useToast/);
  assert.match(createModal, /toast\.success/);
  assert.match(operatorDetail, /query\.notice/);
  assert.match(operatorDetail, /query\.error/);
});

test("destructive actions use the shared confirmation dialog", async () => {
  const [deleteOperator, dataSettings, confirmationDialog] = await Promise.all([
    readFile("src/components/admin-forms/delete-operator-form.tsx", "utf8"),
    readFile("src/components/settings/data-settings.tsx", "utf8"),
    readFile("src/components/ui/confirmation-dialog.tsx", "utf8")
  ]);

  assert.match(deleteOperator, /ConfirmationDialog/);
  assert.doesNotMatch(deleteOperator, /window\.confirm/);
  assert.match(dataSettings, /ConfirmationDialog/);
  assert.match(confirmationDialog, /role|aria-labelledby/);
  assert.match(confirmationDialog, /Batal/);
});
