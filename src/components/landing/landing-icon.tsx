import {
  ArrowLeftRight,
  Calculator,
  ChartNoAxesCombined,
  CircleAlert,
  CircleCheckBig,
  DatabaseZap,
  DatabaseBackup,
  Eye,
  FileClock,
  FileDown,
  Files,
  History,
  ListChecks,
  ListOrdered,
  MessageCircleQuestion,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
  Users,
} from "lucide-react";

import styles from "./landing-content.module.css";

const icons = {
  ArrowLeftRight,
  Calculator,
  ChartNoAxesCombined,
  CircleAlert,
  CircleCheckBig,
  DatabaseZap,
  DatabaseBackup,
  Eye,
  FileClock,
  FileDown,
  Files,
  History,
  ListChecks,
  ListOrdered,
  MessageCircleQuestion,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
  Users,
} as const;

export type LandingIconName = keyof typeof icons;

export function LandingIcon({ name }: { name: LandingIconName }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" className={styles.itemIcon} />;
}
