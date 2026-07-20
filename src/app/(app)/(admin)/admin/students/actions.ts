"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeServerAction } from "@/authorization/actions";
import { StudentManagementError } from "@/students/domain";
import { studentManagement } from "@/students/service";

export async function createStudentAction(formData: FormData) {
  await authorizeServerAction({ role: "admin" });
  try {
    const student = await studentManagement().create({ name: formData.get("name"), notes: formData.get("notes"), status: formData.get("status"), operatorId: formData.get("operatorId") });
    revalidatePath("/admin/students");
    redirect(`/admin/students/${student.id}?notice=${encodeURIComponent("Siswa berhasil dibuat.")}`);
  } catch (error) {
    if (!(error instanceof StudentManagementError)) throw error;
    redirect(`/admin/students/new?error=${encodeURIComponent(error.message)}`);
  }
}

export async function editStudentAction(id: string, formData: FormData) {
  await authorizeServerAction({ role: "admin" });
  try {
    await studentManagement().edit(id, { name: formData.get("name"), notes: formData.get("notes"), status: formData.get("status"), operatorId: formData.get("operatorId") });
    revalidatePath("/admin/students"); revalidatePath(`/admin/students/${id}`); revalidatePath("/operator/students");
  } catch (error) {
    if (!(error instanceof StudentManagementError)) throw error;
    redirect(`/admin/students/${id}?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/students/${id}?notice=${encodeURIComponent("Perubahan dan kepemilikan Siswa disimpan.")}`);
}
