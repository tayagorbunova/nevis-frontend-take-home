import type { ComponentType } from "react";

import type { ExamplesMeta } from "../../ui/examples";

import styles from "./GalleryPage.module.css";

type ExamplesModule = { meta: ExamplesMeta } & Record<string, ComponentType>;

const exampleModules = import.meta.glob<ExamplesModule>("../../ui/**/*.examples.tsx", {
  eager: true,
});

const sections = Object.values(exampleModules)
  .map(({ meta, ...examples }) => ({ title: meta.title, examples: Object.entries(examples) }))
  .sort((a, b) => a.title.localeCompare(b.title));

function toCaption(exportName: string) {
  return exportName.replace(/\B[A-Z]/g, (capital) => ` ${capital.toLowerCase()}`);
}

export function GalleryPage() {
  return (
    <div className={styles.gallery}>
      <title>Components · Nevis home task</title>
      <h1>Components</h1>

      {sections.map(({ title, examples }) => (
        <section key={title} className={styles.section}>
          <h2 className={styles.name}>{title}</h2>

          <div className={styles.examples}>
            {examples.map(([exportName, Example]) => (
              <figure key={exportName} className={styles.example}>
                <figcaption className={styles.caption}>{toCaption(exportName)}</figcaption>

                <div className={styles.card}>
                  <Example />
                </div>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
