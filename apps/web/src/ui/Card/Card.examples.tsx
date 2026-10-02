import type { PropsWithChildren } from "react";

import type { Examples, ExamplesMeta } from "../exampleTypes";

import { Card } from "./Card";

export const meta: ExamplesMeta = { title: "Card" };

function PageBackground({ children }: PropsWithChildren) {
  return (
    <div style={{ width: "100%", padding: "var(--space-16)", background: "var(--color-page)" }}>
      {children}
    </div>
  );
}

function Row({ children }: PropsWithChildren) {
  return (
    <div style={{ padding: "var(--space-16)", borderBottom: "var(--border)" }}>{children}</div>
  );
}

function Unpadded() {
  return (
    <PageBackground>
      <Card variant="unpadded">
        <Row>The content sets its own padding,</Row>
        <Row>so its lines reach the edges.</Row>
      </Card>
    </PageBackground>
  );
}

function Padded() {
  return (
    <PageBackground>
      <Card>The card pads its content.</Card>
    </PageBackground>
  );
}

export const examples: Examples = { Unpadded, Padded };
