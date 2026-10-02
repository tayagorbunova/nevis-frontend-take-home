import { Button, Card } from "@ui";

import styles from "./ErrorCard.module.css";

type ErrorCardProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

export function ErrorCard({ isRetrying, onRetry }: ErrorCardProps) {
  return (
    <Card variant="unpadded">
      <div className={styles.error} role="alert">
        <p className={styles.errorMessage}>Couldn't load clients</p>

        <Button onPress={onRetry} isPending={isRetrying}>
          Try again
        </Button>
      </div>
    </Card>
  );
}
