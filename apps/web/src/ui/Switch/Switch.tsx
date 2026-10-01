import type { PropsWithChildren } from "react";
import { SwitchButton, SwitchField } from "react-aria-components";

import styles from "./Switch.module.css";

type SwitchProps = PropsWithChildren<{
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  isDisabled?: boolean;
}>;

export function Switch({ isSelected, onChange, isDisabled, children }: SwitchProps) {
  return (
    <SwitchField isSelected={isSelected} onChange={onChange} isDisabled={isDisabled}>
      <SwitchButton className={styles.switch}>
        <span className={styles.track}>
          <span className={styles.thumb} />
        </span>

        {children}
      </SwitchButton>
    </SwitchField>
  );
}
