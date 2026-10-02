# Design: the Clients dashboard

The blueprint for building the app: **what** gets built and **how**. The reasons behind each choice are in [decisions.md](decisions.md) (cited as D1, D2, …). Words are defined in [GLOSSARY.md](../GLOSSARY.md), and the feature is explained in plain language in [feature-overview.md](feature-overview.md). Figma values come from the design file (Mockup 2 and its components), read on 2026-09-30.

## 1. Scope

**In scope:**

- **Implementation tab** (the dashboard itself): the stacked column chart and the table whose rows open and close, a period dropdown, and the loading, refreshing and error states.
- **Components tab:** a gallery of our own UI components in their main states (D37).
- **Docs tab:** the decisions, rendered from the repo's Markdown (D20).
- **Top bar:** the tabs, plus the demo settings (two switches and a "Reload" button) on the Implementation tab (D11, D21).
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
├─ api/                    the Vercel function: one small file (§2.3)
├─ packages/contract/      the API's shape and checks, shared by both sides (§3)
├─ apps/api/               the Hono server (§4)
└─ apps/web/               the React app (§5)
```

### 2.2 Boundaries

- `apps/web` and `apps/api` both import `packages/contract`. Neither imports the other.
- In `apps/web`:
  - Only `src/ui/` imports React Aria and Recharts (D13, D29).
  - `src/ui/` never imports from `src/features/` or `src/app/`.
  - Components never call `fetch`; only each feature's data-loading code does.
- The one exception to "neither imports the other": the web app's test setup imports the API app, so the whole-app tests run the real server logic (§8).
- ESLint rules (`no-restricted-imports`) enforce these boundaries, so crossing one fails the lint check.
- The pure rules are plain functions without React: the translation step, the opened rows, the chart model.

### 2.3 Where it runs

| | Page | API |
|---|---|---|
| **Locally** (`npm run dev`) | Vite dev server on port 5173, which forwards `/api/*` to the API | Hono on Node.js, port 3001 |
| **Vercel** (D12) | Static files built from `apps/web` | The same Hono app as a Vercel function |

**Verified first:** how Vercel serves the Hono app next to the static page inside our monorepo. A minimal deploy proved that `/`, `/docs` and `/api/client-counts` all work, before any features were built (D12):

- **The function:** `api/client-counts.js` at the repo root imports the bundled API and exports it. Vercel only looks for functions in a top-level `api/` folder.
- **The bundle:** the API's `build` script (esbuild) packs the API, the shared contract and the data into one JavaScript file, because Vercel can't load a package that exposes TypeScript source.
- **The page:** the web app's build output (`apps/web/dist`), served as static files.
- **One rewrite** in `vercel.json` sends every address outside `/api/` to the page, because the app handles `/components` and `/docs` itself.

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

export const DEMO_HEADER = 'X-Demo';   // values: "slow", "fail", or "slow,fail"
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
- the Vercel entry: `api/client-counts.js` at the repo root, which imports the bundled API and exports it (§2.3, D12)
- `src/data/client-counts.json`: the brief's payload, copied exactly, plus `"avatarUrl": "/avatars/anna-blackwood.jpg"` on Anna Blackwood (D16)
- `src/data/firstMonth.ts`: `FIRST_MONTH = '2024-02'`. The payload has no dates, so the server owns this (D7).
- `src/selectPeriod.ts`: the pure month-picking function

**`GET /api/client-counts?period=<Period>`:**

1. **Demo:**
   - If the `X-Demo` header contains `slow`, wait 2,000 ms.
   - Then, if it contains `fail`, answer `500 { error: { code: 'internal_error', message: 'Simulated failure (demo)' } }`.
   - The header only affects the request that carries it, so one reviewer's switches never touch anyone else's requests (D11).
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
├─ ui/                 our design system (§5.6); each component has .tsx, .module.css and .examples.tsx;
│                      index.ts lists what the rest of the app imports
├─ features/
│   ├─ clients/        ClientsPage, ClientsPlaceholder, ErrorCard, ClientsTable, ClientsChart, PeriodSelect,
│   │                  api/ (fetchClientCounts, useClientCounts), model/ (the pure rules)
│   ├─ demo/           DemoControls (the two switches and Reload), the demo settings' type
│   ├─ gallery/        GalleryPage (loads on demand)
│   └─ docs/           DocsPage (loads on demand)
└─ styles/             tokens.css, global.css
public/avatars/anna-blackwood.jpg   (80×80, from the design, D16)
```

**Imports from `ui/`** (D13): the rest of the app imports components from one place, `import { Card } from "@ui"`. `@ui` is an alias for `src/ui/index.ts`, which lists every component. The alias is declared once, under `paths` in `tsconfig.app.json`, and Vite reads it from there (`resolve.tsconfigPaths`). Inside `ui/`, files import each other by relative path.

### 5.2 Addresses and the top bar (D21, D30, D37)

- **wouter routes:**
  - `/` shows the dashboard, under the tab labelled "Implementation"
  - `/components` shows the Gallery, loaded on demand
  - `/docs` shows the Docs, loaded on demand
  - any other address redirects to `/`
- **`NavTabs` uses wouter's own `Link`,** which handles Cmd/Ctrl-click and accepts `aria-current`. React Aria's `Link` doesn't accept `aria-current` (checked in its types), and no other React Aria links are used, so React Aria's router integration isn't needed.
- **The top bar** holds `NavTabs` (Implementation, Components, Docs) on the left and `DemoControls` on the right, shown only on the Implementation tab. On narrow screens it wraps onto two lines.
- **Browser tab titles:** "Clients · Nevis home task", "Components · Nevis home task" and "Docs · Nevis home task".
- **Favicon:** our own small SVG icon: three rising columns, each stacked in the first three chart colours (D39).

### 5.3 Page state (D28, section 1 of the design review)

`App` holds three pieces of state and passes them down as props. No context and no state library.

- **`period: Period`**, starting at `DEFAULT_PERIOD`.
- **`openedRowIds: string[] | null`**, the opened rows in the order they were opened.
  - `null` means "the default": only the company row is open (D2).
  - The company's id comes from the data, so the effective list is `openedRowIds ?? [tree.id]`.
- **`demoSettings: DemoSettings`**, the two demo switches, both off at the start (D11).

Everything else is worked out from these values and the server's answer, never stored. The one exception: the data hook, `useClientCounts`, remembers whether the last finished request failed (§5.5 says why). Nothing is saved in the browser, so a reload starts fresh. The data itself lives in TanStack Query's cache, above the tabs, so returning from Docs shows it instantly and without a new request (for five minutes, the library's default for data nothing is using).

**The opened-rows rules** (`features/clients/model/openedRows.ts`, pure):

- **Open a row:** move its id to the end of the list, so it's the most recent.
- **Close a row:** remove its id. Rows inside it stay in the list, so reopening the parent shows them still open (React Aria keeps them open while hidden).
- **What the chart shows** (`chartSubject(tree, openedIds)`):
  - It shows the **last id in the list that is visible and has something inside**, split into its children. Visible means all its ancestors are in the list too.
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
  - **`total`**: the subject's name and its own `values` from the server, `{ name, values }`. The label's total line always comes from here and is never summed (D4, D18). A single-colour chart has no `total`: its one series already is the subject.
  - **`description`**: for screen readers, e.g. "Company by branch, Feb 2024 to Jan 2025. Exact numbers are in the table below." With a single month there is no range.

### 5.5 Loading data (D8–D11, D26, D27)

- **`fetchClientCounts({ period, demo, signal })`:**
  - Requests `/api/client-counts?period=…`, adding `X-Demo` only when a switch is on.
  - A non-2xx answer throws `ApiError { status, code }`, reading the error shape when it's there.
  - A 2xx answer is checked with the contract; a failed check throws `InvalidResponseError`.
- **`useClientCounts(period, demoSettings)`:** `useQuery` with these settings:
  - `queryKey: ['client-counts', period]`
  - `placeholderData: keepPreviousData`, so the old numbers stay while a new period loads
  - the demo settings are not part of the key: they don't change which numbers these are, only how the next request behaves. The request reads them when it is made
  - it returns what the page needs: `data`, `isFetching`, `refetch` and `hasLastRequestFailed` (below)
- **The cache** (`createQueryClient()`) changes four of the library's defaults for every request. Together they mean a request is sent only when the page needs numbers it doesn't have or the user asks for them: the first load, a period, "Try again" or "Reload".
  - `retry: false`, because "Try again" is manual and automatic retries would hide the demo's failure for several seconds
  - `refetchOnWindowFocus: false`, so switching windows doesn't quietly trigger reloads
  - `refetchOnMount: false`, so coming back from another tab doesn't either. The page is rebuilt on every return to its tab, and by default that reloads the numbers already on screen: the cards showed at 60% and faded back up on every return (D26)
  - `networkMode: "always"`, so a request made while the browser is offline is tried, fails, and shows the error with "Try again". By default the library parks the request until the connection is back and reports nothing, so the page would keep the old numbers under the new period's name, with no spinner and no error (D26)
- **Demo settings:** `{ slow: boolean, fail: boolean }`, plain state in `App`, handed to the top bar's switches and to `useClientCounts`. A switch only says how the next requests behave; pressing it sends nothing. They aren't saved: a reload of the browser starts with both off.
- **The "Reload" button** next to the switches forgets every loaded answer and asks for the current one again (`queryClient.resetQueries()`). The page then has no numbers, so it shows the first-load placeholders: for two seconds with "Slow responses" on, and ending in the error message with "Fail requests" on. The period and the opened rows are kept. While the error message is on screen it stays, busy, like "Try again" (the rule below).
- **What the dashboard shows:**

| State | What's on screen |
|---|---|
| First load (no data yet) | The real title and dropdown, and placeholders shaped like the chart card and the table card |
| Error (any kind, even if older numbers exist) | "Couldn't load clients" and a "Try again" button (`refetch`), in place of the chart and table. While a request runs, the message stays and the button shows it's busy. |
| Refreshing: a request runs while numbers are on screen (a new period, a return to a period already seen) | The numbers on screen faded, and a small spinner next to the dropdown, which already shows the new choice |
| Loaded | The chart and table |

- **One rule while a request runs: the page keeps what was on screen,** whatever started the request ("Try again" or a new period). Numbers stay, faded, with the spinner. The error message stays too, with its button busy. So after a failure, another period's numbers never come back under the new period's name (D10). "Reload" is the one action that drops the numbers on purpose.
- **The one fact that is remembered** (`hasLastRequestFailed`, kept inside `useClientCounts`, next to the library it makes up for):
  - *Why it's needed:* TanStack Query forgets a failure the moment the next request starts, when that request has no numbers of its own: its `error` goes back to `null`. Judged by the library's `error` alone, pressing "Try again" would replace the message with placeholders (or with an older period's numbers, faded), and the busy button would never be seen.
  - *When it changes:* only while no request is running. At that moment the library's `error` is the truth, and the hook copies it. While a request runs, the hook leaves the fact alone, which is what keeps the message on screen.
  - *How it's used:* the page decides from this fact alone. True means the error message, whatever the library's `error` says at that moment.
  - *Why it's set while rendering, not in an effect:* an effect runs after the page has been drawn, so the wrong picture would be on screen for one frame first. Setting state while rendering is React's documented way to adjust state when something changes: React throws the half-made render away and renders again with the new value, before anything is drawn. The lint rules also forbid setting state in an effect.

### 5.6 Our components (`src/ui/`, D13, D29, D38)

Each has its examples file for the Components tab.

| Component | Style | API (sketch) | Notes |
|---|---|---|---|
| `TreeTable<Row>` | props + render functions | `label`, `rows`, `getRowId`, `getChildren`, `openRowIds: ReadonlySet<string>`, `onRowOpenChange(id, isOpen)`, `columns: { id, header, hideHeader?, isRowHeader?, align?, cell(row) }[]`, `emptyMessage?` | See below |
| `StackedColumnChart` | plain props | `title`, `description`, `columnNames`, `series`, `total?: { name, values }`, `formatValue(value)` | See below; a `<figure>` whose caption is the title |
| `NavTabs` | compound | `<NavTabs label>` with `<NavTabs.Link href>` children | `<nav>` built on wouter's `Link` and current location; the current tab gets `aria-current="page"`; styled per D39 |
| `Select` | plain props | `label`, `hideLabel?`, `items: { id, label }[]`, `value`, `onChange`, `isDisabled?` | React Aria `Select` with its current `value`/`onChange` API (`selectedKey` is deprecated in 1.21); with `hideLabel` the label isn't drawn and becomes the control's `aria-label` |
| `Switch` | plain props | `children` (label), `isSelected`, `onChange`, `isDisabled?` | React Aria's `SwitchField` and `SwitchButton`, the pair its docs show (the library's older single `Switch` export is deprecated in 1.21) |
| `Button` | plain props | `children`, `onPress`, `isPending?`, `isDisabled?` | React Aria `Button`, one style; the busy state keeps focus and is announced (used by "Try again") |
| `Avatar` | plain props | `name`, `src?` | 20px circle; the photo when `src` is given, otherwise initials on a grey tint; hidden from screen readers (D16) |
| `Card` | plain props | `children`, `variant?` (`padded` or `unpadded`) | White, 8px corners; the chart card has padding, the table card has none |
| `Skeleton` | plain props | `width`, `height`, `radius?` (`small`, `medium` or `large`) | Gentle pulse, none with reduced motion |
| `Spinner` | plain props | `label` | The small "new period loading" indicator |

**`TreeTable`** wraps React Aria's `Table` in tree mode (`treeColumn`, `expandedKeys`, `onExpandedChange`, row `onAction`):

- **Ours to handle:**
  - the recursion into `getChildren`
  - the chevron only on rows with children (D5)
  - rows without children ignoring clicks and Enter (the gotcha found in testing, D13)
  - reporting which row opened or closed
  - the visually hidden header label (D14)
  - the pinned first column and the sideways scrolling when the months don't fit (D15, §5.9)
- **Keyboard** behaviour comes from React Aria (D14).
- **Figma values:**
  - rows are 56px high, with padding 18/24/18/16
  - the first column is 264px wide, and the month columns share the rest, right-aligned
  - the header row is 56px, with its labels bottom-aligned at 60% ink
  - borders are 1px, ink at 8%; hover is ink at 4%, on every row as a reading aid, but only rows that can open show the hand cursor (D39)
- **Indentation** is 28px per level, and rows without a chevron keep its 24px (16px icon plus 8px gap). That reproduces the design exactly: Company 0, Branch 28, Advisor 56, Channel 84 + 24 = 108, where channel names line up with the advisor names above them.
- **The chevron** is the design's path `M6.5 4.5L10 8L6.5 11.5` (16px, 1.5px stroke, square caps), pointing right and turned 90° when open. It's a decorative icon, hidden from screen readers; the row itself is the control (D13).
- **The gap between columns** (16px in Figma) is 8px on each side of every cell, so the outline of a focused cell doesn't touch its number. Names and numbers sit exactly where Figma puts them.
- **Numbers** in the columns after the name use tabular figures, so digits line up from row to row. Names keep the font's normal figures.
- **With no rows,** the table shows its header and one row with `emptyMessage` in 60% ink, centred in the visible part of the table even when it is scrolled sideways. The dashboard's table always has the company row, so only the Components tab shows this state.

**`StackedColumnChart`** wraps Recharts (D29):

- **Figma look:**
  - each whole column is rounded at 4px (`BarStack`)
  - no gaps between parts
  - 24px between columns
  - five dotted gridlines (1px dash, 6px gap, ink at 16%) at "nice" round values
  - y labels 12px at 60% ink, 26px wide
  - x labels 12px, centred
  - the legend centred below: 8×8 squares with 2px corners. It is always shown, also for a single series, so the chart keeps its height (D19)
  - columns stop growing at the design's width on very wide screens
- **Keyboard:** Recharts' built-in layer gives one Tab stop, ← / → between months, and Escape to hide the label. We add no keyboard code of our own (D29).
- **The label** is drawn by the chart itself, from its data:
  - the column's name ("May 2024"), then the total line if a `total` was given (its name and its number), then one line per series: its colour square, its name and its number
  - names on the left and every number in one right-aligned column, so a total sits right above its parts (Company 301 over 156, 87 and 36) and a mismatch is easy to see
  - the chart never adds anything up: the total is the caller's own number (D4). With no `total`, the label is the column's name and the series
  - numbers are written by the caller's `formatValue`, because the chart can't know how the app writes numbers ("1,234", and a dash for a missing one)
  - the same lines are also placed in an always-present, visually hidden region marked `role="status"`, so screen readers hear the active column. Recharts adds announcements only to its default label, so we add them ourselves (D29)
- **The chart's name** for screen readers is its visible caption (`aria-labelledby`), and `description` becomes the picture's `<desc>`. Recharts' own `title` is not used: browsers show it as their own tooltip on hover.
- **A changed list of column names builds the chart fresh** (a `key` made from the names). Recharts keeps the hovered position in pixels from the old columns, so after a period change the band behind the active column was drawn in the old place until the pointer moved (D29).
- **The narrow look** depends on the chart's own width, not the page's: when a column has less than 64px of space, the chart tilts the names under the columns (the same "Feb 2024", at 60° and a little smaller, 11px) and puts 0.5rem between columns. Every column keeps its name (D15). The chart itself knows nothing about months: it gets one name per column. With twelve months that starts below a window of about 870px.

### 5.7 Feature components

- **`ClientsPage`:**
  - the title row: an `h1` "Clients", with `PeriodSelect` and the `Spinner` (while refreshing) on the right, moving under the title on narrow screens (D15)
  - then the states from §5.5
  - it turns the answer into the tree, works out the opened rows and the chart's subject, and hands them to `ClientsChart` and `ClientsTable`
- **`ClientsPlaceholder`:** the first-load picture: a chart card and a table card holding grey blocks, with its own CSS file for their sizes (§5.9).
- **`ErrorCard`:** the card with "Couldn't load clients" and the "Try again" button. Props: `isBusy` and `onRetry`.
- **`ClientsTable`:**
  - `TreeTable` with the label "Client counts per month"
  - a name column (an `Avatar` for advisors, then the name; the header is visually hidden)
  - one column per month ("Feb 2024")
  - numbers formatted with `Intl.NumberFormat('en-US')`; `TreeTable` itself sets tabular figures, so the digits line up
  - below 40rem, channel names get 1.25rem (the avatar's width) of extra indent, so they still start under the advisor's name. `TreeTable` can't do this: it knows a row's level, not that advisors have avatars
- **`ClientsChart`:**
  - a padded `Card` holding `StackedColumnChart`, whose title is the caption (top-left, 14px, D19)
  - a chart whose months are the server's list, each through `formatMonth`
  - it passes data only: the series, the subject's own total (when the chart is split) and `formatCount` for the numbers. The chart draws the label (§5.6, D18)
- **`PeriodSelect`:** the `PERIODS` from the contract, with the labels "Last 12 months", "Last 6 months", "Last 3 months" and "Last month" (D9).
- **`DemoControls`:** a group labelled "Demo settings" with the switches "Slow responses" and "Fail requests" and the "Reload" button (D11).
- **`DocsPage`:**
  - loads `react-markdown` and `remark-gfm` on demand and renders `docs/decisions/product.md` and `docs/decisions/technical.md` as Markdown files imported at build time (D20, D31)
  - until the final docs stage creates those two files, it renders `docs/decisions.md`
  - Vite is allowed to read the repo-root `docs/` folder
- **`GalleryPage`:** collects every `src/ui/**/*.examples.tsx` with Vite's `import.meta.glob`, and shows one section per component with its named examples, in the order the file lists them. A file whose `meta` says `wide` gets the whole row for each example, straight in the card without the padded stage; the table uses that.

### 5.8 Styles (D25, D32, D39, D41)

**Tokens** live in `styles/tokens.css` on `:root`: one layer, named by purpose, holding the final values. Only what two or more components share lives there; a variable with a single user is declared in that component's own CSS file (see the rules below). This list says which Figma variable each value comes from (D25, D41); the CSS itself has no comments:

- **Colours:**
  - `--color-text`: #141413, Content/Primary
  - `--color-text-muted`: the ink at 60%, Content/Secondary
  - `--color-border`: the ink at 8%, Outline/Line solid
  - `--color-gridline`: the ink at 16%, Outline/Line dotted (declared in the chart's own CSS file: only the chart uses it)
  - `--color-row-hover`: `#f6f6f6`, Surface/Secondary. That's the ink at 4% on white, written as an opaque colour so the pinned table column covers what scrolls under it
  - `--color-page`: #F7F5ED, Background/Primary
  - `--color-card`: #FFFFFF, Background/Secondary
  - the chart's five colours (D17): `--color-chart-lavender`, `-peach`, `-maroon`, `-sage` and `-mustard`, declared in the chart's own CSS file while only the chart uses them. A neutral grey, `--color-chart-grey`, is there for a sixth or later part
- **Type:** Inter Variable, and sizes in rem (0.75, 0.875 and 2.1875rem, i.e. 12, 14 and 35px) with unitless line heights (1.333, 1.4286, 1.25).
- **Spacing** in rem, for example 0.5, 1, 1.125, 1.5 and 1.75rem (8, 16, 18, 24 and 28px).
- **Other:** radii (2, 4, 8px), the 1px border, the focus ring (2px, ink), and `--duration-fast` (150ms), shared by the switch's thumb, the table's arrow and the dashboard's fade.
- **Figma's px values become rem** (px ÷ 16), so the layout grows with the reader's text size. For example, the 264px name column becomes 16.5rem, and the 56px row becomes a 3.5rem *minimum* height. Borders, outlines and dividers stay in px.

**Rules for component CSS** (D41):

- `:root` holds only the variables that two or more components share: colours, text sizes, spacing, radii, borders and the focus ring. A variable that a single component uses is declared in that component's CSS file, on the component's own element: for example `--color-pressed` in the button's file and `--duration-spin` in the spinner's. It moves to `:root` when a second component needs it. A one-off size is written where it's used, such as the table header's height. Colours are always variables, never written straight into a property.
- `ui/` components are closed: no `className` or `style` props, so looks change only through props such as `variant`.
- Components have no outer margins; parents space their children with `gap`.
- React Aria parts are styled through their state attributes (`[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`), not `:hover` or `:focus`, because CSS `:hover` sticks after a tap on touch screens. Other elements, such as the `NavTabs` links, put `:hover` inside `@media (hover: hover)` and show focus with `:focus-visible`.
- Every state of every interactive component is styled and shown in the Components tab.
- **Desktop first:** base styles follow the design's desktop layout, and a few media queries in rem adjust narrow screens: the dropdown moves under the title, the top bar wraps, and the table scrolls sideways (D15). The chart tilts its month labels based on its own width, which Recharts reports.
- Elements containing text get no fixed height (minimum height plus padding instead), long names wrap, and flex or grid children that hold text can shrink.
- Only `transform` and `opacity` are animated, with the properties listed explicitly (never `transition: all`). Non-essential motion lives inside `@media (prefers-reduced-motion: no-preference)`. The row hover shade appears instantly.
- Global CSS holds only the reset, the tokens, the font and base element styles.
- Vite processes CSS with Lightning CSS and our browser targets (recent Chrome, Edge and Firefox; Safari 16.4 and newer), so nesting and other newer syntax work in every supported browser. Styles that depend on CSS order are checked in a production build.

**Font:** `@fontsource-variable/inter/opsz.css`, the Latin file only, served from our own site (D32). `font-optical-sizing: auto` picks the Display cut at 35px. Table numbers use tabular figures.

**Focus:** a 2px outline in the ink colour, drawn inside rows and cells, with the card's corner radius so the card's rounded corners don't cut it. Every table cell after the name column has a left scroll margin equal to the name column's width, so a focused cell never hides behind the pinned column (WCAG 2.4.11). A focused row draws its outline from the pinned name cell, as wide as the scrolling box, because an outline on the row itself is covered by that cell.

**Motion:**

- The chevron turns (a transform).
- The fade while refreshing (150ms, to 60% and back) and the placeholders' pulse use opacity.
- The chart's columns move briefly on change. That's a small SVG, so it's cheap to repaint.
- All of it is off under reduced motion.

### 5.9 The look of the new elements (approved 2026-10-01)

Figma covers the title, the chart card and the table card. Everything else was mocked up in all its states and approved by the repo owner (D39). The mockup itself is a local working file and isn't in the repo; these are its values. "Ink" is `#141413`.

**Extra tokens:**

- `--color-control-border`: ink at 16%, the line around controls and floating cards. Figma's own line (ink at 8%) nearly disappears on a white control inside a white card.
- `--color-tint`: ink at 8%, for the initials circle, the placeholders and inline code.
- `--shadow-floating`: `0 0.25rem 1rem` in ink at 10%, shared by the dropdown's list and the chart label's card.
- `--control-height`: 2.25rem (36px).
- `--color-chart-grey`: `#c7c7c6`, the chart's colour for a sixth or later part. It lives with the other chart colours in the chart's CSS file.

**Variables with a single user so far,** each declared in its component's CSS file (§5.8):

- Button: `--color-pressed`, ink at 8%.
- Switch: `--color-switch-off`, ink at 60%.
- Chart: its five colours and the gridline colour (§5.8).
- Spinner: `--duration-spin`, 800ms per turn.
- Placeholder: `--duration-pulse`, 1s per pulse.
- Clients page: `--opacity-refreshing`, 0.6.
- Components page: `--space-32` (2rem between sections), and `--font-size-heading` with `--line-height-heading` (the 20/28 section names).

**Top bar and tabs:**

- A white strip, at least 3rem high, with 1rem side padding and a 1px line below.
- Tabs are 14/20 text links, 1.5rem apart, each as high as the bar.
- The current tab is full ink with a 2px ink underline on the bar's bottom edge. The others are ink at 60%, and full ink on hover.
- Keyboard focus is a 2px ink outline around the word.
- The demo group sits on the right in 12/16 text: the label "Demo settings" at 60% ink, then the two switches and the "Reload" button (the standard button, in the group's text size).

**Switch:**

- A 1.75 × 1rem pill with a 0.75rem white thumb. Off is ink at 60%, which meets the 3:1 contrast rule for controls; on is full ink.
- Hover adds a 3px ring in ink at 16%. Focus is the 2px ink outline, 2px away.

**Period dropdown:**

- The control is white, at least 10rem wide and 2.25rem high, with the control border, 0.5rem corners, 14/20 text and a 16px down chevron drawn like the table's.
- Hover, and while open: the row-hover shade.
- The list floats 0.25rem below, as wide as the control, with the floating shadow. Options are 2.25rem high; the selected one has a check mark, the one under the pointer gets the row-hover shade, and the one under the keyboard also gets the focus outline.

**Spinner:** a 1rem ring with a 1.5px line; a quarter of it is ink at 60% and the rest much fainter. It turns once per 0.8s and stands still under reduced motion. It sits 0.75rem from the dropdown, placed so the dropdown doesn't move when it appears.

**Button:** white, at least 2.25rem high, with the control border and 0.5rem corners. Hover is the row-hover shade, pressed is ink at 8%, and busy shows the spinner before the label.

**Chart label:**

- A white card, at least 10.5rem wide, with the control border, 0.5rem corners, 0.75rem padding and the floating shadow.
- It lists the month (12/16 at 60% ink), the row's name with its own total (14/20, full ink), then each part: its 8×8 colour square, its name at 60% ink and its number in full ink. All numbers share one right-aligned column, in tabular figures.
- The active column gets a band in the row-hover shade behind it, as high as the plot.

**Disabled controls** (button, switch, dropdown): the whole control at half opacity, with the normal arrow cursor and no hover or pressed shade. In forced-colours mode they use the system's grey text colour.

**Avatar initials:** 9px text at weight 500 in full ink, on ink at 8%.

**First load:** the title and dropdown are real. The chart and table are white cards holding grey blocks (ink at 8%, 0.25rem corners) that fade gently, sized so nothing jumps when the data arrives. Twelve month columns and four rows (the company and three branches) are drawn. The header is two lines high wherever the real month headers wrap.

**Refreshing:** the chart and table cards fade to 60% opacity over 150ms (at once under reduced motion), with the spinner by the dropdown. They stay usable.

**Error:** one white card with "Couldn't load clients" and the "Try again" button below it, centred, with 4rem of padding above and below. Screen readers announce it when it appears (`role="alert"`).

**Components page:** a "Components" title with a short intro under it (what the page is, and why it isn't Storybook; at most 44rem wide), then one section per component: its name at 20/28, and its examples in a grid of white cards, each with a 12/16 caption at 60% ink above it.

**Docs page:** one readable column, at most 44rem wide. Text is 16/26, the title 35/44, headings 20/28 at weight 600. Links are underlined. Tables are 14px with thin row lines and scroll inside their own box.

**The table when space is tight:**

- A month column never gets narrower than 4rem (64px). When "Feb 2024" doesn't fit on one line, the header wraps to "Feb" over "2024". All headers wrap together, once a column has less than 4.25rem for its text; left alone, they would wrap one by one, because "Jul 2024" is narrower than "May 2024". So all twelve months fit without sideways scrolling down to a window about 1100px wide; below that the table scrolls inside its card, with the names pinned.
- Below 40rem (640px), the name column is 10.5rem (168px) with a 1px line on its right edge, indents are 0.5rem per level, and names may wrap onto two lines. At 375px that shows two whole months and part of a third, which hints at the scrolling.

**The rest of the page on narrow screens:** below 47rem the top bar goes onto two lines (tabs, then the demo group), because that is where its two halves stop fitting on one line (below about 28rem the "Reload" button wraps under the switches); below 40rem the dropdown sits under the title. The chart's narrow look follows its own width (§5.6).

**Favicon:** three rising columns on a 16 × 16 grid, each stacked in lavender, peach and maroon.

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
  - the error message is announced when it appears; the spinners are named "Loading"; the first-load placeholders are hidden from screen readers
- **Text contrast** (checked): the design's grey text (the ink at 60%) reaches 4.81:1 on the white cards and 4.68:1 on the page, above the 4.5:1 minimum. The main text is 18.4:1.
  - The one exception: while refreshing, the cards are at 60% opacity, so for as long as the request runs the grey text is at 2.34:1 (names and numbers stay at 4.93:1). Accepted: it's the approved look, and any fade strong enough to see takes the grey text below 4.5:1 (D10).
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
| On every page | React Aria about 84 KB, Recharts about 116, TanStack Query about 10, Zod Mini about 5, wouter about 2: roughly **280 KB** in total with React. Measured with the dashboard built: 276 KB, in four files (React 68, React Aria 82, Recharts 101, and 24 for our own code together with TanStack Query, Zod Mini and wouter) |
| Only on the Docs tab | react-markdown + remark-gfm, about 48 KB |
| Only on the Components tab | the examples |
| The font | 71 KB, cached after the first visit |

## 8. Testing (D36, provisional)

The plan, the research behind it, and what we deliberately don't test are in [testing-strategy.md](testing-strategy.md). In short:

- **The whole app** in Vitest's simulated browser, with MSW as the only fake. It passes requests on to the real Hono app.
- **A few API tests** with `app.request`, at most one pure-function test, and one Playwright test, written last.
- **Verified before planning:**
  - Recharts draws its bars and handles its keyboard in the simulated browser, given a small stand-in for the browser's size-watching API, so the chart test (#8) doesn't need a real browser.
  - MSW passes the simulated browser's requests to the real Hono app.
- **Every test is seen failing once**, by breaking one line on purpose.

Testing is the last step of the build, and the list is decided then.

## 9. Tools, scripts and CI (D23, D33, D40)

- **Node 24, npm workspaces, TypeScript 6.0.3** in strict mode (not 7.0: D40).
- **No comments in the code,** config files included. The code has to be clear by itself, and the reasons behind settings that aren't obvious are recorded in [decisions.md](decisions.md) (D33). The one exception is the demo behaviour in the API.
- **Linting and formatting:** ESLint 10 with typescript-eslint (type-aware) and the React Hooks rules, plus Prettier. `eslint-plugin-jsx-a11y` isn't used: its latest release supports ESLint only up to version 9 (checked 2026-10-01, D33).
- **Root scripts:**
  - `dev`: the API and the page together, run side by side with `concurrently` (the API through `tsx watch`)
  - `build`
  - `typecheck`
  - `lint`
  - `format` (and `format:check`)
  - `test`: Vitest
  - `test:e2e`: Playwright against the built app
- **CI (GitHub Actions) on every pull request:** install (`npm ci`), `typecheck`, `lint`, `format:check`, `test`, `build`, `test:e2e`. Once the repo is public, a rule on `main` blocks merging until these checks pass (D23).
- **Vercel:** a preview for every pull request and production from `main`.

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
- **Tests come last** (§8): the list is agreed at that step, then the tests are written.
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
- A message when a tab's code can't be loaded. The Components and Docs tabs load their code when first opened; if that fails (offline, or an old page after a new release), the page goes blank instead of saying so. Found while checking the dashboard offline.
- Upgrading to TypeScript 7 once typescript-eslint supports it, and to MSW 3 once it has settled (D40).
- The data mismatches, confirmed with whoever owns the data (D4).
- Whether server tests are in scope, and the final test list (D36).
