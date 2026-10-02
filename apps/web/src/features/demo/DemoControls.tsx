import { useQueryClient } from "@tanstack/react-query";
import { useId } from "react";

import { Button, Switch } from "@ui";

import styles from "./DemoControls.module.css";
import type { DemoSettings } from "./demoSettings";

type DemoControlsProps = {
  settings: DemoSettings;
  onChange: (settings: DemoSettings) => void;
};

export function DemoControls({ settings, onChange }: DemoControlsProps) {
  const labelId = useId();
  const queryClient = useQueryClient();

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

      <Button onPress={() => void queryClient.resetQueries()}>Reload</Button>
    </div>
  );
}
