import { Card, Skeleton } from "@ui";

import styles from "./ClientsPlaceholder.module.css";

const PLACEHOLDER_MONTHS = Array.from({ length: 12 }, (_, index) => index);
const PLACEHOLDER_BRANCHES = Array.from({ length: 3 }, (_, index) => index);

function CountPlaceholders() {
  return PLACEHOLDER_MONTHS.map((month) => (
    <Skeleton key={month} width="1.75rem" height="0.875rem" />
  ));
}

export function ClientsPlaceholder() {
  return (
    <>
      <Card>
        <div className={styles.chartPlaceholder}>
          <div className={styles.captionPlaceholder}>
            <Skeleton width="9rem" height="0.875rem" />
          </div>

          <Skeleton width="100%" height="22.375rem" />

          <div className={styles.legendPlaceholder}>
            <Skeleton width="13rem" height="0.75rem" />
          </div>
        </div>
      </Card>

      <Card variant="unpadded">
        <div className={styles.headerPlaceholder}>
          <span />

          {PLACEHOLDER_MONTHS.map((month) => (
            <div key={month} className={styles.monthPlaceholder}>
              <div className={styles.monthNamePlaceholder}>
                <Skeleton width="min(3.5rem, 100%)" height="0.875rem" />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.rowPlaceholder}>
          <div className={styles.companyNamePlaceholder}>
            <Skeleton width="5rem" height="0.875rem" />
          </div>

          <CountPlaceholders />
        </div>

        {PLACEHOLDER_BRANCHES.map((branch) => (
          <div key={branch} className={styles.rowPlaceholder}>
            <div className={styles.branchNamePlaceholder}>
              <Skeleton width="4.5rem" height="0.875rem" />
            </div>

            <CountPlaceholders />
          </div>
        ))}
      </Card>
    </>
  );
}
