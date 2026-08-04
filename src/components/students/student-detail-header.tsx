import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui";
import type { StudentRecord } from "@/students/domain";
import { StudentAvatar, type StudentAvatarScope } from "./student-avatar";
import styles from "./students.module.css";

export function StudentDetailHeader({
  student,
  scope,
  description,
  action
}: {
  student: StudentRecord;
  scope: StudentAvatarScope;
  description: string;
  action?: ReactNode;
}) {
  return <div className={styles.studentDetailHeader}>
    <StudentAvatar
      studentId={student.id}
      name={student.name}
      photoObjectKey={student.photoObjectKey}
      photoUpdatedAt={student.photoUpdatedAt}
      scope={scope}
      size="detail"
      loading="eager"
    />
    <div className={styles.studentDetailHeaderCopy}>
      <SectionHeader title={student.name} description={description} action={action} />
    </div>
  </div>;
}
