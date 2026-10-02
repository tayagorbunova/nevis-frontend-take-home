import { Card, Skeleton } from "@ui";

import styles from "./ClientsPlaceholder.module.css";

const MONTH_COUNT = 12;
const BRANCH_COUNT = 3;

function CountPlaceholders() {
  return Array.from({ length: MONTH_COUNT }, (_, index) => (
    <Skeleton key={index} width="1.75rem" height="0.875rem" />
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

          {Array.from({ length: MONTH_COUNT }, (_, index) => (
            <div key={index} className={styles.monthPlaceholder}>
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

        {Array.from({ length: BRANCH_COUNT }, (_, index) => (
          <div key={index} className={styles.rowPlaceholder}>
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
