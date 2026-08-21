"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Role } from "@/generated/prisma/enums";
import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar, Logo, StatusBadge } from "@/components/ui";
import { navigationForRole } from "./navigation";
import { NavigationIcon } from "./navigation-icon";
import styles from "./app-shell.module.css";

export type AppShellProps = {
  role: Role;
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: ReactNode;
};

export function AppShell({ role, user, children }: AppShellProps) {
  const pathname = usePathname();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigation = navigationForRole(role);
  const roleLabel = role === "PLATFORM_ADMIN" ? "Admin" : "Operator";
  const displayName = user.name ?? user.email ?? "Pengguna";

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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {navigationOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
        <Link href={role === "PLATFORM_ADMIN" ? "/admin" : "/operator"} className={styles.brand}>
          <Logo />
        </Link>
        <div className={styles.account}>
          <Avatar name={displayName} photo={user.image} size="md" loading="eager" />
          <div className={styles.accountCopy}>
            <span className={styles.accountName}>{displayName}</span>
            <StatusBadge>{roleLabel}</StatusBadge>
          </div>
          <LogoutButton className={styles.logoutButton} />
        </div>
      </header>

      <aside id="app-navigation" className={styles.sidebar} data-open={navigationOpen}>
        <nav aria-label="Navigasi utama">
          <ul className={styles.navList}>
            {navigation.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && item.href !== "/operator" && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setNavigationOpen(false)}
                  >
                    <NavigationIcon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <Avatar name={displayName} photo={user.image} size="md" />
            <div className={styles.userMeta}>
              <span className={styles.userName}>{displayName}</span>
              <StatusBadge>{roleLabel}</StatusBadge>
            </div>
          </div>
          <LogoutButton className={styles.sidebarLogout} />
        </div>
      </aside>
      {navigationOpen ? <button className={styles.scrim} aria-label="Tutup navigasi" onClick={() => setNavigationOpen(false)} /> : null}

      <main id="app-content" className={styles.main} tabIndex={-1}>{children}</main>
      <footer className={styles.footer}>© {new Date().getFullYear()} Amanah Cash</footer>
    </div>
  );
}
