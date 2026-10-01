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

import styles from "./Select.module.css";

const chevronDownPath = "M4.5 6.5L8 10L11.5 6.5";
const checkPath = "M3.5 8.5L6.5 11.5L12.5 5.5";

type IconProps = { path: string };

function Icon({ path }: IconProps) {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

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
        <Icon path={chevronDownPath} />
      </Button>

      <Popover className={styles.popover} offset={4}>
        <ListBox items={items}>
          {(item) => (
            <ListBoxItem className={styles.option} textValue={item.label}>
              {({ isSelected }) => (
                <>
                  {item.label}
                  {isSelected && <Icon path={checkPath} />}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
