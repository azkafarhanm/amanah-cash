"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeServerAction } from "@/authorization/actions";
import { StudentManagementError } from "@/students/domain";
import { studentManagement } from "@/students/service";

export async function createOperatorStudentAction(formData: FormData) {
  const operator = await authorizeServerAction({ role: "operator" });
  try {
    const student = await studentManagement().createByOperator(operator.id, {
      name: formData.get("name"),
      kelas: formData.get("kelas"),
      notes: formData.get("notes")
    });
    revalidatePath("/operator/students");
    redirect(`/operator/students/${student.id}?notice=${encodeURIComponent("Siswa berhasil ditambahkan.")}`);
  } catch (error) {
    if (!(error instanceof StudentManagementError)) throw error;
    redirect(`/operator/students?error=${encodeURIComponent(error.message)}`);
  }
}
