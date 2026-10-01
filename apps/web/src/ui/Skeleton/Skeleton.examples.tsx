import type { Examples, ExamplesMeta } from "../examples";

import { Skeleton } from "./Skeleton";

export const meta: ExamplesMeta = { title: "Skeleton" };

function Block() {
  return <Skeleton width="100%" height="6rem" />;
}

function TextLine() {
  return <Skeleton width="9rem" height="0.875rem" />;
}

function LargeRadius() {
  return <Skeleton width="10rem" height="2.25rem" radius="large" />;
}

export const examples: Examples = { Block, TextLine, LargeRadius };
