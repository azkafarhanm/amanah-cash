import type { NavigationItem } from "./navigation";

export function NavigationIcon({ name }: { name: NavigationItem["icon"] }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    students: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2-6 6-6s6 2 6 6" /><circle cx="17" cy="8" r="2" /><path d="M16 14c3 0 5 2 5 5" /></>,
    transactions: <><path d="M4 7h15" /><path d="m16 4 3 3-3 3" /><path d="M20 17H5" /><path d="m8 14-3 3 3 3" /></>,
    reports: <><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h4" /><path d="M8 13h8M8 17h8" /></>,
    operators: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-5 3-8 8-8s8 3 8 8" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z" /></>
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
