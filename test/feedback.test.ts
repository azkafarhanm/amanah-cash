import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("logout requires confirmation without a redundant success toast", async () => {
  const [logout, login, dataSettings, flashToast] = await Promise.all([
    readFile("src/components/auth/logout-button.tsx", "utf8"),
    readFile("src/app/(auth)/login/page.tsx", "utf8"),
    readFile("src/components/settings/data-settings.tsx", "utf8"),
    readFile("src/components/ui/flash-toast.tsx", "utf8")
  ]);

  assert.match(logout, /ConfirmationDialog/);
  assert.match(logout, /LOGOUT_REDIRECT/);
  assert.doesNotMatch(logout, /LOGOUT_CALLBACK_URL/);
  assert.doesNotMatch(login, /logged-out/);
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

test("only irreversible confirmations are red, and red is a real button variant", async () => {
  const [logout, deleteOperator, dataSettings, dialogSource, dialogStyles, uiStyles] = await Promise.all([
    readFile("src/components/auth/logout-button.tsx", "utf8"),
    readFile("src/components/admin-forms/delete-operator-form.tsx", "utf8"),
    readFile("src/components/settings/data-settings.tsx", "utf8"),
    readFile("src/components/ui/confirmation-dialog.tsx", "utf8"),
    readFile("src/components/ui/confirmation-dialog.module.css", "utf8"),
    readFile("src/components/ui/ui.module.css", "utf8")
  ]);
  const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Logging out is reversible; the two below are not.
  assert.doesNotMatch(logout, /tone="danger"/);
  assert.match(deleteOperator, /tone="danger"/);
  assert.match(dataSettings, /tone="danger"/);

  // The regression this guards: recolouring the label of a teal primary button
  // red measured 1.73:1. Tone must pick a variant whose fill changes with it.
  assert.match(dialogSource, /variant=\{tone === "danger" \? "danger" : "primary"\}/);
  assert.doesNotMatch(withoutComments(dialogStyles), /color-error-foreground/);
  assert.match(withoutComments(uiStyles), /\.buttonDanger\s*\{[^}]*background:\s*var\(--button-danger-background\)/);
});
