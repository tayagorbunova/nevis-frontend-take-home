import { useRoute } from "wouter";

import { NavTabs } from "@ui";

import type { DemoSettings } from "../features/demo/demoSettings";
import { DemoSwitches } from "../features/demo/DemoSwitches";

import styles from "./TopBar.module.css";

type TopBarProps = {
  demoSettings: DemoSettings;
  onDemoSettingsChange: (demoSettings: DemoSettings) => void;
};

export function TopBar({ demoSettings, onDemoSettingsChange }: TopBarProps) {
  const [isImplementationTab] = useRoute("/");

  return (
    <header className={styles.topBar}>
      <div className={styles.tabs}>
        <NavTabs label="Main">
          <NavTabs.Link href="/">Implementation</NavTabs.Link>
          <NavTabs.Link href="/components">Components</NavTabs.Link>
          <NavTabs.Link href="/docs">Docs</NavTabs.Link>
        </NavTabs>
      </div>

      {isImplementationTab && (
        <div className={styles.demo}>
          <DemoSwitches settings={demoSettings} onChange={onDemoSettingsChange} />
        </div>
      )}
    </header>
  );
}
