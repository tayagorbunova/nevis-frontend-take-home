import { NavTabs } from "@ui";

import styles from "./TopBar.module.css";

export function TopBar() {
  return (
    <header className={styles.topBar}>
      <NavTabs label="Main">
        <NavTabs.Link href="/">Implementation</NavTabs.Link>
        <NavTabs.Link href="/components">Components</NavTabs.Link>
        <NavTabs.Link href="/docs">Docs</NavTabs.Link>
      </NavTabs>
    </header>
  );
}
