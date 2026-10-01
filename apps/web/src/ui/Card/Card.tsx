import type { PropsWithChildren } from "react";

import styles from "./Card.module.css";

type CardProps = PropsWithChildren<{ variant?: "padded" | "unpadded" }>;

export function Card({ variant = "padded", children }: CardProps) {
  return <div className={styles[variant]}>{children}</div>;
}
