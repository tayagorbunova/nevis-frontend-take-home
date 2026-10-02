import type { ComponentType } from "react";

export type ExamplesMeta = { title: string; wide?: boolean };

export type Examples = Record<string, ComponentType>;
