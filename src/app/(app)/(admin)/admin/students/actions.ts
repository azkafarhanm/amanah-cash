"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeServerAction } from "@/authorization/actions";
import { StudentManagementError } from "@/students/domain";
import { studentManagement } from "@/students/service";
import {
  studentFormError,
  studentFormValues,
  type StudentFormState
} from "@/admin-forms/state";

export async function createStudentAction(
  _state: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  await authorizeServerAction({ role: "admin" });
  const values = studentFormValues(formData);
  try {
    const student = await studentManagement().create(values);
    revalidatePath("/admin/students");
    redirect(`/admin/students/${student.id}?notice=${encodeURIComponent("Siswa berhasil dibuat.")}`);
  } catch (error) {
    if (!(error instanceof StudentManagementError)) throw error;
    return studentFormError(error, values);
  }
}

export async function editStudentAction(
  id: string,
  _state: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const actor = await authorizeServerAction({ role: "admin" });
  const values = studentFormValues(formData);
  try {
    await studentManagement().edit(id, values, actor.id);
    revalidatePath("/admin/students"); revalidatePath(`/admin/students/${id}`); revalidatePath("/operator/students");
  } catch (error) {
    if (!(error instanceof StudentManagementError)) throw error;
    return studentFormError(error, values);
  }
  redirect(`/admin/students/${id}?notice=${encodeURIComponent("Perubahan dan kepemilikan Siswa disimpan.")}`);
}
