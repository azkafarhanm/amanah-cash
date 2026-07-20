"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Role } from "@/generated/prisma/enums";
import { LogoutButton } from "@/components/auth/logout-button";
import { Logo, StatusBadge } from "@/components/ui";
import { navigationForRole } from "./navigation";
import { NavigationIcon } from "./navigation-icon";
import styles from "./app-shell.module.css";

export type AppShellProps = {
  role: Role;
  user: { name?: string | null; email?: string | null };
  children: ReactNode;
};

export function AppShell({ role, user, children }: AppShellProps) {
  const pathname = usePathname();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigation = navigationForRole(role);
  const roleLabel = role === "PLATFORM_ADMIN" ? "Administrator Platform" : "Operator";

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#app-content">Lewati ke konten utama</a>
      <header className={styles.header}>
        <button
          className={styles.menuButton}
          type="button"
          aria-label={navigationOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={navigationOpen}
          aria-controls="app-navigation"
          onClick={() => setNavigationOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <Link href={role === "PLATFORM_ADMIN" ? "/admin" : "/operator"} className={styles.brand}>
          <Logo />
        </Link>
        <div className={styles.account}>
          <div className={styles.accountCopy}>
            <span>{user.name ?? user.email ?? "Pengguna Amanah Cash"}</span>
            <StatusBadge>{roleLabel}</StatusBadge>
          </div>
          <LogoutButton className={styles.logoutButton} />
        </div>
      </header>

      <aside id="app-navigation" className={styles.sidebar} data-open={navigationOpen}>
        <nav aria-label="Navigasi utama">
          <ul>
            {navigation.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && item.href !== "/operator" && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} onClick={() => setNavigationOpen(false)}>
                    <NavigationIcon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      {navigationOpen ? <button className={styles.scrim} aria-label="Tutup navigasi" onClick={() => setNavigationOpen(false)} /> : null}

      <main id="app-content" className={styles.main} tabIndex={-1}>{children}</main>
      <footer className={styles.footer}>© {new Date().getFullYear()} Amanah Cash</footer>
    </div>
  );
}
