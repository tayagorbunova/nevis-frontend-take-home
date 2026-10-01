import type { Examples, ExamplesMeta } from "../examples";

import { Spinner } from "./Spinner";

export const meta: ExamplesMeta = { title: "Spinner" };

function Loading() {
  return <Spinner label="Loading" />;
}

export const examples: Examples = { Loading };
