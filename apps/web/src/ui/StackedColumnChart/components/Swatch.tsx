import { toCssColor, type ChartColor } from "../palette";

import styles from "./Swatch.module.css";

type SwatchProps = { color: ChartColor };

export function Swatch({ color }: SwatchProps) {
  return <span className={styles.swatch} style={{ background: toCssColor(color) }} />;
}
