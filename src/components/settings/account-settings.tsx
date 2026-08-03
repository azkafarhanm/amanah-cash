import { Avatar } from "@/components/ui";
import styles from "./settings-sections.module.css";

export type AccountSettingsProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function AccountSettings({ user }: AccountSettingsProps) {
  const displayName = user.name ?? user.email ?? "Pengguna";

  return (
    <section className={styles.section} aria-labelledby="settings-account-title">
      <header className={styles.header}>
        <h2 id="settings-account-title">Akun</h2>
        <p>Identitas akun Anda berasal dari profil Google yang terdaftar.</p>
      </header>
      <div className={styles.accountIdentity}>
        <Avatar name={displayName} photo={user.image} size="lg" />
        <div>
          <h3>{displayName}</h3>
          <p>{user.email ?? "Email tidak tersedia"}</p>
        </div>
      </div>
    </section>
  );
}
