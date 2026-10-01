import type { PropsWithChildren } from "react";
import { Link, useRoute } from "wouter";

import styles from "./NavTabs.module.css";

type NavTabsProps = PropsWithChildren<{ label: string }>;

export function NavTabs({ label, children }: NavTabsProps) {
  return (
    <nav className={styles.nav} aria-label={label}>
      <ul className={styles.list}>{children}</ul>
    </nav>
  );
}

type NavTabsLinkProps = PropsWithChildren<{ href: string }>;

function NavTabsLink({ href, children }: NavTabsLinkProps) {
  const [isCurrent] = useRoute(href);

  return (
    <li className={styles.item}>
      <Link
        className={styles.link}
        href={href}
        replace={isCurrent}
        aria-current={isCurrent ? "page" : undefined}
      >
        <span className={styles.text}>{children}</span>
      </Link>
    </li>
  );
}

NavTabs.Link = NavTabsLink;
