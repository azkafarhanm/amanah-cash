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

/*
  Archive and restore land back on the Student's own page either way: after an
  archive that page is the only place showing the Pulihkan button, so an
  accidental archive can be undone in one click without hunting for the filter.
*/
async function changeArchive(studentId: string, archived: boolean) {
  const operator = await authorizeServerAction({ role: "operator" });
  const detail = `/operator/students/${encodeURIComponent(studentId)}`;
  let notice: string;
  try {
    const student = archived
      ? await studentManagement().archiveByOperator(operator.id, studentId)
      : await studentManagement().restoreByOperator(operator.id, studentId);
    notice = archived ? `${student.name} diarsipkan.` : `${student.name} dipulihkan dari arsip.`;
  } catch (error) {
    if (!(error instanceof StudentManagementError)) throw error;
    redirect(`${detail}?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/operator");
  revalidatePath("/operator/students");
  revalidatePath(detail);
  redirect(`${detail}?notice=${encodeURIComponent(notice)}`);
}

export async function archiveOperatorStudentAction(studentId: string) {
  await changeArchive(studentId, true);
}

export async function restoreOperatorStudentAction(studentId: string) {
  await changeArchive(studentId, false);
}
