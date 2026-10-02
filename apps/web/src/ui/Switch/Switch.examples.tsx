import { useState } from "react";

import type { Examples, ExamplesMeta } from "../exampleTypes";

import { Switch } from "./Switch";

export const meta: ExamplesMeta = { title: "Switch" };

function Default() {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Switch isSelected={isSelected} onChange={setIsSelected}>
      Slow responses
    </Switch>
  );
}

function Disabled() {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Switch isSelected={isSelected} onChange={setIsSelected} isDisabled>
      Slow responses
    </Switch>
  );
}

export const examples: Examples = { Default, Disabled };
