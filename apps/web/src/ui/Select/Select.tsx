import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  type Key,
} from "react-aria-components";

import { Icon } from "../Icon/Icon";

import styles from "./Select.module.css";

type SelectProps<Id extends string> = {
  label: string;
  hideLabel?: boolean;
  items: readonly { id: Id; label: string }[];
  value: Id;
  onChange: (value: Id) => void;
  isDisabled?: boolean;
};

export function Select<Id extends string>({
  label,
  hideLabel,
  items,
  value,
  onChange,
  isDisabled,
}: SelectProps<Id>) {
  function handleChange(key: Key | null) {
    const chosenItem = items.find((item) => item.id === key);

    if (chosenItem) onChange(chosenItem.id);
  }

  return (
    <AriaSelect
      className={styles.select}
      aria-label={hideLabel ? label : undefined}
      value={value}
      onChange={handleChange}
      isDisabled={isDisabled}
    >
      {!hideLabel && <Label className={styles.label}>{label}</Label>}

      <Button className={styles.trigger}>
        <SelectValue />
        <Icon name="chevronDown" />
      </Button>

      <Popover className={styles.popover} offset={4}>
        <ListBox items={items}>
          {(item) => (
            <ListBoxItem className={styles.option} textValue={item.label}>
              {({ isSelected }) => (
                <>
                  {item.label}
                  {isSelected && <Icon name="check" />}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
