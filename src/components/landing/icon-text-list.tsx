import { LandingIcon, type LandingIconName } from "./landing-icon";
import styles from "./landing-content.module.css";

interface IconTextItem {
  icon: LandingIconName;
  title: string;
  description: string;
}

export function IconTextList({
  items,
  className,
}: {
  items: readonly IconTextItem[];
  className?: string;
}) {
  return (
    <ul
      className={[styles.itemList, className].filter(Boolean).join(" ")}
    >
      {items.map((item) => (
        <li className={styles.item} key={item.title}>
          <LandingIcon name={item.icon} />
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
