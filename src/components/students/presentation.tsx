import { StatusBadge } from "@/components/ui";
import type { StudentStatus } from "@/students/domain";

export const studentStatusLabel: Record<StudentStatus, string> = { ACTIVE: "Aktif", INACTIVE: "Tidak aktif", ARCHIVED: "Diarsipkan" };
export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return <StatusBadge tone={status === "ACTIVE" ? "success" : status === "ARCHIVED" ? "warning" : "neutral"}>{studentStatusLabel[status]}</StatusBadge>;
}
export const studentDate = (value: Date) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value);

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function nameHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 160) + 160;
}

export function InitialsAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = nameInitials(name);
  const hue = nameHue(name);
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "var(--radius-full)",
        background: `hsl(${hue}, 30%, 48%)`,
        color: "white",
        fontSize: size <= 28 ? "var(--font-size-12)" : "var(--font-size-14)",
        fontWeight: "var(--font-weight-semibold)",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
