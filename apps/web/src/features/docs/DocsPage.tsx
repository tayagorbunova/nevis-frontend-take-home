import Markdown from "react-markdown";

import productMarkdown from "@docs/product-final.md?raw";
import technicalMarkdown from "@docs/technical-final.md?raw";
import { NavTabs } from "@ui";

import styles from "./DocsPage.module.css";

const DOCS = { product: productMarkdown, technical: technicalMarkdown };

type DocsPageProps = { doc: keyof typeof DOCS };

export function DocsPage({ doc }: DocsPageProps) {
  return (
    <div className={styles.docs}>
      <title>Docs · Nevis home task</title>

      <div className={styles.tabs}>
        <NavTabs label="Documents">
          <NavTabs.Link href="/docs/product">Product</NavTabs.Link>
          <NavTabs.Link href="/docs/technical">Technical</NavTabs.Link>
        </NavTabs>
      </div>

      <article className={styles.prose}>
        <Markdown>{DOCS[doc]}</Markdown>
      </article>
    </div>
  );
}
