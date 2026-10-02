import styles from "./Icon.module.css";

const ICON_PATHS = {
  check: "M3.5 8.5L6.5 11.5L12.5 5.5",
  chevronDown: "M4.5 6.5L8 10L11.5 6.5",
  chevronRight: "M6.5 4.5L10 8L6.5 11.5",
} as const;

type IconProps = { name: keyof typeof ICON_PATHS };

export function Icon({ name }: IconProps) {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={ICON_PATHS[name]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
