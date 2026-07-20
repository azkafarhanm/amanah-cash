import { StatusBadge } from "@/components/ui";
import type { StudentStatus } from "@/students/domain";

export const studentStatusLabel: Record<StudentStatus, string> = { ACTIVE: "Aktif", INACTIVE: "Tidak aktif", ARCHIVED: "Diarsipkan" };
export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return <StatusBadge tone={status === "ACTIVE" ? "success" : status === "ARCHIVED" ? "warning" : "neutral"}>{studentStatusLabel[status]}</StatusBadge>;
}
export const studentDate = (value: Date) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value);
