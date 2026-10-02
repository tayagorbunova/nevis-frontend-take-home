import type { Examples, ExamplesMeta } from "../exampleTypes";

import { Spinner } from "./Spinner";

export const meta: ExamplesMeta = { title: "Spinner" };

function Loading() {
  return <Spinner label="Loading" />;
}

export const examples: Examples = { Loading };
