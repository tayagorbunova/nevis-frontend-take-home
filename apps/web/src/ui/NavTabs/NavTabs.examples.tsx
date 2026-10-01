import { useState, type PropsWithChildren } from "react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import type { ExamplesMeta } from "../examples";

import { NavTabs } from "./NavTabs";

export const meta: ExamplesMeta = { title: "NavTabs" };

type MemoryRouterProps = PropsWithChildren<{ path: string }>;

function MemoryRouter({ path, children }: MemoryRouterProps) {
  const [location] = useState(() => memoryLocation({ path }));

  return <Router hook={location.hook}>{children}</Router>;
}

export function CurrentTab() {
  return (
    <MemoryRouter path="/">
      <NavTabs label="Example with a current tab">
        <NavTabs.Link href="/">Dashboard</NavTabs.Link>
        <NavTabs.Link href="/components">Components</NavTabs.Link>
        <NavTabs.Link href="/docs">Docs</NavTabs.Link>
      </NavTabs>
    </MemoryRouter>
  );
}
