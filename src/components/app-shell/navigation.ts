import type { Role } from "@/generated/prisma/enums";

export type NavigationItem = {
  label: string;
  href: string;
  icon: "dashboard" | "students" | "transactions" | "reports" | "operators" | "settings";
};

const operatorNavigation: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/operator", icon: "dashboard" },
  { label: "Siswa", href: "/operator/students", icon: "students" },
  { label: "Transaksi", href: "/operator/transactions", icon: "transactions" },
  { label: "Laporan", href: "/operator/reports", icon: "reports" },
  { label: "Pengaturan", href: "/operator/settings", icon: "settings" }
];

const adminNavigation: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Operator", href: "/admin/operators", icon: "operators" },
  { label: "Penugasan Siswa", href: "/admin/students", icon: "students" },
  { label: "Laporan", href: "/admin/reports", icon: "reports" },
  { label: "Pengaturan", href: "/admin/settings", icon: "settings" }
];

export function navigationForRole(role: Role): readonly NavigationItem[] {
  return role === "PLATFORM_ADMIN" ? adminNavigation : operatorNavigation;
}
