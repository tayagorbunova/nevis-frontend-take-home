# Implementation plan: the Clients dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build what [design.md](design.md) describes: the dashboard (the chart, the table whose rows open and close, the period dropdown, loading and error states), the Components and Docs tabs, the API, hosting and tests.

**Architecture:** An npm-workspaces monorepo:

- `packages/contract` holds the API's shape as Zod Mini schemas, shared by both sides.
- `apps/api` is a Hono app, run by Node.js locally and as a Vercel function.
- `apps/web` is React + Vite. Its `ui/` folder is our small design system, built on React Aria and Recharts; `features/` build the pages from it.

**Tech stack:** React 19, Vite 8, React Aria Components, Recharts 3, TanStack Query 5, wouter, Zod Mini, Hono 4, TypeScript 6.0, Vitest 5 with Testing Library and MSW 2, Playwright. Exact versions are in design §11.

**How detailed this plan is:** each task says what it delivers, which files it touches, the names and types other tasks rely on, the facts already verified, and how to check the result. It doesn't spell out the code: whoever implements a task writes it, following the design sections the task points to. "§" refers to [design.md](design.md), "D" to [decisions.md](decisions.md).

**How it runs:** one task at a time. After each task, the repo owner reviews its changes before the next one starts.

## Before starting

PR #1 (the docs and this plan) is merged, and every task branch starts from `main`.

## Global constraints

Every task follows these, on top of its own requirements.

- **Versions:** Node 24; TypeScript `~6.0.3`, because typescript-eslint 8.71 requires a version below 6.1; MSW `~2.15.0`, not 3; everything else as in §11.
- **TypeScript:** strict mode plus `noUncheckedIndexedAccess`. No `any`, and no `!` assertions to silence an error.
- **Boundaries (§2.2), enforced by ESLint from Task 1:**
  - The apps import `@nevis/contract` and never each other. The one exception: the web app's test setup (`apps/web/src/test/`, from Task 15) imports the API app.
  - Only `src/ui/` imports `react-aria-components`, `react-aria` and `recharts`.
  - `src/ui/` never imports from `src/features/` or `src/app/`.
  - Only data-loading code (`features/*/api/`) calls `fetch`.
- **The UI only presents (Principles, D4, D7):** a total shown anywhere is a row's own number from the server, and months come from the server's answer. Nothing is summed, fixed or assumed.
- **Words (D6):** our code says "advisor" and "channel". Only the contract and `toClientTree` mention `employees` and `channels`.
- **Styles (§5.8, D41):**
  - use tokens only, and rem units (px only for borders, outlines and dividers)
  - `ui/` components are closed: no `className` or `style` props, no outer margins
  - React Aria parts are styled through their state attributes; `:hover` appears only inside `@media (hover: hover)`
  - animate only `transform` and `opacity`, with motion off under reduced motion
- **Components without a Figma design** follow the mockup approved in Task 5.
- **Copy:** exactly as written in §5.2, §5.5 and §5.7, e.g. "Couldn't load clients", "Try again", "Demo settings", "Slow responses", "Fail requests", "Client counts per month".
- **Tests:** none before Task 15, where the list is agreed with the repo owner and then written.
- **Every task ends green:** `npm run typecheck && npm run lint && npm run format:check && npm run build` (plus the tests, once Task 15 adds them), then a commit with a conventional message.
- **Every UI change gets the §10 check:**
  - widths of 320px, 375px and a wide window
  - large text and 200% zoom
  - keyboard only
  - forced colours and reduced motion
  - the contrast of any new colour pair
  - a phone
- **Git:**
  - one branch and pull request per group below, with a description of one to three plain lines
  - the repo owner merges
  - nothing from `private/` is ever committed

## Verified before planning

- **React Aria 1.21's tree table** (D13, D14):
  - It renders `<table role="treegrid">`. Rows carry `aria-level` and `aria-posinset`/`aria-setsize`, and `aria-expanded` only when they have children.
  - Clicking a `<Button slot="chevron">` fires `onExpandedChange`.
  - Clicking a row or pressing Enter fires the row action, **for rows without children too**, so only rows with children may toggle.
  - ← closes an open row; on a closed row it moves to the parent.
- **React Aria's `Select`** uses `value`/`onChange`; `selectedKey` is deprecated.
- **React Aria's `Link`** doesn't accept `aria-current`, so `NavTabs` uses wouter's `Link`. wouter's `Link` passes `aria-current` through and ignores clicks with modifier keys.
- **Recharts 3.10:**
  - `<BarStack radius={4}>` rounds each whole column.
  - Its keyboard layer is on by default: the SVG is one Tab stop (`tabindex="0"`, `role="application"`), and ← / → move the label.
  - Passing `active={false}` to `Tooltip` hides the label, which is how Escape works.
  - `isAnimationActive` defaults to `'auto'`, which respects reduced motion.
- **Tooling:** `eslint-plugin-jsx-a11y` 6.10 supports ESLint only up to version 9, so it isn't installed (D33).
- **For the testing step (Task 15):**
  - Recharts draws its bars and handles its keyboard in the simulated browser (jsdom), given a `ResizeObserver` stub.
  - MSW 2.15 can send the simulated browser's requests, headers included, to the real Hono app: `setupServer(http.all('*/api/*', ({ request }) => app.fetch(request)))`.

## Pull requests

| Pull request | Tasks |
|---|---|
| Scaffold and hosting | 1, 2 |
| Contract and API | 3, 4 |
| The approved mockup (docs only) | 5 |
| App shell and simple components | 6, 7 |
| Tree table and chart | 8, 9 |
| Dashboard | 10–13 |
| Docs tab | 14 |
| Tests | 15 |
| Release | 16, 17 |

---

### Task 1: Scaffold the monorepo and tooling

**Delivers:** an empty but working monorepo. `npm run dev` shows a placeholder page, and `/api/client-counts` answers from a stub route through Vite's proxy. CI runs the checks on every pull request.

**Files:**

- Root: `package.json`, `package-lock.json`, `.nvmrc` (`24`), `tsconfig.base.json`, `tsconfig.json` (for the TypeScript files at the root), `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.github/workflows/ci.yml`
- `apps/api/`: `package.json`, `tsconfig.json`, `src/app.ts`, `src/server.ts`
- `apps/web/`: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx` (a placeholder), `src/vite-env.d.ts`

**Produces:**

- Package names `@nevis/api` and `@nevis/web` (`@nevis/contract` comes in Task 3).
- `@nevis/api` exports its TypeScript source directly (`"exports": { ".": "./src/app.ts" }`), with no build step, because Vite, tsx and TypeScript all read the source.
- `createApp({ demoMode }: { demoMode: boolean })` in `apps/api/src/app.ts`. For now it has one stub route, `GET /api/client-counts`, answering `{ demoMode }`.
- The root scripts from §9: `dev`, `build`, `typecheck`, `lint`, `format` and `format:check`. (`test` and `test:e2e` come with Task 15.)

**Settings to get right:**

- `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `isolatedModules`, `module: esnext`, `moduleResolution: bundler`, `target: es2023`, `resolveJsonModule`, `noEmit`, `skipLibCheck`.
- The web app's tsconfig split follows Vite's own template: `tsconfig.app.json` for browser code, `tsconfig.node.json` for config files, so Node-only code can't slip into the page.
- `npm run dev` runs both apps with `concurrently`:
  - the API with `tsx watch src/server.ts`, on port 3001, always in demo mode locally (§2.3)
  - Vite on port 5173, whose `server.proxy` and `preview.proxy` send `/api` to port 3001
- Vite uses `css.transformer: 'lightningcss'`. Check that the default build target matches §5.8 (recent Chrome, Edge and Firefox; Safari 16.4 and newer), and set `build.target` if it doesn't.
- ESLint (flat config):
  - `@eslint/js` recommended
  - typescript-eslint's `strictTypeChecked` and `stylisticTypeChecked`, with `parserOptions.projectService: true`, and type-aware rules turned off for plain `.js` config files (`disableTypeChecked`)
  - `eslint-plugin-react-hooks` recommended, for the web app
  - `no-restricted-imports` rules for the boundaries in the Global constraints
  - no formatting rules: Prettier formats
- Prettier: `singleQuote: true`, `printWidth: 100`. It ignores `package-lock.json`, `dist`, `coverage` and `private`.
- CI runs on `pull_request`: `actions/setup-node` with the version from `.nvmrc` and the npm cache, `npm ci`, then `typecheck`, `lint`, `format:check` and `build`.

**Steps:**

- [ ] Create the files and run `npm install`.
- [ ] Check that all the root scripts pass.
- [ ] Check that `npm run dev` shows the placeholder at `http://localhost:5173`, and that `curl http://localhost:5173/api/client-counts` answers `{"demoMode":true}`.
- [ ] Check that a boundary rule fires: import `recharts` in `main.tsx`, see `npm run lint` fail, undo.
- [ ] Commit `chore: scaffold the monorepo and tooling`.

### Task 2: Prove the Vercel setup

**Delivers:** a deployed preview where `/`, `/docs` and `/api/client-counts` work, before any features exist (§2.3).

**The repo owner's part** (Claude never handles the account):

- create the Vercel account, signing in with GitHub
- import the repo
- set `DEMO_MODE=true` for Production and Preview

**Files:**

- `api/client-counts.ts`: `export const GET = handle(createApp({ demoMode: process.env.DEMO_MODE === 'true' }))`, with `handle` from `hono/vercel`
- `vercel.json`:
  - `buildCommand: "npm run build"`
  - `outputDirectory: "apps/web/dist"`
  - one rewrite sending everything except `/api/…` to `/index.html`, because the app handles `/components` and `/docs` itself
- the root `tsconfig.json` now includes `api/`
- Node 24 comes from `engines` in the root `package.json`

**Steps:**

- [ ] Push the branch, open the pull request and wait for the preview.
- [ ] Check on the preview: `/` and a direct visit to `/docs` show the page, and `/api/client-counts` answers `{"demoMode":true}`.
- [ ] **If the function fails to start:** Vercel compiles a function's TypeScript files one by one, so imports without file extensions, or a workspace package whose entry is a `.ts` file, can fail at runtime. Try in this order:
  1. explicit `.js` extensions on the relative imports in `apps/api` (and later in `packages/contract`)
  2. bundling the function during the build and publishing it through Vercel's Build Output API

  Record what worked as a short update under D12.
- [ ] Commit `chore: deploy to Vercel`.

### Task 3: The contract

**Delivers:** `packages/contract` (`package.json`, `tsconfig.json`, `src/index.ts`): the API's shape and its checks, written with Zod Mini (§3, D27). It exports its source like `@nevis/api` does, and both apps depend on it.

**Produces** (exact names):

- `PERIODS`, `periodSchema`, `type Period`, `DEFAULT_PERIOD` (`'last-12-months'`)
- `DEMO_HEADER` (`'X-Demo'`)
- `apiChannelSchema`, `apiEmployeeSchema`, `apiBranchSchema`, `apiCompanySchema`, and their types:
  - `ApiChannel`
  - `ApiEmployee`, with optional `avatarUrl` and `channels`
  - `ApiBranch`, with optional `employees`
  - `ApiCompany`, with optional `branches`
- `clientCountsResponseSchema`, `type ClientCountsResponse` (`{ months: string[]; company: ApiCompany }`)
- `apiErrorBodySchema`, `type ApiErrorBody`, `type ApiErrorCode` (`'invalid_period' | 'internal_error'`)

**Rules the schemas enforce:**

- values are whole numbers of zero or more (`z.int().check(z.nonnegative())`)
- months match `^\d{4}-(0[1-9]|1[0-2])$`
- the response check (`.check(z.refine(…))`) confirms that every row, at every level, has exactly one value per month

**Steps:**

- [ ] Write the schemas; the types come from `z.infer`.
- [ ] Commit `feat(contract): add the API contract`.

### Task 4: The API

**Delivers:** `GET /api/client-counts?period=…`, exactly as §4 describes.

**Files:** `apps/api/src/app.ts`, `src/selectPeriod.ts`, `src/data/client-counts.json`, `src/data/firstMonth.ts`, `src/server.ts`.

**Produces:**

- `createApp({ demoMode })`, now real
- `selectPeriod(company: ApiCompany, firstMonth: string, period: Period): ClientCountsResponse`
- `FIRST_MONTH = '2024-02'`

**Notes:**

- `client-counts.json` is the payload from the brief (`private/Nevis Frontend Home Assignment.pdf`), copied exactly, plus `"avatarUrl": "/avatars/anna-blackwood.jpg"` on Anna Blackwood (D16).
- `app.ts` stays runtime-neutral, because the web app's tests may run it too: no `node:` imports, and a `setTimeout` promise for the 2-second wait. `server.ts` is the only Node-specific file.
- One middleware sets `Cache-Control: no-store` on every answer. Error bodies are checked against the contract with `satisfies ApiErrorBody`.
- `selectPeriod`:
  - lists the months from `FIRST_MONTH` and the number of values
  - keeps the last 12, 6, 3 or 1
  - trims every row, at every level, to match
  - changes nothing else (D4)

**Steps:**

- [ ] Implement it.
- [ ] Check by hand with `curl -i` against `http://localhost:3001/api/client-counts`:
  - no period: months `2024-02` to `2025-01`, and the data exactly as given
  - `?period=last-3-months`: months `2024-11` to `2025-01`, with every row trimmed to 3 values
  - `?period=nope`: 400 with `invalid_period`
  - `-H 'X-Demo: slow, fail'`: 500 after 2 seconds
  - every answer has `Cache-Control: no-store`
- [ ] Commit `feat(api): serve client counts per period`.

### Task 5: Mockups of the new components

**Delivers:** an approved look for everything Figma doesn't cover (D39).

- [ ] Dispatch an agent to build `docs/mockups/new-components.html`: plain HTML and CSS with the design's tokens (§5.8), showing every state of:
  - the top bar: the tabs (current, other, hover, keyboard focus) and the demo switches (off, on, hover, focus)
  - the period dropdown (closed, open with the selected option, focus) and the spinner next to it
  - the button: default, hover, pressed, focus, busy
  - the chart label, e.g. May 2024 for "Company by branch"
  - the avatar with initials, next to the one with a photo
  - the first-load placeholders, the faded refreshing state and the error state
  - the Components and Docs page layouts
  - the dashboard at 375px
- [ ] Show it to the repo owner and adjust it until they approve.
- [ ] Commit `docs: add the approved mockup of the new components`. Tasks 6–14 follow it.

### Task 6: Styles, the app shell and the gallery

**Delivers:** the page frame. That's the font, the tokens and global styles, the top bar with its tabs, and the three addresses. The Components tab lists every `*.examples.tsx` file; it stays nearly empty until Task 7.

**Files:**

- `apps/web/src/styles/tokens.css`, `src/styles/global.css`, `src/main.tsx`
- `src/app/App.tsx`, `App.module.css`, `TopBar.tsx`, `TopBar.module.css`
- `src/ui/NavTabs/NavTabs.tsx`, `NavTabs.module.css`, `NavTabs.examples.tsx`; `src/ui/examples.ts`
- `src/features/gallery/GalleryPage.tsx`, `GalleryPage.module.css`
- placeholders, filled in later: `src/features/clients/ClientsPage.tsx` (Task 13), `src/features/docs/DocsPage.tsx` (Task 14)

**Produces:**

- The tokens named in §5.8, plus `--color-row-hover: #f6f6f6`: the ink at 4% on white, precomputed as an opaque colour so the pinned table column covers what scrolls under it.
- `App` routes `/`, `/components` and `/docs`, and redirects any other address to `/`. The last two pages load on demand (`lazy`).
- `NavTabs` and `NavTabs.Link` (§5.6), built on wouter's `Link`. A link gets `aria-current="page"` when the location equals its `href`.
- The examples format: `type ExamplesMeta = { title: string }`. Each `*.examples.tsx` exports `meta` and one named component per state, like Storybook stories. `GalleryPage` loads the files with `import.meta.glob('../../ui/**/*.examples.tsx', { eager: true })` and shows one section per file.
- Browser tab titles (§5.2) with React 19's `<title>`. Check which title wins over the one in `index.html`, and remove that one if needed.

**Steps:**

- [ ] Build it. Check the tabs by keyboard and at 320px and 375px, and check that Back and Forward work.
- [ ] Commit `feat(web): add the app shell, tokens and components gallery`.

### Task 7: The simple components

**Delivers:** `Card`, `Button`, `Avatar`, `Skeleton`, `Spinner`, `Switch` and `Select`, each in `src/ui/<Name>/` with `.tsx`, `.module.css` and `.examples.tsx`, as in §5.6 and the approved mockup.

**Produces** (props):

- `Card`: `children`, `variant?: 'padded' | 'flush'`. The chart card has padding, the table card has none.
- `Button`: `children`, `onPress`, `isPending?`. React Aria's busy state keeps the button focusable and tells screen readers it's busy; "Try again" uses it.
- `Avatar`: `name`, `src?`. It shows the photo, or the initials of the first and last words; it's hidden from screen readers.
- `Skeleton`: `width`, `height`, `radius?`. Its pulse is off under reduced motion.
- `Spinner`: `label`. A React Aria `ProgressBar` with `isIndeterminate`.
- `Switch`: `children`, `isSelected`, `onChange(isSelected: boolean)`.
- `Select<K extends string>`: `label`, `hideLabel?`, `items: readonly { id: K; label: string }[]`, `value: K`, `onChange(value: K)`.
- The photo: copy `private/avatars/anna-blackwood.jpg` to `apps/web/public/avatars/`. The Avatar examples and the API's `avatarUrl` use it.

**Steps:**

- [ ] Build each component with its examples, and check every state in the Components tab.
- [ ] Commit `feat(ui): add the simple components`.

### Task 8: TreeTable

**Delivers:** `src/ui/TreeTable/`, the generic table whose rows open and close (§5.6, D5, D13–D15, D38).

**Produces:**

```ts
type TreeTableColumn<Row> = {
  id: string;
  header: string;
  hideHeader?: boolean; // hidden on screen, still read by screen readers
  isRowHeader?: boolean;
  align?: 'start' | 'end';
  cell: (row: Row) => ReactNode;
};

type TreeTableProps<Row> = {
  label: string;
  rows: readonly Row[];
  getRowId: (row: Row) => string;
  getChildren: (row: Row) => readonly Row[];
  openRowIds: ReadonlySet<string>;
  onRowOpenChange: (id: string, isOpen: boolean) => void;
  columns: readonly TreeTableColumn<Row>[];
};
```

**Notes:**

- It uses React Aria's `Table` with:
  - `treeColumn`: the first column
  - `expandedKeys={openRowIds}`
  - `onExpandedChange`, which reports the one row that changed through `onRowOpenChange`
- Rows recurse through `<Collection items={getChildren(row)}>`.
- Only rows with children get the chevron (`<Button slot="chevron">`) and a row `onAction`; other rows get a 1.5rem spacer in the chevron's place (D5). React Aria fires row actions for rows without children too (verified), so they get none.
- Pass `dependencies={[columns, openRowIds]}` to `TableBody` and to every nested `Collection`. Otherwise React Aria reuses cached rows whose click handlers still see the old state.
- Indentation is `(level − 1) × 1.75rem`, from the cell's `level`, so names line up as §5.6 describes.
- **Narrow screens:**
  - the name column is pinned (`position: sticky`, with an opaque background)
  - the table has a minimum width, so month columns never squash; it scrolls sideways inside its card
  - `scroll-padding-inline-start` equals the name column's width. Check that a focused month cell never hides behind the pinned column (WCAG 2.4.11).
- **Row hover:** plain `:hover` inside `@media (hover: hover)`. React Aria marks hover only on rows with an action, and every row gets the reading-aid shade (D39). Only rows with children get the hand cursor.
- The Figma values are in §5.6: 56px rows, padding 18/24/18/16, a 264px name column, 1px borders, the chevron's path and rotation.
- Examples: closed, opened, a row with nothing inside, a very long name, and many columns in a narrow box.

**Steps:**

- [ ] Build it. Check the keyboard (D14), and check with VoiceOver that each row's level, position and open state are announced.
- [ ] Commit `feat(ui): add TreeTable`.

### Task 9: StackedColumnChart

**Delivers:** `src/ui/StackedColumnChart/`, Recharts wrapped in our own API (§5.6, D17, D18, D29).

**Produces:**

```ts
type ChartSeries = { id: string; name: string; color: string; values: readonly number[] };

type StackedColumnChartProps = {
  title: string; // the visible caption and the chart's accessible name
  description: string; // for screen readers (the SVG's <desc>)
  monthLabels: readonly string[]; // "Feb 2024"
  shortMonthLabels: readonly string[]; // "Feb ’24", "Mar", …, for narrow columns
  series: readonly ChartSeries[]; // bottom to top
  renderLabel: (monthIndex: number) => ReactNode;
};
```

It renders a `<figure>`: the title as its `<figcaption>`, then the chart, then the legend.

**Notes:**

- **Drawing:**
  - `<BarChart responsive>` with `title` and `desc`, and one `<BarStack radius={4}>` holding a `<Bar>` per series
  - `barCategoryGap={12}` gives the design's 24px between columns, because Recharts applies the gap on both sides
  - `maxBarSize` stops the columns growing past the design's width
  - the y axis has 5 "nice" ticks, labels 12px at 60% ink, and no axis lines
  - dotted gridlines: `strokeDasharray="1 6"` with the gridline token
- **The label:** Recharts' `Tooltip` renders `renderLabel(index)` inside the approved card.
- **Escape:** a wrapper `onKeyDown` marks the label as dismissed, which passes `active={false}` to `Tooltip`. Any other key, or a pointer move, clears it.
- **Announcements:** Recharts announces only its default label. So an always-present, visually hidden `role="status"` region holds the active month's label. Take the active month from Recharts 3's hooks (e.g. `useActiveTooltipLabel`) or from the tooltip content, whichever stays simpler.
- **Colours:** bars use `var(--color-chart-n)`. Check that this works as an SVG fill in Chrome, Firefox and Safari.
- **Narrow screens:** use the short labels when the plot is too narrow for the long ones; check at 320px and 375px.
- **The legend** is an HTML list below the chart, hidden when there's only one series, since the title already names it.
- **Examples:** one, three and five series, and a narrow box.

**Steps:**

- [ ] Build it. Check hover, tap and the keyboard (Tab, ← / →, Escape), and check with VoiceOver.
- [ ] Commit `feat(ui): add StackedColumnChart`.

### Task 10: The table's rules

**Delivers:** the pure rules behind the table and the chart (§5.3, §5.4).

**Files:** `apps/web/src/features/clients/model/toClientTree.ts`, `openedRows.ts`.

**Produces:**

- `type RowLevel = 'company' | 'branch' | 'advisor' | 'channel'`
- `type ClientRow = { id: string; name: string; level: RowLevel; values: number[]; avatarUrl?: string; children: ClientRow[] }`
- `toClientTree(company: ApiCompany): ClientRow`: the only code that reads `branches`, `employees` and `channels`
- `openRow(openedIds: readonly string[], id: string): string[]`: moves `id` to the end
- `closeRow(openedIds: readonly string[], id: string): string[]`
- `type ChartSubject = { row: ClientRow; isSplit: boolean }`
- `chartSubject(tree: ClientRow, openedIds: readonly string[]): ChartSubject`:
  - the last opened row that has children and whose ancestors are all open, split into its children
  - otherwise the company, not split

**Steps:**

- [ ] Write them. §5.3's examples get checked in the running page in Task 13.
- [ ] Commit `feat(clients): add the opened-rows rules`.

### Task 11: The chart model and formatting

**Files:** `apps/web/src/features/clients/model/chartModel.ts`, `src/features/clients/format.ts`.

**Produces:**

- `type ChartModel = { caption: string; description: string; series: ChartSeries[]; totals: number[] }`
- `chartModel(subject: ChartSubject, months: readonly string[]): ChartModel` (§5.4):
  - `caption`: "<name> by <level of the children>", or just the name when not split
  - `series`: coloured `var(--color-chart-1)` to `var(--color-chart-5)` in order, then `var(--color-chart-other)`
  - `totals`: the subject's own values, never summed
  - `description`, e.g. "Company by branch, February 2024 to January 2025. Exact numbers are in the table below." With a single month, there's no range.
- Formatting, with `Intl`, `en-US` and `timeZone: 'UTC'`:
  - `formatMonth('2024-02')` → "Feb 2024"
  - `formatMonthLong('2024-02')` → "February 2024"
  - `shortMonthLabels(months)` → "Feb ’24", "Mar", …, "Jan ’25": the year appears only on the first month and on each January (D15)
  - `formatCount(value: number | undefined)` → "1,234", or "—" when the value is missing

**Steps:**

- [ ] Write them.
- [ ] Commit `feat(clients): add the chart model and formatting`.

### Task 12: Loading data and the demo switches

**Files:**

- `apps/web/src/app/queryClient.ts`, `src/main.tsx` (wraps the app in `QueryClientProvider`)
- `src/features/clients/api/fetchClientCounts.ts`, `useClientCounts.ts`
- `src/features/demo/demoSettings.ts`, `DemoSwitches.tsx`, `DemoSwitches.module.css`
- `src/app/TopBar.tsx`: shows `DemoSwitches` on `/` only

**Produces:**

- `createQueryClient()`, with `retry: false` and `refetchOnWindowFocus: false` (§5.5).
- `fetchClientCounts({ period, demo, signal }: { period: Period; demo: DemoSettings; signal?: AbortSignal }): Promise<ClientCountsResponse>`:
  - adds `X-Demo` only when a switch is on
  - throws `ApiError` (`status`, `code?`) on an answer that isn't 2xx
  - throws `InvalidResponseError` when the contract check fails
- `useClientCounts(period)`: `useQuery` with `queryKey: ['client-counts', period]` and `placeholderData: keepPreviousData`. It reads the demo settings when each request starts.
- `type DemoSettings = { slow: boolean; fail: boolean }`, with `getDemoSettings()`, `setDemoSettings(next)` and `useDemoSettings()`, which uses `useSyncExternalStore`:
  - `localStorage` (key `nevis-demo-settings`) is the only store
  - the parsed value is cached by its raw text, so React gets the same object until something changes
  - a blocked or malformed store reads as both switches off
- `DemoSwitches`: a group labelled "Demo settings", with the switches "Slow responses" and "Fail requests". A change saves the settings and calls `queryClient.invalidateQueries()`, so the current data reloads at once.

**Steps:**

- [ ] Build it. Check by hand that both switches work and are remembered across reloads.
- [ ] Commit `feat(web): load client counts and add the demo switches`.

### Task 13: The Clients page

**Delivers:** the dashboard itself (§5.5, §5.7).

**Files:**

- `apps/web/src/features/clients/ClientsPage.tsx` and `.module.css`, `ClientsTable.tsx`, `ClientsChart.tsx`, `ChartLabel.tsx`, `PeriodSelect.tsx`
- `src/app/App.tsx`: now holds the page state

**Produces:**

- `App` holds `period` and `openedRowIds` (§5.3) and passes them to `ClientsPage`.
- `ClientsPage` props: `{ period: Period; onPeriodChange: (period: Period) => void; openedRowIds: string[] | null; onOpenedRowIdsChange: Dispatch<SetStateAction<string[] | null>> }`. It works out `openedRowIds ?? [tree.id]`, and applies `openRow` / `closeRow` as functional updates, so several changes in one event don't overwrite each other.
- **What the page shows** (§5.5), checked in this order:
  1. an error, even over older numbers; while "Try again" runs, the button is busy
  2. no data yet: placeholders
  3. a request running while numbers are on screen: the numbers faded, and the spinner by the dropdown
  4. otherwise: the chart and the table
- `ClientsTable`: the columns from §5.7, with `RowName` (the avatar for advisors, then the name).
- `ChartLabel` for a month: "May 2024", then the subject's total from `totals` (never summed), then each part with its colour square and number (§5.7).
- `PeriodSelect`: the `PERIODS`, labelled "Last 12 months", "Last 6 months", "Last 3 months" and "Last month".

**Steps:**

- [ ] Build the page.
- [ ] Check §5.3's examples in the running page: open Branch 1, then Anna; close Branch 1; reopen it.
- [ ] Compare the page with Figma's Mockup 2 in a wide window, and run the §10 checklist.
- [ ] Commit `feat(clients): build the Clients page`.

### Task 14: The Docs tab

**Files:** `apps/web/src/features/docs/DocsPage.tsx`, `DocsPage.module.css`; `vite.config.ts` gets an `@docs` alias for the repo-root `docs/` folder.

**Notes:**

- It renders `docs/decisions.md`, imported as text at build time (`@docs/decisions.md?raw`), with `react-markdown` and `remark-gfm`, in the Docs page's own on-demand chunk (D20, D31). Task 16 switches it to the two final files.
- Relative links in the Markdown, e.g. to the ADRs, are rewritten to the same file on GitHub. react-markdown's `defaultUrlTransform` runs first, so unsafe links stay out.
- Prose has a line height of at least 1.5 (D41), and tables scroll sideways inside their own box on narrow screens.

**Steps:**

- [ ] Build it. Check in the `npm run build` output that the dashboard's files don't include react-markdown.
- [ ] Commit `feat(docs): render the decisions in the Docs tab`.

### Task 15: Tests

**Delivers:** the agreed tests, the tools to run them, and both in CI (D36, [testing-strategy.md](testing-strategy.md)).

**Steps:**

- [ ] Agree the test list with the repo owner, one question at a time, starting from testing-strategy.md's draft.
- [ ] Plan the work in detail once the list is agreed; it may split into a few tasks. What's already verified for the setup is listed under "Verified before planning".
- [ ] Write the tests. Each one is seen failing once: break the line that prevents the bug it catches, read the failure, restore the line.
- [ ] Add `test` (and `test:e2e`, if there are real-browser tests) to the root scripts and to CI.
- [ ] Update testing-strategy.md and D36 with the final list.

### Task 16: The final docs and README

The last stage from §10:

- [ ] Split and condense `decisions.md` into `docs/decisions/product.md` and `docs/decisions/technical.md`, and point the Docs tab at them.
- [ ] Write the README:
  - how to run and test the project
  - assumptions and open questions, including the data mismatches (D4) and how "overflow" was read (D15)
  - what's next (§12)
  - the testing strategy
  - page weight, measured again from the real build
  - the AI note (D34)
  - the photo's source (D16)
- [ ] Commit `docs: final decisions and README`.

### Task 17: The production check and going public

- [ ] Once the release pull request is merged, run the §10 checklist on the production site, including on a phone.
- [ ] Ask the repo owner to confirm, then make the repository public with `gh repo edit --visibility public --accept-visibility-change-consequences`. Check the README's links afterwards.

---

## Where each part of the design is built

| Design | Tasks |
|---|---|
| §2 Architecture, §9 Tools and CI | 1 (tests' tools: 15) |
| §2.3 Hosting | 2 |
| §3 Contract | 3 |
| §4 API | 4 |
| D39 Mockups | 5 |
| §5.2 Addresses and top bar, §5.8 Styles | 6 |
| §5.6 Our components | 6 (NavTabs), 7, 8, 9 |
| §5.3 Page state, §5.4 From answer to screen | 10, 11, 13 |
| §5.5 Loading data | 12, 13 |
| §5.7 Feature components | 6 (Gallery), 12 (DemoSwitches), 13, 14 (Docs) |
| §6 Accessibility | 6–9, 13, 15 |
| §7 Page weight | 14 (build check), 16 (README) |
| §8 Testing | 15 |
| §10 Delivery | every task; the last stage is 16–17 |
| §12 Follow-ups | 16 (README) |
