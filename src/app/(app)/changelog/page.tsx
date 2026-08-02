import Link from "next/link";
import { protectRoute } from "@/authorization/routes";
import { ContentWrapper, EmptyState, SectionHeader } from "@/components/ui";
import { releasedChangelog } from "@/settings/about";
import styles from "./changelog.module.css";

export default async function ChangelogPage() {
  const user = await protectRoute("authenticated");
  const releases = await releasedChangelog();
  const settingsHref = user.role === "PLATFORM_ADMIN" ? "/admin/settings" : "/operator/settings";

  return (
    <ContentWrapper>
      <SectionHeader
        title="Perubahan Amanah Cash"
        description="Ringkasan perubahan yang sudah dirilis."
        action={<Link className={styles.backLink} href={settingsHref}>Kembali ke Pengaturan</Link>}
      />
      {releases.length ? (
        <div className={styles.releases}>
          {releases.map((release) => (
            <article className={styles.release} key={release.version}>
              <header>
                <h2>Versi {release.version}</h2>
                {release.date ? <time dateTime={release.date}>{release.date}</time> : null}
              </header>
              {release.groups.map((group) => (
                <section key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              ))}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          kind="generic"
          title="Belum ada catatan perubahan"
          description="Belum ada catatan perubahan yang dirilis."
        />
      )}
    </ContentWrapper>
  );
}
