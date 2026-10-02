import { Button, Card } from "@ui";

import styles from "./ErrorCard.module.css";

type ErrorCardProps = {
  isBusy: boolean;
  onRetry: () => void;
};

export function ErrorCard({ isBusy, onRetry }: ErrorCardProps) {
  return (
    <Card variant="unpadded">
      <div className={styles.error} role="alert">
        <p className={styles.errorMessage}>Couldn't load clients</p>

        <Button onPress={onRetry} isPending={isBusy}>
          Try again
        </Button>
      </div>
    </Card>
  );
}
