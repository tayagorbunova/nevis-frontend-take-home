import { useState, type PropsWithChildren } from "react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import type { Examples, ExamplesMeta } from "../exampleTypes";

import { NavTabs } from "./NavTabs";

export const meta: ExamplesMeta = { title: "NavTabs" };

type MemoryRouterProps = PropsWithChildren<{ path: string }>;

function MemoryRouter({ path, children }: MemoryRouterProps) {
  const [location] = useState(() => memoryLocation({ path }));

  return <Router hook={location.hook}>{children}</Router>;
}

function CurrentTab() {
  return (
    <MemoryRouter path="/">
      <NavTabs label="Example with a current tab">
        <NavTabs.Link href="/">Implementation</NavTabs.Link>
        <NavTabs.Link href="/components">Components</NavTabs.Link>
        <NavTabs.Link href="/docs">Docs</NavTabs.Link>
      </NavTabs>
    </MemoryRouter>
  );
}

export const examples: Examples = { CurrentTab };
