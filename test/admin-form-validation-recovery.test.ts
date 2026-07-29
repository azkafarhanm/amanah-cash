import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  operatorFormError,
  operatorFormValues,
  studentFormError,
  studentFormValues
} from "../src/admin-forms/state";
import { OperatorManagementError } from "../src/operators/domain";
import { StudentManagementError } from "../src/students/domain";

function source(path: string) {
  return readFileSync(path, "utf8");
}

test("Operator form recovery preserves submitted values and maps expected field errors", () => {
  const formData = new FormData();
  formData.set("name", "  Siti Aminah  ");
  formData.set("email", "siti@example.com");
  formData.set("isActive", "on");
  const values = operatorFormValues(formData);

  assert.deepEqual(values, {
    name: "  Siti Aminah  ",
    email: "siti@example.com",
    isActive: true
  });

  const duplicate = operatorFormError(
    new OperatorManagementError("DUPLICATE_EMAIL", "Email tersebut sudah terdaftar.", 409),
    values
  );
  assert.equal(duplicate.fieldErrors.email, "Email tersebut sudah terdaftar.");
  assert.deepEqual(duplicate.values, values);

  const assigned = operatorFormError(
    new OperatorManagementError(
      "ASSIGNED_STUDENTS",
      "Operator masih menangani 2 siswa.",
      409
    ),
    values
  );
  assert.equal(assigned.fieldErrors.isActive, "Operator masih menangani 2 siswa.");
});

test("Student form recovery preserves all submitted fields and maps Domain errors", () => {
  const formData = new FormData();
  formData.set("name", "Alya");
  formData.set("operatorId", "operator-2");
  formData.set("status", "INACTIVE");
  formData.set("notes", "Catatan tetap");
  formData.set("ownershipTransferReason", "Rotasi wilayah");
  const values = studentFormValues(formData);

  assert.deepEqual(values, {
    name: "Alya",
    operatorId: "operator-2",
    status: "INACTIVE",
    notes: "Catatan tetap",
    ownershipTransferReason: "Rotasi wilayah"
  });

  const transferReason = studentFormError(
    new StudentManagementError(
      "VALIDATION",
      "Alasan perpindahan Operator wajib diisi.",
      400
    ),
    values
  );
  assert.equal(
    transferReason.fieldErrors.ownershipTransferReason,
    "Alasan perpindahan Operator wajib diisi."
  );
  assert.deepEqual(transferReason.values, values);

  const inactiveOperator = studentFormError(
    new StudentManagementError(
      "INVALID_OPERATOR",
      "Pilih Operator aktif yang masih tersedia.",
      400
    ),
    values
  );
  assert.equal(
    inactiveOperator.fieldErrors.operatorId,
    "Pilih Operator aktif yang masih tersedia."
  );
});

test("Admin forms use local action state, inline associations, focus, and pending protection", () => {
  const operatorForm = source("src/components/admin-forms/operator-form.tsx");
  const studentForm = source("src/components/admin-forms/student-form.tsx");
  const submit = source("src/components/admin-forms/form-submit-button.tsx");

  for (const form of [operatorForm, studentForm]) {
    assert.match(form, /useActionState/);
    assert.match(form, /querySelector<HTMLElement>\('\[aria-invalid="true"\]'\)/);
    assert.match(form, /tabIndex=\{-1\}/);
    assert.match(form, /aria-describedby=/);
    assert.match(form, /aria-invalid=/);
    assert.doesNotMatch(form, /sessionStorage|localStorage|document\.cookie/);
  }

  assert.match(submit, /useFormStatus/);
  assert.match(submit, /disabled=\{disabled \|\| pending\}/);
});

test("create and edit validation errors return state without query-string transport", () => {
  const operatorActions = source(
    "src/app/(app)/(admin)/admin/operators/actions.ts"
  );
  const studentActions = source(
    "src/app/(app)/(admin)/admin/students/actions.ts"
  );

  assert.match(operatorActions, /return operatorFormError\(error, values\)/);
  assert.match(studentActions, /return studentFormError\(error, values\)/);
  assert.doesNotMatch(operatorActions, /operators\/new\?error=/);
  assert.doesNotMatch(studentActions, /students\/new\?error=|\$\{id\}\?error=/);
  assert.match(operatorActions, /\?notice=/);
  assert.match(studentActions, /\?notice=/);
});
