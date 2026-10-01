import { ProgressBar } from "react-aria-components";

import styles from "./Spinner.module.css";

type SpinnerProps = { label: string };

export function Spinner({ label }: SpinnerProps) {
  return (
    <ProgressBar className={styles.spinner} aria-label={label} isIndeterminate>
      <svg className={styles.ring} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r="6.25"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        <path d="M8 1.75A6.25 6.25 0 0 1 14.25 8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </ProgressBar>
  );
}
