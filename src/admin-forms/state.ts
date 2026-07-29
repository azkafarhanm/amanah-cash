import { OperatorManagementError } from "@/operators/domain";
import { StudentManagementError } from "@/students/domain";

export type FormStatus = "idle" | "error";

export type OperatorFormValues = Readonly<{
  name: string;
  email: string;
  isActive: boolean;
}>;

export type OperatorFormField = keyof OperatorFormValues;

export type OperatorFormState = Readonly<{
  status: FormStatus;
  message: string | null;
  fieldErrors: Partial<Record<OperatorFormField, string>>;
  values: OperatorFormValues;
}>;

export type StudentFormValues = Readonly<{
  name: string;
  operatorId: string;
  status: string;
  notes: string;
  ownershipTransferReason: string;
}>;

export type StudentFormField = keyof StudentFormValues;

export type StudentFormState = Readonly<{
  status: FormStatus;
  message: string | null;
  fieldErrors: Partial<Record<StudentFormField, string>>;
  values: StudentFormValues;
}>;

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function operatorFormValues(formData: FormData): OperatorFormValues {
  return {
    name: text(formData, "name"),
    email: text(formData, "email"),
    isActive: formData.get("isActive") === "on"
  };
}

export function studentFormValues(formData: FormData): StudentFormValues {
  return {
    name: text(formData, "name"),
    operatorId: text(formData, "operatorId"),
    status: text(formData, "status"),
    notes: text(formData, "notes"),
    ownershipTransferReason: text(formData, "ownershipTransferReason")
  };
}

function operatorErrorField(error: OperatorManagementError): OperatorFormField | null {
  if (error.code === "DUPLICATE_EMAIL" || error.message.includes("Email")) return "email";
  if (error.code === "ASSIGNED_STUDENTS" || error.message.includes("Status")) return "isActive";
  if (error.message.includes("Nama")) return "name";
  return null;
}

export function operatorFormError(
  error: OperatorManagementError,
  values: OperatorFormValues
): OperatorFormState {
  const field = operatorErrorField(error);
  return {
    status: "error",
    message: field ? "Periksa kembali kolom yang ditandai." : error.message,
    fieldErrors: field ? { [field]: error.message } : {},
    values
  };
}

function studentErrorField(error: StudentManagementError): StudentFormField | null {
  if (error.code === "DUPLICATE_NAME" || error.message.includes("Nama")) return "name";
  if (error.message.includes("Catatan")) return "notes";
  if (error.message.includes("Status")) return "status";
  if (error.message.includes("Alasan perpindahan")) return "ownershipTransferReason";
  if (error.code === "INVALID_OPERATOR" || error.message.includes("Operator")) return "operatorId";
  return null;
}

export function studentFormError(
  error: StudentManagementError,
  values: StudentFormValues
): StudentFormState {
  const field = studentErrorField(error);
  return {
    status: "error",
    message: field ? "Periksa kembali kolom yang ditandai." : error.message,
    fieldErrors: field ? { [field]: error.message } : {},
    values
  };
}
