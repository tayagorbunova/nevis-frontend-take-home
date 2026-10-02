import type { Examples, ExamplesMeta } from "../exampleTypes";

import { Icon } from "./Icon";

export const meta: ExamplesMeta = { title: "Icon" };

function AllIcons() {
  return (
    <>
      <Icon name="chevronRight" />
      <Icon name="chevronDown" />
      <Icon name="check" />
    </>
  );
}

export const examples: Examples = { AllIcons };
