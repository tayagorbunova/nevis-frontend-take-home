import { useState } from "react";

import type { Examples, ExamplesMeta } from "../exampleTypes";

import { Select } from "./Select";

export const meta: ExamplesMeta = { title: "Select" };

const periods = [
  { id: "last-12-months", label: "Last 12 months" },
  { id: "last-6-months", label: "Last 6 months" },
  { id: "last-3-months", label: "Last 3 months" },
  { id: "last-month", label: "Last month" },
];

function VisibleLabel() {
  const [period, setPeriod] = useState("last-12-months");

  return <Select label="Period" items={periods} value={period} onChange={setPeriod} />;
}

function Disabled() {
  const [period, setPeriod] = useState("last-12-months");

  return <Select label="Period" items={periods} value={period} onChange={setPeriod} isDisabled />;
}

function HiddenLabel() {
  const [period, setPeriod] = useState("last-12-months");

  return <Select label="Period" hideLabel items={periods} value={period} onChange={setPeriod} />;
}

export const examples: Examples = { VisibleLabel, Disabled, HiddenLabel };
