import styles from "./Skeleton.module.css";

type SkeletonProps = {
  width: string;
  height: string;
  radius?: "small" | "medium" | "large";
};

export function Skeleton({ width, height, radius = "medium" }: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: `var(--radius-${radius})` }}
      aria-hidden="true"
    />
  );
}
