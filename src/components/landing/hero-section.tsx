import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { PageContainer } from "@/components/ui";
import { SoftAurora } from "./soft-aurora";

import styles from "./hero-section.module.css";

function HeroPreview() {
  return (
    <div
      aria-label="Pratinjau Amanah Cash yang menampilkan saldo siswa, tindakan Setor dan Tarik, serta transaksi terbaru."
      className={styles.previewStage}
      role="img"
    >
      <div aria-hidden="true" className={styles.previewGlow} />
      <div aria-hidden="true" className={styles.previewLayerBack} />
      <div aria-hidden="true" className={styles.previewLayerMid} />
      <div className={styles.previewWindow}>
        <div className={styles.previewBar}>
          <div className={styles.previewBarDots} aria-hidden="true">
            <span className={styles.previewBarDot} />
            <span className={styles.previewBarDot} />
            <span className={styles.previewBarDot} />
          </div>
          <span className={styles.previewBrand}>Amanah Cash</span>
          <span className={styles.previewStatus}>
            <Check aria-hidden="true" />
            Tersimpan
          </span>
        </div>
        <div className={styles.previewBody}>
          <div className={styles.previewBreadcrumb} aria-hidden="true">
            <span>Siswa</span>
            <ChevronRight />
            <span className={styles.previewBreadcrumbActive}>Detail</span>
          </div>
          <div className={styles.previewHeading}>
            <div>
              <span className={styles.previewLabel}>Detail siswa</span>
              <strong>Aisyah Putri</strong>
              <span>Kelas 8A · Aktif</span>
            </div>
            <div className={styles.balance}>
              <span>Saldo terkini</span>
              <strong>Rp425.000</strong>
            </div>
          </div>
          <div className={styles.previewMetrics} aria-hidden="true">
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>
                <TrendingUp />
              </span>
              <div>
                <small>Setoran bulan ini</small>
                <strong>Rp350.000</strong>
              </div>
            </div>
            <div className={styles.metricCard}>
              <span className={`${styles.metricIcon} ${styles.metricIconWithdrawal}`}>
                <Users />
              </span>
              <div>
                <small>Transaksi</small>
                <strong>12 riwayat</strong>
              </div>
            </div>
          </div>
          <div className={styles.previewActions}>
            <span>Setor</span>
            <span>Tarik</span>
          </div>
          <div className={styles.activityHeader}>
            <strong>Aktivitas terbaru</strong>
            <span>Dapat ditelusuri</span>
          </div>
          <div className={styles.transaction}>
            <span className={styles.transactionIcon}>+</span>
            <span>
              <strong>Setoran</strong>
              <small>Hari ini · 09.24</small>
            </span>
            <strong>+Rp100.000</strong>
          </div>
          <div className={styles.transaction}>
            <span className={`${styles.transactionIcon} ${styles.withdrawal}`}>
              −
            </span>
            <span>
              <strong>Penarikan</strong>
              <small>Kemarin · 13.10</small>
            </span>
            <strong>−Rp25.000</strong>
          </div>
          <div className={styles.transaction}>
            <span className={styles.transactionIcon}>+</span>
            <span>
              <strong>Setoran</strong>
              <small>2 hari lalu · 08.15</small>
            </span>
            <strong>+Rp75.000</strong>
          </div>
        </div>
      </div>
      <div className={styles.trustNote}>
        <ShieldCheck aria-hidden="true" />
        <span>
          <strong>Jejak yang jelas</strong>
          <small>Saldo, transaksi, dan audit saling terhubung</small>
        </span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className={`${styles.section} tablet:py-[var(--landing-section-padding-tablet)] desktop:py-[var(--landing-section-padding-desktop)]`}
    >
      <div aria-hidden="true" className={styles.backdrop} />
      <SoftAurora />
      <div aria-hidden="true" className={styles.backdropGrid} />
      <PageContainer className={`${styles.layout} desktop:grid-cols-2`}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Keuangan siswa, lebih tertata</p>
          <h1
            className={`${styles.title} tablet:[font:var(--landing-hero-title-tablet)] desktop:[font:var(--landing-hero-title-desktop)]`}
          >
            Kelola keuangan siswa dengan lebih jelas dan terpercaya
          </h1>
          <p className={styles.subheading}>
            Amanah Cash membantu sekolah, pesantren, yayasan, dan lembaga
            sejenis mencatat setoran dan penarikan, memantau saldo, serta
            menelusuri aktivitas keuangan siswa dalam satu aplikasi.
          </p>
          <p className={styles.supportingCopy}>
            Dirancang untuk pekerjaan harian melalui browser di ponsel maupun
            komputer.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/login">
              Mulai menggunakan
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryAction} href="#cara-kerja">
              Lihat cara kerja
              <ArrowDown aria-hidden="true" />
            </Link>
          </div>
        </div>
        <HeroPreview />
      </PageContainer>
    </section>
  );
}
