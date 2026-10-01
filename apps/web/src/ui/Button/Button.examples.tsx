import type { Examples, ExamplesMeta } from "../examples";

import { Button } from "./Button";

export const meta: ExamplesMeta = { title: "Button" };

const doNothing = () => undefined;

function Default() {
  return <Button onPress={doNothing}>Try again</Button>;
}

function Pending() {
  return (
    <Button onPress={doNothing} isPending>
      Try again
    </Button>
  );
}

function Disabled() {
  return (
    <Button onPress={doNothing} isDisabled>
      Try again
    </Button>
  );
}

export const examples: Examples = { Default, Pending, Disabled };
