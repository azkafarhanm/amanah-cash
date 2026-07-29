import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentForm } from "@/components/admin-forms/student-form";
import { studentManagement } from "@/students/service";
import { createStudentAction } from "../actions";
import styles from "@/components/students/students.module.css";

export default async function NewStudentPage() {
  const operators = await studentManagement().activeOperators();
  return <ContentWrapper><SectionHeader title="Tambah Siswa" description="Setiap Siswa wajib ditugaskan kepada satu Operator aktif." /><StudentForm action={createStudentAction} initialValues={{ name: "", operatorId: "", status: "ACTIVE", notes: "", ownershipTransferReason: "" }} mode="create" operators={operators} styles={styles} /></ContentWrapper>;
}
