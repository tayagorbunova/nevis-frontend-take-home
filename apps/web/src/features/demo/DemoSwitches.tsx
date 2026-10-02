import { useId } from "react";

import { Switch } from "@ui";

import styles from "./DemoSwitches.module.css";
import type { DemoSettings } from "./demoSettings";

type DemoSwitchesProps = {
  settings: DemoSettings;
  onChange: (settings: DemoSettings) => void;
};

export function DemoSwitches({ settings, onChange }: DemoSwitchesProps) {
  const labelId = useId();

  return (
    <div className={styles.group} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        Demo settings
      </span>

      <Switch isSelected={settings.slow} onChange={(slow) => onChange({ ...settings, slow })}>
        Slow responses
      </Switch>

      <Switch isSelected={settings.fail} onChange={(fail) => onChange({ ...settings, fail })}>
        Fail requests
      </Switch>
    </div>
  );
}
