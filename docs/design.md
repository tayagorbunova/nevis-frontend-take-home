# Design: the Clients dashboard

The blueprint for building the app: **what** gets built and **how**. The reasons behind each choice are in [decisions.md](decisions.md) (cited as D1, D2, …). Words are defined in [GLOSSARY.md](../GLOSSARY.md), and the feature is explained in plain language in [feature-overview.md](feature-overview.md). Figma values come from the design file (Mockup 2 and its components), read on 2026-09-30.

## 1. Scope

**In scope:**

- **Dashboard tab:** the stacked column chart and the table whose rows open and close, a period dropdown, and the loading, refreshing and error states.
- **Components tab:** a gallery of our own UI components in their main states (D37).
- **Docs tab:** the decisions, rendered from the repo's Markdown (D20).
- **Top bar:** the tabs, plus the demo switches on the Dashboard tab (D11, D21).
- **Node.js API:** serves the brief's data (D7, D24, D35).
- Hosting on Vercel (D12), tests (D36, provisional), and a README.

**Out of scope (README follow-ups):**

- a picker for exact date ranges (D9)
- sharing views and keeping state across reloads (D28)
- a rule for breakdowns with more than five parts (D17)
- Storybook (D37)
- per-viewer defaults and permissions (D2)
- a level above Company (D3)
- data-quality checks (D4)
- upgrading to TypeScript 7 and MSW 3 (D40)

## 2. Architecture

### 2.1 Repository layout (D22)

```text
/
├─ package.json            npm workspaces: apps/*, packages/*; root scripts (§9)
├─ tsconfig.base.json      strict settings shared by every package
├─ eslint.config.js, .prettierrc, .nvmrc (24), vercel.json
├─ README.md, GLOSSARY.md, docs/
├─ packages/contract/      the API's shape and checks, shared by both sides (§3)
├─ apps/api/               the Hono server (§4)
└─ apps/web/               the React app (§5)
```

### 2.2 Boundaries

- `apps/web` and `apps/api` both import `packages/contract`. Neither imports the other.
- In `apps/web`:
  - Only `src/ui/` imports React Aria and Recharts (D13, D29).
  - `src/ui/` never imports from `src/features/`.
  - Components never call `fetch`; only each feature's data-loading code does.
- The pure rules are plain functions without React: the translation step, the opened rows, the chart model.

### 2.3 Where it runs

| | Page | API |
|---|---|---|
| **Locally** (`npm run dev`) | Vite dev server on port 5173, which forwards `/api/*` to the API | Hono on Node.js, port 3001, `DEMO_MODE=true` |
| **Vercel** (D12) | Static files built from `apps/web` | The same Hono app as a Vercel function, `DEMO_MODE=true` |

**Verified first:** exactly how Vercel serves the Hono app next to the static page inside our monorepo. The first implementation task is a minimal deploy that proves `/`, `/docs` and `/api/client-counts` all work, before any features are built. Known ingredients:

- Hono's zero-config Vercel support, or a function entry that exports the app
- the web app's build output as the static site
- a rewrite so that `/components` and `/docs` serve the page (the app handles those addresses itself)

## 3. The contract (`packages/contract`)

Written with Zod Mini (D27). TypeScript types are inferred from the schemas.

```ts
export const PERIODS = ['last-12-months', 'last-6-months', 'last-3-months', 'last-month'] as const;
export const DEFAULT_PERIOD = 'last-12-months';
export type Period = (typeof PERIODS)[number];

// What the server literally sends, in the API's own words (D6)
ApiChannel  = { id: string; name: string; values: number[] }
ApiEmployee = { id: string; name: string; values: number[]; avatarUrl?: string; channels?: ApiChannel[] }
ApiBranch   = { id: string; name: string; values: number[]; employees?: ApiEmployee[] }
ApiCompany  = { id: string; name: string; values: number[]; branches?: ApiBranch[] }

ClientCountsResponse = { months: string[]; company: ApiCompany }   // months as "YYYY-MM"
ApiErrorBody = { error: { code: 'invalid_period' | 'internal_error'; message: string } }

export const DEMO_HEADER = 'X-Demo';   // values: "slow", "fail", or "slow, fail"
```

The rules the schemas enforce:

- Values are whole numbers of zero or more.
- Months match `YYYY-MM`.
- The response check also confirms that every row's `values` has exactly as many numbers as `months`. The chart and table rely on that alignment.
- Child lists are optional, because the tree is uneven (D5).

## 4. The API (`apps/api`) (D24, D35)

**Files:**

- `src/app.ts`: the Hono app (routes and error handling)
- `src/server.ts`: the local Node.js entry
- the Vercel entry (see §2.3)
- `src/data/client-counts.json`: the brief's payload, copied exactly, plus `"avatarUrl": "/avatars/anna-blackwood.jpg"` on Anna Blackwood (D16)
- `src/data/firstMonth.ts`: `FIRST_MONTH = '2024-02'`. The payload has no dates, so the server owns this (D7).
- `src/selectPeriod.ts`: the pure month-picking function

**`GET /api/client-counts?period=<Period>`:**

1. **Demo** (only when `DEMO_MODE=true`):
   - If the `X-Demo` header contains `slow`, wait 2,000 ms.
   - Then, if it contains `fail`, answer `500 { error: { code: 'internal_error', message: 'Simulated failure (demo mode)' } }`.
   - Without demo mode, the header is ignored.
2. **Check the period** against the contract. A missing period means `last-12-months`. An unknown period gets `400 { error: { code: 'invalid_period', message: 'Unknown period "…". Use one of: last-12-months, last-6-months, last-3-months, last-month.' } }`.
3. **Pick the months.** From `FIRST_MONTH` and the data's 12 values, list the months (`2024-02` … `2025-01`), keep the last N (12, 6, 3 or 1), and trim every row's `values`, at every level, to the same N. Nothing else in the data changes: no totals are recalculated or "fixed" (D4).
4. **Answer** `200 { months, company }` with `Cache-Control: no-store`.

Any unexpected error answers `500` with `internal_error` in the same error shape. There are no data-quality checks (D4).

## 5. The web app (`apps/web`)

### 5.1 Folder layout (sections 3 and 4 of the design review)

```text
src/
├─ main.tsx            fonts, global styles, the data cache (QueryClient), the router, <App/>
├─ app/                App (page state, the three tab addresses), TopBar
├─ ui/                 our design system (§5.6); each component has .tsx, .module.css and .examples.tsx
├─ features/
│   ├─ clients/        ClientsPage, ClientsTable, ClientsChart, PeriodSelect,
│   │                  api/ (fetchClientCounts, useClientCounts), model/ (the pure rules)
│   ├─ demo/           DemoSwitches, the saved demo settings
│   ├─ gallery/        GalleryPage (loads on demand)
│   └─ docs/           DocsPage (loads on demand)
└─ styles/             tokens.css, global.css
public/avatars/anna-blackwood.jpg   (80×80, from the design, D16)
```

### 5.2 Addresses and the top bar (D21, D30, D37)

- **wouter routes:**
  - `/` shows the Dashboard
  - `/components` shows the Gallery, loaded on demand
  - `/docs` shows the Docs, loaded on demand
  - any other address redirects to `/`
- **React Aria's `RouterProvider`** gets wouter's `navigate`, so React Aria's links navigate without reloading the page.
- **The top bar** holds `NavTabs` (Dashboard, Components, Docs) on the left and `DemoSwitches` on the right, shown only on the Dashboard tab. On narrow screens it wraps onto two lines.
- **Browser tab titles:** "Clients · Nevis home task", "Components · Nevis home task" and "Docs · Nevis home task".

### 5.3 Page state (D28, section 1 of the design review)

`App` holds two pieces of state and passes them down as props. No context and no state library.

- **`period: Period`**, starting at `DEFAULT_PERIOD`.
- **`openedRowIds: string[] | null`**, the opened rows in the order they were opened.
  - `null` means "the default": only the company row is open (D2).
  - The company's id comes from the data, so the effective list is `openedRowIds ?? [tree.id]`.

Everything else is worked out from these two values, never stored. The data itself lives in TanStack Query's cache, above the tabs, so returning from Docs shows it instantly. The demo settings live in `localStorage` (§5.5).

**The opened-rows rules** (`features/clients/model/openedRows.ts`, pure):

- **Open a row:** move its id to the end of the list, so it's the most recent.
- **Close a row:** remove its id. Rows inside it stay in the list, so reopening the parent shows them still open (React Aria keeps them open while hidden).
- **What the chart shows** (`chartSubject(tree, openedIds)`):
  - It shows the **last id in the list that is visible**, meaning all its ancestors are in the list too, split into its children.
  - If no such row exists (the company is closed), it shows the **company's total as one colour** (D19).
  - Ids that aren't in the current tree are ignored.
- **Examples:**
  - Open Branch 1, then Anna: the chart shows Anna.
  - Close Branch 1: it shows the company.
  - Reopen Branch 1: it shows Branch 1, with Anna still open inside it.

### 5.4 From answer to screen

- **The translation step** (`model/toClientTree.ts`, D6) is the only code that reads `branches`, `employees` and `channels`. It produces one uniform tree:

  ```ts
  type RowLevel = 'company' | 'branch' | 'advisor' | 'channel';
  type ClientRow = { id: string; name: string; level: RowLevel; values: number[]; avatarUrl?: string; children: ClientRow[] };
  ```

- **The chart model** (`model/chartModel.ts`, pure) takes the chart's subject and the months, and produces:
  - **`caption`**: "Company by branch", "Branch 1 by advisor" or "Anna Blackwood by channel", named after the children's level (D19). It's just "Company" when the company is closed.
  - **`series`**: one entry per child, `{ id, name, color, values }`, coloured in the palette's order (D17), with a sixth or later child in a neutral grey. A single-colour chart has one series: the subject itself.
  - **`totals`**: the subject's own `values` from the server. The label's total always comes from here and is never summed (D4, D18).
  - **`description`**: for screen readers, e.g. "Company by branch, February 2024 to January 2025; exact numbers are in the table below."

### 5.5 Loading data (D8–D11, D26, D27)

- **`fetchClientCounts({ period, demo, signal })`:**
  - Requests `/api/client-counts?period=…`, adding `X-Demo` only when a switch is on.
  - A non-2xx answer throws `ApiError { status, code }`, reading the error shape when it's there.
  - A 2xx answer is checked with the contract; a failed check throws `InvalidResponseError`.
- **`useClientCounts(period)`:** `useQuery` with these settings:
  - `queryKey: ['client-counts', period]`
  - `placeholderData: keepPreviousData`, so the old numbers stay while a new period loads
  - `retry: false`, because "Try again" is manual and automatic retries would hide the demo's failure for several seconds
  - `refetchOnWindowFocus: false`, so switching windows doesn't quietly trigger reloads
- **Demo settings:** stored as `{ slow: boolean, fail: boolean }` under one `localStorage` key. Reading and writing are wrapped so a blocked `localStorage` just means "both off". Changing a switch reloads the current data straight away, so its effect is visible without extra clicks.
- **What the Dashboard shows:**

| State | What's on screen |
|---|---|
| First load (no data yet) | Placeholders shaped like the title row, the chart and the table |
| Error (any kind, even if older numbers exist) | "Couldn't load clients" and a "Try again" button (`refetch`), in place of the chart and table |
| New period loading (`isPlaceholderData`) | The previous numbers faded, and a small spinner next to the dropdown, which already shows the new choice |
| Loaded | The chart and table |

### 5.6 Our components (`src/ui/`, D13, D29, D38)

Each has its examples file for the Components tab.

| Component | Style | API (sketch) | Notes |
|---|---|---|---|
| `TreeTable<Row>` | props + render functions | `label`, `rows`, `getRowId`, `getChildren`, `openRowIds: ReadonlySet<string>`, `onRowOpenChange(id, isOpen)`, `columns: { id, header, hideHeader?, isRowHeader?, align?, cell(row) }[]` | See below |
| `StackedColumnChart` | props + render function | `months` (labels), `series`, `description`, `renderLabel(monthIndex)`, `labelledBy` | See below |
| `NavTabs` | compound | `<NavTabs label>` with `<NavTabs.Link href>` children | `<nav>`; the current tab gets `aria-current="page"`; styled per D39 |
| `Select` | plain props | `label`, `items: { id, label }[]`, `selectedKey`, `onSelectionChange` | React Aria `Select`; the label can be visually hidden |
| `Switch` | plain props | `children` (label), `isSelected`, `onChange` | React Aria `Switch` |
| `Button` | plain props | `children`, `onPress` | React Aria `Button`, one style |
| `Avatar` | plain props | `name`, `src?` | 20px circle; the photo when `src` is given, otherwise initials on a grey tint; hidden from screen readers (D16) |
| `Card` | plain props | `children` | White, 8px corners |
| `Skeleton` | plain props | `width`, `height`, `radius?` | Gentle pulse, none with reduced motion |
| `Spinner` | plain props | `label` | The small "new period loading" indicator |

**`TreeTable`** wraps React Aria's `Table` in tree mode (`treeColumn`, `expandedKeys`, `onExpandedChange`, row `onAction`):

- **Ours to handle:**
  - the recursion into `getChildren`
  - the chevron only on rows with children (D5)
  - rows without children ignoring clicks and Enter (the gotcha found in testing, D13)
  - reporting which row opened or closed
  - the visually hidden header label (D14)
  - the pinned first column and the sideways scrolling on narrow screens (D15)
- **Keyboard** behaviour comes from React Aria (D14).
- **Figma values:**
  - rows are 56px high, with padding 18/24/18/16
  - the first column is 264px wide, and the month columns share the rest, right-aligned
  - the header row is 56px, with its labels bottom-aligned at 60% ink
  - borders are 1px, ink at 8%; hover is ink at 4%, on every row as a reading aid, but only rows that can open show the hand cursor (D39)
- **Indentation** is 28px per level, and rows without a chevron keep its 24px (16px icon plus 8px gap). That reproduces the design exactly: Company 0, Branch 28, Advisor 56, Channel 84 + 24 = 108, where channel names line up with the advisor names above them.
- **The chevron** is the design's path `M6.5 4.5L10 8L6.5 11.5` (16px, 1.5px stroke, square caps), pointing right and turned 90° when open.

**`StackedColumnChart`** wraps Recharts (D29):

- **Figma look:**
  - each whole column is rounded at 4px (`BarStack`)
  - no gaps between parts
  - 24px between columns
  - five dotted gridlines (1px dash, 6px gap, ink at 16%) at "nice" round values
  - y labels 12px at 60% ink, 26px wide
  - x labels 12px, centred
  - the legend centred below: 8×8 squares with 2px corners
  - columns stop growing at the design's width on very wide screens
- **Keyboard:** Recharts' built-in layer gives one Tab stop and ← / → between months. We add Escape to hide the label, by controlling whether the label shows (to be confirmed with a quick test).
- **The label** is rendered by the feature through `renderLabel`, inside a region marked `role="status"` with polite announcements. Recharts adds announcements only to its default label, so we add them ourselves (D29).
- **Narrow screens:** month labels shorten to "Feb", with the year shown once (D15).

### 5.7 Feature components

- **`ClientsPage`:**
  - the title row: an `h1` "Clients", with `PeriodSelect` and the `Spinner` (while a new period loads) on the right, moving under the title on narrow screens (D15)
  - then the states from §5.5
  - it wires the page state to `ClientsChart` and `ClientsTable`
- **`ClientsTable`:**
  - `TreeTable` with the label "Client counts per month"
  - a name column (an `Avatar` for advisors, then the name; the header is visually hidden)
  - one column per month ("Feb 2024")
  - numbers formatted with `Intl.NumberFormat('en-US')` in tabular figures, so the digits line up
- **`ClientsChart`:**
  - a `Card` holding the caption (top-left, 14px, D19) and `StackedColumnChart`
  - the label reads: the month ("May 2024"), then the subject's total from the server, then each part with its colour square and number, e.g. "May 2024 · Company: 301 · Branch 1: 156 · Branch 2: 87 · Branch 3: 36"
- **`PeriodSelect`:** the `PERIODS` from the contract, with the labels "Last 12 months", "Last 6 months", "Last 3 months" and "Last month" (D9).
- **`DemoSwitches`:** a group labelled "Demo settings" with the switches "Slow responses" and "Fail requests" (D11).
- **`DocsPage`:**
  - loads `react-markdown` and `remark-gfm` on demand and renders `docs/decisions/product.md` and `docs/decisions/technical.md` as Markdown files imported at build time (D20, D31)
  - until the final docs stage creates those two files, it renders `docs/decisions.md`
  - Vite is allowed to read the repo-root `docs/` folder
- **`GalleryPage`:** collects every `src/ui/**/*.examples.tsx` with Vite's `import.meta.glob`, and shows one section per component with its named examples.

### 5.8 Styles (D25, D32, D39, D41)

**Tokens** live in `styles/tokens.css` on `:root`, in two layers (D41):

- **Base tokens** hold raw values, named by their place in a scale:
  - colours: `--ink` (#141413) and its opacity steps `--ink-60`, `--ink-16`, `--ink-8` and `--ink-4`; `--paper` (#F7F5ED); `--white`; the chart palette `--lavender`, `--peach`, `--maroon`, `--sage`, `--mustard` (D17); a neutral grey
  - type: Inter Variable, and sizes in rem (0.75, 0.875 and 2.1875rem, i.e. 12, 14 and 35px) with unitless line heights (1.333, 1.4286, 1.25)
  - spacing in rem (for example 0.5, 1, 1.125, 1.5 and 1.75rem, i.e. 8, 16, 18, 24 and 28px)
  - radii (2, 4, 8px), the 1px border, the 2px focus outline, motion durations
- **Semantic tokens** name a purpose and point to a base token. Components use only these for colours, and each notes the Figma variable it comes from:
  - `--color-text` and `--color-text-muted`: Content/Primary, and Content/Secondary at 60%
  - `--color-border` (Outline/Line solid at 8%), `--color-gridline` (Outline/Line dotted at 16%), `--color-row-hover` (Surface/Secondary at 4%)
  - `--color-page` (Background/Primary), `--color-card` (Background/Secondary)
  - `--color-chart-1` … `--color-chart-5`, `--color-chart-other`, and `--focus-ring`
- **Figma's px values become rem** (px ÷ 16), so the layout grows with the reader's text size. For example, the 264px name column becomes 16.5rem, and the 56px row becomes a 3.5rem *minimum* height. Borders, outlines and dividers stay in px.

**Rules for component CSS** (D41):

- Components reference tokens, never raw colours or one-off sizes. Obvious literals like `0`, `100%`, `1fr` and `50%` stay inline.
- `ui/` components are closed: no `className` or `style` props, so looks change only through props such as `variant`.
- Components have no outer margins; parents space their children with `gap`.
- React Aria parts are styled through their state attributes (`[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`), not `:hover` or `:focus`, because CSS `:hover` sticks after a tap on touch screens. Other elements, such as the `NavTabs` links, put `:hover` inside `@media (hover: hover)` and show focus with `:focus-visible`.
- Every state of every interactive component is styled and shown in the Components tab.
- **Mobile first:** base styles describe the narrowest layout, and `min-width` media queries in rem add to it (we expect one or two, e.g. `48rem`). Container queries apply where a component depends on its own width, such as the chart shortening its month labels.
- Elements containing text get no fixed height (minimum height plus padding instead), long names wrap, and flex or grid children that hold text can shrink.
- Only `transform` and `opacity` are animated, with the properties listed explicitly (never `transition: all`). Non-essential motion lives inside `@media (prefers-reduced-motion: no-preference)`. The row hover shade appears instantly.
- Global CSS holds only the reset, the tokens, the font and base element styles.
- Vite processes CSS with Lightning CSS and our browser targets (recent Chrome, Edge and Firefox; Safari 16.4 and newer), so nesting and other newer syntax work in every supported browser. Styles that depend on CSS order are checked in a production build.

**Font:** `@fontsource-variable/inter/opsz.css`, the Latin file only, served from our own site (D32). `font-optical-sizing: auto` picks the Display cut at 35px. Table numbers use tabular figures.

**Focus:** a 2px outline in the ink colour, drawn inside rows and cells. The table's scroll container gets a left scroll padding equal to the name column's width, so a focused cell never hides behind the pinned column (WCAG 2.4.11).

**Motion:**

- The chevron turns (a transform).
- The faded "new period loading" state and the placeholders' pulse use opacity.
- The chart's columns move briefly on change. That's a small SVG, so it's cheap to repaint.
- All of it is off under reduced motion.

## 6. Accessibility summary

- **Table:** React Aria's treegrid (D14):
  - one Tab stop; ↑ / ↓, → / ←, Home / End and Enter
  - every row announces its level, position and open state
  - the first column is the row header, with a hidden "Name" label
- **Chart:**
  - one Tab stop, ← / → between months, and Escape (D18, D29)
  - each month's label is announced
  - there's a short description, and the table remains the complete, accessible view of the data
- **Colour:** the chart's soft colours are below 3:1 contrast against white. Nothing depends on colour alone, because the legend names every colour and the table has every number (D17).
- **Other controls:**
  - the dropdown, switches and button come from React Aria
  - the tabs are links, with `aria-current`
  - the avatar is decorative
- **Text contrast** (checked): the design's grey text (the ink at 60%) reaches 4.81:1 on the white cards and 4.68:1 on the page, above the 4.5:1 minimum. The main text is 18.4:1.
- **Also covered:**
  - visible focus everywhere, never hidden behind the pinned column
  - reduced motion respected
  - zoom never restricted
  - text grows with the reader's font-size setting (rem units)
  - no page-level sideways scrolling at 375px (D15), also checked at 320px (D41)

## 7. Page weight

Measured as compressed JavaScript over React's own 67 KB (D13, D26, D27, D29–D32):

| Loaded | Adds |
|---|---|
| On every page | React Aria about 84 KB, Recharts about 116, TanStack Query about 10, Zod Mini about 5, wouter about 2: roughly **280 KB** in total with React |
| Only on the Docs tab | react-markdown + remark-gfm, about 48 KB |
| Only on the Components tab | the examples |
| The font | 71 KB, cached after the first visit |

## 8. Testing (D36, provisional)

The plan, the research behind it, and what we deliberately don't test are in [testing-strategy.md](testing-strategy.md). In short:

- **The whole app** in Vitest's simulated browser, with MSW as the only fake. It passes requests on to the real Hono app.
- **A few API tests** with `app.request`, at most one pure-function test, and one or two Playwright tests, written last.
- **Every test is seen failing once**, by breaking one line on purpose.

The list is revisited before tests are written.

## 9. Tools, scripts and CI (D23, D33, D40)

- **Node 24, npm workspaces, TypeScript 6.0.3** in strict mode (not 7.0: D40).
- **Linting and formatting:** ESLint 10 with typescript-eslint (type-aware) and the React Hooks rules, plus Prettier. `eslint-plugin-jsx-a11y` stays only if it works with ESLint 10 (D33).
- **Root scripts:**
  - `dev`: the API and the page together
  - `build`
  - `typecheck`
  - `lint`
  - `format` (and `format:check`)
  - `test`: Vitest
  - `test:e2e`: Playwright against the built app
- **CI (GitHub Actions) on every pull request:** install (`npm ci`), `typecheck`, `lint`, `format:check`, `test`, `build`, `test:e2e`.
- **Vercel:** a preview for every pull request and production from `main`, both with `DEMO_MODE=true`.

## 10. How the work is delivered

- **One branch and pull request per piece of work,** with conventional commit messages. The repo owner merges (D23).
- **Components without a Figma design get a mockup first.** An agent shows all their states, and they're built only after the repo owner approves (D39).
- **Every UI change is checked in the running app** (D41):
  - widths of 320px, 375px and a wide window
  - very large browser text and 200% zoom
  - keyboard only
  - forced colours and reduced motion, emulated in the browser's developer tools
  - the contrast of any new colour pair
  - on a phone: no hover state sticking after a tap
- **The tests follow the agreed list** (§8), after it's revisited.
- **The last stage covers the docs and release:**
  - split and condense `decisions.md` into `docs/decisions/product.md` and `technical.md` (D20)
  - write the README:
    - how to run and test
    - assumptions and open questions, including the data mismatches (D4) and how "overflow" was read (D15)
    - what's next
    - the testing strategy
    - page weight
    - the AI note (D34)
  - make the repo public

## 11. Versions (checked 2026-10-01, D40)

| Area | Packages |
|---|---|
| Runtime and language | Node 24 · TypeScript 6.0.3 |
| Page | React 19.3 · Vite 8.3 + @vitejs/plugin-react 6.1 · react-aria-components 1.21 · Recharts 3.10 · @tanstack/react-query 5.104 · Zod 4.6 (Mini) · wouter 3.13 · react-markdown 10.1 + remark-gfm 4.0 · @fontsource-variable/inter 5.3 |
| Server | Hono 4.13 · @hono/node-server 2.1 |
| Tests | Vitest 5.0 · jsdom 30.1 · @testing-library/react 16.3 · @testing-library/user-event 14.6 · @testing-library/jest-dom 7.0 · MSW 2.15 · Playwright 1.63 · @axe-core/playwright 4.13 |
| Tools | ESLint 10.11 · typescript-eslint 8.71 · eslint-plugin-react-hooks 7.1 · Prettier 3.9 |

## 12. Follow-ups and open questions (for the README)

- How important is keeping what someone was looking at, across reloads, visits and shared links? Then, the period in the address (D28).
- Who sees whose numbers? That decides the first view per viewer (D2) and sharing (D28).
- A picker for exact date ranges (D9).
- A rule for breakdowns with more than five parts, e.g. the top five plus "Other" (D17).
- Moving the component examples to Storybook (D37).
- Upgrading to TypeScript 7 once typescript-eslint supports it, and to MSW 3 once it has settled (D40).
- The data mismatches, confirmed with whoever owns the data (D4).
- Whether server tests are in scope, and the final test list (D36).
