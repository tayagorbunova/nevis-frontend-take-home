import type { PropsWithChildren } from "react";
import { Button as AriaButton } from "react-aria-components";

import { Spinner } from "../Spinner/Spinner";

import styles from "./Button.module.css";

type ButtonProps = PropsWithChildren<{
  onPress: () => void;
  isPending?: boolean;
  isDisabled?: boolean;
}>;

export function Button({ onPress, isPending, isDisabled, children }: ButtonProps) {
  return (
    <AriaButton
      className={styles.button}
      onPress={onPress}
      isPending={isPending}
      isDisabled={isDisabled}
    >
      {isPending && <Spinner label="Loading" />}
      {children}
    </AriaButton>
  );
}
