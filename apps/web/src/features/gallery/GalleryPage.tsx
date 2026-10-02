import { Card, type Examples, type ExamplesMeta } from "@ui";

import styles from "./GalleryPage.module.css";

type ExamplesModule = { meta: ExamplesMeta; examples: Examples };

const exampleModules = import.meta.glob<ExamplesModule>("../../ui/**/*.examples.tsx", {
  eager: true,
});

const sections = Object.values(exampleModules)
  .map(({ meta, examples }) => ({
    title: meta.title,
    wide: meta.wide,
    examples: Object.entries(examples),
  }))
  .sort((a, b) => a.title.localeCompare(b.title));

function toCaption(exampleName: string) {
  return exampleName.replace(/\B[A-Z]/g, (capital) => ` ${capital.toLowerCase()}`);
}

export function GalleryPage() {
  return (
    <div className={styles.gallery}>
      <title>Components · Nevis home task</title>

      <header className={styles.header}>
        <h1>Components</h1>

        <p className={styles.intro}>
          A gallery of all the components the app is built from. In a real project I would use
          Storybook. Here it would mean a separate app with its own setup, build and dependencies,
          so I went with the simpler option: a small page that shows each component in its main
          states.
        </p>
      </header>

      {sections.map(({ title, wide, examples }) => (
        <section key={title} className={styles.section}>
          <h2 className={styles.name}>{title}</h2>

          <div className={styles.examples}>
            {examples.map(([exampleName, Example]) => (
              <figure key={exampleName} className={wide ? styles.wideExample : styles.example}>
                <figcaption className={styles.caption}>{toCaption(exampleName)}</figcaption>

                <Card variant="unpadded">
                  {wide ? (
                    <Example />
                  ) : (
                    <div className={styles.stage}>
                      <Example />
                    </div>
                  )}
                </Card>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
