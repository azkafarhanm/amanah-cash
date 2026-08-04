import { Avatar, type AvatarSize } from "@/components/ui";
import styles from "./student-avatar.module.css";
import { studentAvatarBackground, studentInitials } from "./presentation";

export type StudentAvatarSize = "compact" | "list" | "picker" | "dashboard" | "detail";
export type StudentAvatarScope = "admin" | "operator";

const avatarSize: Record<StudentAvatarSize, AvatarSize> = {
  compact: "md",
  list: "studentList",
  picker: "studentList",
  dashboard: "studentDashboard",
  detail: "studentDetail"
};

function photoUrl(input: {
  studentId: string;
  scope: StudentAvatarScope;
  photoObjectKey?: string | null;
  photoUpdatedAt?: Date | string | null;
  size: StudentAvatarSize;
}) {
  if (!input.photoObjectKey || !input.photoUpdatedAt) return null;
  const width = input.size === "compact" ? 64
    : input.size === "list" || input.size === "picker" ? 96
      : 128;
  const version = input.photoUpdatedAt instanceof Date
    ? input.photoUpdatedAt.toISOString()
    : input.photoUpdatedAt;
  return `/api/${input.scope}/students/${encodeURIComponent(input.studentId)}/photo/content?width=${width}&v=${encodeURIComponent(version)}`;
}

export function StudentAvatar({
  studentId,
  name,
  photoObjectKey,
  photoUpdatedAt,
  scope,
  size,
  loading = "lazy"
}: {
  studentId: string;
  name: string;
  photoObjectKey?: string | null;
  photoUpdatedAt?: Date | string | null;
  scope: StudentAvatarScope;
  size: StudentAvatarSize;
  loading?: "eager" | "lazy";
}) {
  return <Avatar
    className={styles.studentAvatar}
    name={name}
    fallback={{ initials: studentInitials(name), background: studentAvatarBackground(name) }}
    photo={photoUrl({ studentId, scope, photoObjectKey, photoUpdatedAt, size })}
    size={avatarSize[size]}
    loading={loading}
  />;
}
