import { DEFAULT_PERIOD } from "@nevis/contract";
import { lazy, Suspense, useState } from "react";
import { Redirect, Route, Switch } from "wouter";

import { ClientsPage } from "../features/clients/ClientsPage";
import { DEMO_SETTINGS_OFF } from "../features/demo/demoSettings";

import styles from "./App.module.css";
import { TopBar } from "./TopBar";

const GalleryPage = lazy(() =>
  import("../features/gallery/GalleryPage").then((module) => ({ default: module.GalleryPage })),
);

const DocsPage = lazy(() =>
  import("../features/docs/DocsPage").then((module) => ({ default: module.DocsPage })),
);

export function App() {
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [openedRowIds, setOpenedRowIds] = useState<string[] | null>(null);
  const [demoSettings, setDemoSettings] = useState(DEMO_SETTINGS_OFF);

  return (
    <>
      <TopBar demoSettings={demoSettings} onDemoSettingsChange={setDemoSettings} />

      <main className={styles.page}>
        <Suspense fallback={null}>
          <Switch>
            <Route path="/">
              <ClientsPage
                period={period}
                onPeriodChange={setPeriod}
                openedRowIds={openedRowIds}
                onOpenedRowIdsChange={setOpenedRowIds}
                demoSettings={demoSettings}
              />
            </Route>

            <Route path="/components">
              <GalleryPage />
            </Route>

            <Route path="/docs">
              <DocsPage />
            </Route>

            <Route>
              <Redirect to="/" replace />
            </Route>
          </Switch>
        </Suspense>
      </main>
    </>
  );
}
