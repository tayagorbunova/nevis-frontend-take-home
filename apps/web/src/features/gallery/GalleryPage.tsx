import { Card, type Examples, type ExamplesMeta } from "@ui";

import styles from "./GalleryPage.module.css";

type ExamplesModule = { meta: ExamplesMeta; examples: Examples };

const exampleModules = import.meta.glob<ExamplesModule>("../../ui/**/*.examples.tsx", {
  eager: true,
});

const sections = Object.values(exampleModules)
  .map(({ meta, examples }) => ({ title: meta.title, examples: Object.entries(examples) }))
  .sort((a, b) => a.title.localeCompare(b.title));

function toCaption(exampleName: string) {
  return exampleName.replace(/\B[A-Z]/g, (capital) => ` ${capital.toLowerCase()}`);
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
            {examples.map(([exampleName, Example]) => (
              <figure key={exampleName} className={styles.example}>
                <figcaption className={styles.caption}>{toCaption(exampleName)}</figcaption>

                <Card variant="unpadded">
                  <div className={styles.stage}>
                    <Example />
                  </div>
                </Card>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
