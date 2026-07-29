import {
  ArrowLeftRight,
  Calculator,
  CircleAlert,
  CircleCheckBig,
  DatabaseZap,
  Files,
  History,
  ListChecks,
  ListOrdered,
  MessageCircleQuestion,
  Scale,
  Search,
  Smartphone,
  UserRoundCheck,
} from "lucide-react";

import styles from "./landing-content.module.css";

const icons = {
  ArrowLeftRight,
  Calculator,
  CircleAlert,
  CircleCheckBig,
  DatabaseZap,
  Files,
  History,
  ListChecks,
  ListOrdered,
  MessageCircleQuestion,
  Scale,
  Search,
  Smartphone,
  UserRoundCheck,
} as const;

export type LandingIconName = keyof typeof icons;

export function LandingIcon({ name }: { name: LandingIconName }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" className={styles.itemIcon} />;
}
