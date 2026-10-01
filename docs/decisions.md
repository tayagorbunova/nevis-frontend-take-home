# Decisions

Every product and technical decision made while designing the dashboard, in the order we made them, with the reason for each. Decisions that are hard to reverse also get a record in [docs/adr](adr/). Words are defined in [GLOSSARY.md](../GLOSSARY.md); the feature itself is explained in [feature-overview.md](feature-overview.md).

## Principles

These came out of the decisions below and guide the ones still to come.

- **The UI only presents.** It shows what the server sends and never invents, fixes, recalculates or assumes data. Anything the numbers depend on (like which months they cover) comes from the server. See decisions 4 and 7.

## 1. The chart follows what you open in the table

**Problem:** The design's chart splits the whole company by acquisition channel. Only one advisor (Anna Blackwood) has channel data, so that chart can't be drawn from the data.

**Decision:** The chart shows the most recently opened row, split by the rows inside it:

- Company → split by branch
- Branch 1 → split by advisor
- Anna Blackwood → split by channel (this looks exactly like the design's chart)

Closing a row takes the chart back to the previously opened row. A short caption says what the chart is showing.

**Options considered:**

- Always show the company split by branch; the chart never changes. Simplest, but the chart can't zoom in, and it never looks like the design.
- Always split by channel, adding up the advisors' channels and showing everything else as "unknown". Matches the design's legend, but about 90% of every company bar would be "unknown".

**Why:** The chart zooms in together with the table, it uses the click the design already has (a click on a row opens it), and it reproduces the design's chart for the one advisor with channel data.

**Trade-off we accept:** Opening a row just to read its numbers also changes the chart.

Recorded as [ADR 0001](adr/0001-chart-follows-the-table.md).

## 2. The page opens with the company row open

**Decision:** When the page loads, the company row is open and every other row is closed, as in the design. So the chart starts with the company split by branch.

**Options considered:**

- Everything closed: the chart shows the company total in one colour. Simplest, but it differs from the design and tells you less.
- Anna Blackwood open: the chart starts exactly like the design's chart, but a company dashboard would open on one advisor's clients, with rows open that the design shows closed.

**Why:** It matches the design's starting table, follows the same rule as every other state (no special case), and gives managers a useful overview first.

**Later:** In a real product, the first view would depend on who is looking: an advisor would land on their own clients, a manager on the company. The assignment has no login, so this goes in the README as a next step.

## 3. One company per dashboard

**Decision (an assumption):** The dashboard shows exactly one company, the one the viewer works for. The company is always the top row.

**What we considered:** Could there be several companies? Nevis has many companies as customers, but each one only sees its own clients; putting two firms on one screen would leak one customer's data to another. The data agrees: its top level is a single company, not a list. The realistic exception is a group that owns several firms and wants one combined view. That would add a new level above Company, and it's out of scope.

**Consequence:** The table and chart code must not assume a fixed number of levels, so a level above Company would be cheap to add later.

**Where else it's documented:** the README's assumptions.

## 4. Numbers that don't add up are shown as they are

**Problem:** In three places, a row's number doesn't equal the sum of the rows inside it:

| Where | Row's own number | Rows inside add up to |
|---|---|---|
| Company, May 2024 | 301 | 279 (branches) |
| Branch 1, August 2024 | 214 | 216 (advisors) |
| Anna Blackwood, May–September 2024 | 31, 32, 34, 38, 27 | 30, 33, 35, 36, 28 (channels) |

**Decision:** We change nothing. The UI shows exactly what the server sends and never checks or recalculates totals. The README lists each mismatch, its likely cause, and the fact that we left the data untouched. In a real team, we'd ask the product manager or the backend developer which number is right.

**Likely causes (our assumption: data-entry mistakes):**

- Maria Gutierrez's May value, 22, sits between 41 and 46 and looks like a typo for 44. With 44, Branch 1 would be 178 and the company 301.
- Robert Chen's August value is 58. The design has 56, which adds up.
- Anna's "New paid" numbers are shifted one month compared to the design, where they add up.

**Rule that follows:** Any total the UI displays is a row's own number from the server, never a sum the UI calculates. A stacked bar is built from its pieces, so the company's May bar is 279 tall while the table says 301; the README explains why.

**Also worth knowing:** Even in correct real-world data, totals don't always add up. A family served by two advisors counts once for the branch but once for each advisor, and a client with no advisor counts for the company but for nobody below it. Channels are the exception: each of an advisor's clients belongs to exactly one channel.

**Options considered:**

- The server checks the data at startup and prints a warning per mismatch: useful in a real system, but more than this assignment needs.
- A warning marker in the table: managers can't fix the data, so it would only confuse them.
- Changing numbers so they add up: that's guessing, and it hides the problem.

## 5. Rows with nothing inside have no arrow

**Problem:** The design puts an arrow (chevron) on every row, meaning "you can open this". In the data, Branch 2, Branch 3 and four of the five advisors have nothing inside them, and in the prototype their arrows do nothing.

**Decision:** Only rows that have something inside get an arrow and can be opened. Other rows have no arrow and can't be opened; their names stay lined up with the rows around them, as if the arrow's space were still there.

**Why:** An arrow that does nothing is misleading, and screen readers would announce "collapsed" for a row that can never open. The brief also says explicitly that the UI has to handle rows with nothing inside.

## 6. We say "advisor" and "channel"

**Problem:** The same things have different names in different places:

| Thing | The brief | The data | The design | Nevis's website |
|---|---|---|---|---|
| The person with clients | advisor | `employees` | Adviser | advisor |
| Existing / New organic / New paid | acquisition channel | `channels` | Attribute | — |

**Decision:** Our code, docs and screen-reader labels say **advisor** and **channel**, as defined in [GLOSSARY.md](../GLOSSARY.md). The data's field names (`employees`, `channels`) stay as given; our code translates them once, right after the data arrives.

**Why:** "Advisor" is the brief's word and Nevis's own spelling (it builds for the US market; "Adviser" is the British spelling). "Channel" matches both the brief and the data; "Attribute" is too vague.

## 7. The server says which months the numbers are for

**Problem:** Each row has 12 numbers, but the data doesn't say which months they are. Only the brief does: February 2024 to January 2025.

**Decision:** The API response carries the list of months next to the data, e.g. `"months": ["2024-02", …, "2025-01"]`. The data itself is served exactly as given (with one documented exception: an avatar link, see decision 16). The UI only turns those months into labels such as "Feb 2024".

**Why:** The numbers mean nothing without their months, and only the server knows them. Any agreement between the UI and the server, even a sensible one like "always the last 12 months", gives them two separate sources of truth that can drift apart. The UI would then have to work something out instead of only presenting what it receives.

**Options considered:**

- The UI assumes the first number is February 2024: it breaks silently as soon as the data covers other months.
- A fixed agreement such as "always the last 12 months": still two sources of truth.

## 8. Clients can be filtered by a date range

**Decision:** Users can choose which months they see:

- Without a choice, the server returns the latest 12 months it has (in our data, that's all of them).
- With a chosen range, e.g. June to December 2024, the server returns only those months, and the chart and table show only them.

It's built as part of the main work, not as an optional extra.

**Why:** Managers and advisors naturally want to look at a specific period. It fits the "UI only presents" principle: the server decides which months exist and returns them, and the UI only asks for a range. It also makes loading states meaningful: they appear while someone is using the page, not only once when it opens.

**Trade-off we accept:** Neither the brief nor the design includes it, so we design the picker ourselves and spend part of the 6–8 hours on it.

**Options considered:**

- Build the server part first and add the picker last, once everything the brief asks for is polished: safer for the time budget.
- Don't build it; describe it in the README as the first next step.

Recorded as [ADR 0002](adr/0002-date-range-filter.md).

## 9. The period is picked from a dropdown of presets

**Decision:** A dropdown on the right of the "Clients" title (under it on narrow screens) with four choices:

- Last 12 months (the default)
- Last 6 months
- Last 3 months
- Last month

It uses the design's existing styles: Inter 14px, the same thin borders and colours.

"Last" counts back from the latest month the server has, not from today's date. With our data, "Last 3 months" means November 2024 to January 2025. The UI sends the choice to the server, and the server works out which months that means and returns them, so the UI still only presents.

**Why:** It's enough to show the feature working end to end, with the least new UI to design. A standard dropdown works with the keyboard, screen readers and phones out of the box.

**Options considered:**

- Two "From / To" month dropdowns: any range is possible, but there's more to build and explain.
- A calendar-style range picker: looks the nicest, but it's a lot of work to make accessible.

**Later:** A picker for exact date ranges goes in the README as a follow-up.

## 10. Loading and error states

**Decision:**

- **First load:** grey placeholder shapes (skeletons) where the chart and table will be, so nothing jumps when the data arrives.
- **Changing the period:** the current numbers stay on screen, slightly faded, with a small spinner next to the dropdown until the new ones arrive.
- **Something fails:** the chart and table are replaced by a short message, "Couldn't load clients", with a "Try again" button. The dropdown keeps the chosen period, so "Try again" repeats the same request.

**Why:** Nothing jumps around, and you never lose what you're looking at while new numbers load. After a failure we don't leave old numbers under the new period's label, because the page would then show the wrong months.

**Options considered:**

- One spinner in the middle of the page for everything: less work, but the page jumps and the numbers disappear on every period change.

## 11. Demo settings: slow and failing responses on demand

**Decision:** A slim "Demo settings" strip at the very top of the page, above the title, always visible on the dashboard (it later became part of the top bar with the tabs, see decision 21), with two switches:

- **Slow responses:** every request takes an extra 2 seconds.
- **Fail requests:** every request fails.

When a switch is on, the app adds a note to each request, and the server really waits or really answers with an error. The server only listens to these notes when demo mode is on (it is on for local development and for the hosted demo). The switches are remembered across reloads, so the first-load states can be seen too.

**Why:** Reviewers can see every loading and error state without developer tools. Because the server does the work, the error travels the real path (server → network → app), exactly like a real failure would. The strip is noticeable but small, so it doesn't pull attention from the dashboard.

**Options considered:**

- The app fakes the delay and the error itself: the server stays untouched, but the real error path is never exercised.
- A collapsible panel: takes less space, but reviewers might never open it.
- Only README instructions (browser developer tools, stopping the server): no code, but easy to miss.

## 12. Hosted on Vercel

**Decision:** The page and the API are hosted together on Vercel's free plan; the API runs there as a Node.js function. Every push to GitHub redeploys the site, and every pull request gets its own preview link. The hosted link is public, which is fine because the data is the made-up data from the brief.

**Consequence:** The server code must run the same way locally (as a normal Node.js server) and on Vercel (as a function).

**Who does what:** the repo owner creates the Vercel account (signing in with GitHub) and imports the repo; everything else is prepared in the repo.

**Options considered:**

- Render: runs a normal, always-on Node.js server, but the free plan falls asleep after 15 minutes without visitors, and the next visit waits up to a minute.
- Netlify: very similar to Vercel, with no real advantage for us.

## 13. Our own components, built on React Aria

**Problem:** Deciding how keyboard users and screen readers open and close rows turned out to be a bigger question: how do we build the interactive parts at all (the table, the period dropdown, the demo switches)? Write everything ourselves, or use a library? And if a library, why pull one in for a handful of components?

**Decision:** We build our own components, with our own look and our own APIs, on top of [React Aria Components](https://react-aria.adobe.com/) (Adobe's unstyled, accessible building blocks). React Aria supplies the behaviour: keyboard control, focus handling and what screen readers are told. We supply everything visible, styled to the design, and every component API the rest of the app uses.

**Why:**

- The table whose rows open and close is the hardest accessibility work in the brief. React Aria's version has been tested with real screen readers far more than ours could be in 6–8 hours.
- Its table supports rows that open and close (`treeColumn`, `expandedKeys`, `onExpandedChange`), and that part is stable and documented, not experimental.
- It's how many real design systems are built: a headless library for behaviour, the team's own components on top. Nevis's job ad mentions component libraries and shaping a design system. In a real team, we'd use Nevis's own design system instead.
- Owning the look and the APIs is what the brief asks for with "composable, with clear boundaries". The library doesn't dictate either.
- Once it's in the project, the dropdown and the switches get the same tested behaviour and a consistent look for free.

**What we checked before deciding** (react-aria-components 1.21.1, a small test rendering its table in the testing environment we'll use):

- It renders a real HTML table marked as a treegrid. Every row tells screen readers its level and position ("level 2, 1 of 2"), and only rows that have something inside say whether they're open, which matches decision 5.
- The keyboard works as the treegrid pattern expects: see decision 14.
- A click anywhere on a row, or Enter, fires a "row action", which we wire to open or close the row. That matches the design, where the whole row is clickable. Clicking the arrow itself opens or closes the row without double-toggling.
- A gotcha to handle: rows with nothing inside also fire the row action, so our code only opens or closes rows that have something inside.

**The cost: page weight.** Measured on 2026-09-30 by bundling a minimal page with esbuild (minified, then compressed with gzip):

| What the page loads | Compressed JavaScript |
|---|---|
| React on its own | about 67 KB |
| React + React Aria's table, dropdown and switch | about 151 KB |
| **React Aria's share** | **about 84 KB** |

Is 84 KB a lot? Not for this product. React itself is 67 KB, many websites load several hundred KB of JavaScript, and big web apps load over a megabyte. On a normal connection, 84 KB downloads in well under a tenth of a second (a second or two on a slow phone connection), and the browser caches it after the first visit. It would matter for a public site opened on phones, where every fraction of a second loses visitors. Our users are advisors and managers on work laptops who keep the dashboard open. Still, it more than doubles our JavaScript, so the README says so and explains the trade.

**Other trade-offs we accept:**

- React Aria has its own way of describing rows ("collections"), which takes some learning.
- The accessibility logic lives inside the library. We still need to understand the treegrid pattern ourselves (see decision 14) to explain and test it.
- One more dependency to keep up to date.

**Options considered:**

- **Everything ourselves:** a normal HTML table with our own keyboard code, the browser's built-in dropdown, and a checkbox styled as a switch. No extra weight and every line is ours, but the treegrid's keyboard and focus handling is about 200 lines of tricky code plus tests that we'd have to get right and check with screen readers ourselves. The browser's built-in dropdown also can't be styled when it's open.
- **A fully styled library** such as Material UI or Mantine: it brings its own look, which we'd have to fight to match the design, and it's heavier.

Recorded as [ADR 0003](adr/0003-components-on-react-aria.md).

## 14. Keyboard and screen readers: the treegrid pattern

**Problem:** The brief requires that opening and closing rows works from the keyboard, and that the hierarchy reaches assistive technology such as screen readers.

**Decision:** The table follows the WAI-ARIA treegrid pattern, the standard for "a table whose rows open and close". React Aria provides it (decision 13). Verified keyboard behaviour:

| Key | What happens |
|---|---|
| Tab | Moves into the table. The whole table is a single Tab stop. |
| ↓ / ↑ | Next / previous row |
| → | Opens a closed row. On an open row, moves into its cells. |
| ← | Closes an open row. On a closed row, jumps to the row it belongs to. |
| Home / End | First / last row |
| Enter | Opens or closes the row (our row action) |
| Mouse click anywhere on a row | Opens or closes the row (our row action), as in the design |

Screen readers hear each row's name, level, position and open/closed state, e.g. "Branch 1, level 2, 1 of 3, collapsed". The first column is marked as the row's header, so the name is announced while moving between cells.

**Two additions the design doesn't have:**

- A clear outline on the row or cell that has keyboard focus.
- A label for the first column, such as "Name", visually hidden because its header is blank in the design. Screen readers need it.

**How we check it:** automated tests for the keyboard behaviour and the attributes above, plus a manual check with VoiceOver on macOS. Screen-reader caveats go in the README.

**Options considered:**

- A plain table with an expand button in each row: simpler and very robust, but screen readers get the hierarchy only through extra hidden text ("level 2"), and long tables need many Tab presses.

## 15. Phone-sized screens: the table scrolls inside its card

**Problem:** The brief says full responsiveness isn't required, but nothing may break or overflow down to 375px (a small phone). The table has 13 columns (names plus 12 months), and they can't all fit that narrow.

**How we read "overflow" (an assumption, stated in the README):** something sticking out of the screen or out of its box: the whole page scrolling sideways, the table poking out past its card, text cut off or overlapping. A wide table that scrolls sideways inside its own card doesn't count, because its extra width is contained and handled. Two reasons:

- The brief says full responsiveness isn't required, which suggests they don't expect a redesigned phone layout.
- WCAG's "Reflow" rule asks pages to fit a narrow screen without sideways scrolling, but explicitly exempts data tables, because a table's rows and columns only make sense side by side.

**Decision:**

- The table scrolls sideways inside its card, with the name column pinned on the left, so you always know whose numbers you're reading. A month column visibly cut off at the card's edge shows there's more to scroll to.
- The chart keeps all its bars but makes them thinner, and month labels get shorter ("Feb" rather than "Feb 2024", with the year shown once).
- The period dropdown moves under the title, and the demo strip wraps onto more lines if needed.
- The page itself never scrolls sideways.

A side effect of the period filter: "Last 3 months" fits on a phone without any scrolling.

**Options considered:**

- A separate phone layout, e.g. each row becomes a card listing its months: much more work, and the brief says full responsiveness isn't required.
- No sideways scrolling at all, by hiding months on small screens: it would hide data, and it follows a stricter reading of "overflow" than we think was meant.

## 16. Avatars: a photo if there is one, otherwise initials

**Problem:** The design shows a small round photo (20px) before each advisor's name. The data has no photos.

**Decision:**

- The `Avatar` component shows the photo when the server sends one, and otherwise the advisor's initials (e.g. "AB" for Anna Blackwood) in a circle with a quiet grey tint: the design's single ink colour at low opacity, the same for everyone.
- It's decorative: screen readers skip it, because the name is right next to it.
- To show both states, the server gives **one** advisor, Anna Blackwood, an `avatarUrl`. Opening Branch 1 then shows her photo next to four initials circles.

**The one exception to "served as given":** that `avatarUrl` is the only thing we add to the provided data. The README says so. Everything else stays exactly as given.

**Where the photo comes from:** the photo the design uses for Anna in the advisors list, exported from the Figma file and shrunk to 80×80 pixels (about 4 KB; shown at 20px, so it stays sharp on high-resolution screens). Its licence is unknown, so the README credits the design as its source. The design itself is inconsistent here: once Anna's row is opened, the design shows a different photo, the component's default picture that was never swapped.

**Why:** It keeps the design's look (a circle before the name) and uses only data the server sends. The UI works out the initials from the name, which is formatting, not inventing data. The grey tint matches the design's calm, one-colour style.

**Options considered:**

- Initials in a different colour per person: livelier, but it means picking and checking a whole colour palette for readability.
- Photos for everyone: the server would have to send pictures that don't exist in the data.

## 17. Chart colours: the design's three, plus two in the same style

**Problem:** The design has three colours, one per channel. Our chart also shows branches (3) and advisors (5).

**Decision:** One palette of five colours, used in the same order for every breakdown:

| Order | Colour | Hex | Also used for |
|---|---|---|---|
| 1 | Lavender | `#B29DF8` | Existing clients (as in the design), or a single-colour chart |
| 2 | Peach | `#F4BEB4` | New organic (as in the design) |
| 3 | Maroon | `#A75E6E` | New paid (as in the design) |
| 4 | Sage green | `#6FAF9B` | new |
| 5 | Mustard | `#E8C170` | new |

Channels therefore get exactly the design's colours. Colours are never reused within one chart: in our data the biggest breakdown has five parts, and any sixth part would be grey. Real branches can have dozens of advisors, and a proper rule for that (e.g. top five plus "Other") is a README follow-up.

**Checked, not eyeballed:** a palette validator that simulates colour blindness says the five stay distinguishable for colour-blind people (worst neighbouring pair: 11.9 on its scale, where 8 is the target) and for full colour vision (17.9, where 15 is the minimum).

**Caveat (in the README):** soft colours have low contrast against white. The lavender is 2.3:1 and the peach 1.6:1, below the usual 3:1 guideline for chart shapes. That's acceptable because nothing depends on colour alone: the legend names every colour, and the table shows every exact number.

**Options considered:**

- Channels keep the design's colours, and branches and advisors get a separate brighter palette: the levels look more distinct, but the chart gets busier and stops looking like the design.
- Shades of lavender for branches and advisors: calm, but five shades of one colour are hard to tell apart, and shades suggest "more vs less" when these are just different people.

## 18. Chart labels by mouse, keyboard, touch and screen reader

**Problem:** Neither the design nor the prototype shows anything when you hover the chart. Reading exact numbers off stacked bars is hard, and anything that appears only on hover leaves out keyboard and touch users.

**Decision:** Every bar has a small label: the month, each part's number, and the row's own total from the server, e.g. "May 2024 · Company: 301 · Branch 1: 156 · Branch 2: 87 · Branch 3: 36". It follows the rule that every total shown comes from the server, and it shows the mismatch honestly, with the total next to its parts. It works for everyone:

| Who | How |
|---|---|
| Mouse | Hovering a bar shows its label. |
| Keyboard | The chart is a single Tab stop. ← / → move between months and the label follows; Home / End jump to the first / last month; Escape hides the label; Tab leaves the chart. |
| Touch | Tapping a bar shows its label. |
| Screen readers | Each bar carries the same text as its label, so the chart can be explored month by month. The chart also has a short description, e.g. "Company split by branch, February 2024 to January 2025; exact numbers are in the table below". |

The labels follow WCAG's rules for content that appears on hover or focus: Escape dismisses it, you can move the mouse onto it without it disappearing, and it stays until you move away.

**Why a single Tab stop:** it works the same way as the table, and keyboard users who aren't interested in the chart skip it with one Tab instead of twelve.

**Updated by decision 29 (Recharts):** Home / End are dropped, because with at most 12 months ← / → is enough. Escape is added by our own code. Screen readers hear each month's label read aloud as focus moves, instead of every bar carrying its own label.

**Options considered:**

- No labels, exactly like the design: the table already has every number, but the chart is harder to read.
- Labels on mouse hover only: less work, but keyboard, touch and screen-reader users miss out.
- Every bar as its own Tab stop: twelve Tab presses just to get past the chart.

## 19. The chart's caption: the row's name and how it's split

**Decision:** A caption at the top-left inside the chart card, in the design's regular 14px text, says what the chart shows:

- "Company by branch"
- "Branch 1 by advisor"
- "Anna Blackwood by channel"
- "Company" when every row is closed (one colour, the company's total)

Screen readers get the caption as part of the chart's description. They aren't interrupted with an announcement each time the chart changes, because the table already tells them that a row opened or closed.

**Why:** It's short, it fits on a phone, and the table right below already shows the path through its indentation.

**Options considered:**

- The full path ("Company › Branch 1 › Anna Blackwood, by channel"): shows where you are in the tree, but it gets long and wraps on phones.

## 20. A "Docs" tab shows the decisions, from the repo's own Markdown

**Decision:** The app gets a second tab, "Docs", next to the dashboard. It shows the decisions made while building the app, split into product decisions and technical decisions. Its content is the repo's own Markdown files (`docs/decisions/product.md` and `docs/decisions/technical.md`), rendered nicely in the app. The Markdown renderer loads only when someone opens the Docs tab, so the dashboard doesn't get heavier.

**Why:** Reviewers can read the reasoning without leaving the app. There's one source of truth: the same text appears on GitHub and in the app, so the two can never drift apart. Decisions stay easy to write, in plain Markdown.

**When:** This file ([decisions.md](decisions.md)) remains the working log for now. Splitting it into product and technical decisions, and condensing it, happens as the last stage of the project.

**Options considered:**

- Writing the decisions as page content inside the app's code: no extra library, but the decisions would live in two places and drift apart, and every edit would mean touching code.

## 21. The tabs and demo switches share a slim bar at the top

**Decision:** A slim bar at the very top of the page, above the design:

- On the left, the tabs: "Dashboard" and "Docs", plus "Components" (added by decision 37).
- On the right, the demo switches (decision 11), shown only on the Dashboard tab.
- On phones, the bar wraps onto two lines.

Everything meant for reviewers sits in this bar. Everything below it is the product, exactly as designed.

Each tab has its own address (`/` and `/docs`), so a reviewer can be sent a link straight to the Docs tab, and the browser's Back button works. Because they're addresses, the tabs are built as navigation links that look like tabs. That's the correct pattern for screen readers: real tabs (the ARIA tabs pattern) are for switching panels within one page, not between pages.

**Why:** It keeps the designed page untouched and makes it obvious what belongs to the product and what belongs to the review.

**Options considered:**

- Tabs inside the page, under the "Clients" title, styled like the design: looks integrated, but "Docs" isn't something a Nevis user would ever see, and it changes the designed page.

## 22. One repository, three packages

**Decision:** A monorepo using npm's built-in workspaces, with no extra build tools:

- `apps/web`: the page (React)
- `apps/api`: the server (Node.js)
- `packages/contract`: what both share, such as the data's shape, the checks for it, and the list of periods

The page never imports server code; both import the contract. On Vercel it's one project, and the server is exposed as a Vercel function through one small adapter file.

**Why:** The boundaries are real, not just a convention. That's what the brief asks for, and Nevis's job ad mentions monorepos. The contract makes the API's promises explicit and shared by both sides.

**Options considered:**

- One package with folders (`src/`, `server/`, a shared folder): the simplest setup, but the boundaries exist only by convention.

## 23. Work reaches `main` through pull requests

**Decision:** Every piece of work goes on its own branch and reaches `main` through a pull request on GitHub. Each pull request runs the automated checks and gets its own Vercel preview link. Commit messages follow the conventional style (`docs:`, `feat:`, `fix:`, `test:`, `chore:`). The repo owner merges each pull request.

**Why:** It's how real teams work, every change gets checks and a preview for free, and the history reads as a series of small, described steps.

**Options considered:**

- Committing straight to `main`: fastest, with no ceremony, but the history is a flat list of commits with no checks or previews per change.

## 24. The server is built with Hono

**Decision:** The API uses [Hono](https://hono.dev/), a small, modern server library.

**Why** (each point checked against Hono's docs):

- The same app runs as a normal Node.js server locally (official Node.js adapter) and on Vercel ("Hono can be deployed to Vercel with zero-configuration"). Exactly how Vercel picks it up inside our monorepo, next to the Vite page, gets verified early in the build with a small test deploy.
- Tests call the server directly with `app.request('/api/…')`, without starting it.
- It has built-in request checking, plus official Zod and Standard Schema validators, so the period check can reuse the schema from `packages/contract`.
- It keeps the server as small as the job needs: one address, a period check, and the demo notes.

**Options considered:**

- Express: the best-known option and supported by Vercel, but its design is older, its TypeScript support is weaker, and request checking needs extra pieces.
- Fastify: fast and robust, with built-in schemas, but heavier than one address needs.
- Plain Node.js with no library: zero dependencies, but we'd hand-write routing, query parsing and response headers.

## 25. Styles are plain CSS modules

**Decision:** Each component has its own style file (e.g. `Table.module.css`), and its class names are private to that component, so styles never leak between components. The design's values (colours, fonts, spacing) live in one file as CSS variables: one layer, named by purpose, each noting which Figma variable it comes from (e.g. `--color-text-muted` is Figma's Content/Secondary at 60%). React Aria marks states on elements (hovered, focused, open), and our styles target those markers directly.

**Why:** Modern CSS has what we need built in, including nesting and variables. Vite supports CSS modules with no setup. That's one tool fewer to install, configure and explain.

**We considered SCSS**, which Nevis's job ad lists. In an app this size, the only SCSS feature we'd use is reusable snippets, and those are covered elsewhere: React Aria ships a `VisuallyHidden` component, and the focus outline is one shared style. Switching later is trivial, because every CSS file is already valid SCSS. In Nevis's codebase, we'd follow its SCSS conventions.

**We also considered Tailwind:** styles written as short class names in the markup (e.g. `px-4 py-2 text-sm`). Fast to write and popular, but it's a different approach from Nevis's stack, and the long class strings make components harder to read.

## 26. Data loading uses TanStack Query

**Decision:** The page loads data with [TanStack Query](https://tanstack.com/query) (version 5.104, about 10 KB compressed, measured the same way as decision 13).

**What it handles for us** (the requirements from decisions 8–11):

- It tracks loading, error and refreshing, which drive the placeholders, the error message and the faded numbers.
- One setting keeps the previous numbers on screen while a new period loads.
- It ignores outdated answers, so switching periods quickly shows the latest choice, not whichever answer arrives last.
- It remembers answers per period, so switching back to a period already seen is instant.
- It provides the retry behind "Try again".

**Why:** It's small, widely used, and handles exactly the tricky parts, which are also the easiest to get subtly wrong in our own code.

**Options considered:**

- Our own small helper around `fetch` (about 60–80 lines): no dependency, but we'd rebuild what TanStack Query already does and have to test those tricky cases ourselves.
- React 19's newer tools (`use`, Suspense, transitions): modern, but remembering answers, retries and cancelling would still be ours to build, and the loading and error flow is harder to follow and explain.

## 27. Data is checked at runtime with shared Zod schemas

**Problem:** TypeScript checks our code while we write it, but not what actually arrives over the network. Outside data enters in two places: the server receives the period from the page, and the page receives the data from the server.

**Decision:** `packages/contract` describes the data's shape once, with [Zod](https://zod.dev/) Mini, and both sides use it:

- The server checks the period it's asked for. A bad value gets a clear "unknown period" error.
- The page checks the server's answer before showing it. Anything malformed becomes the normal error state (decision 10) instead of a crash deep inside the chart or table.
- The TypeScript types are generated from the same schemas, so types and checks can never disagree.

**Size:** measured with Zod 4.6, the full edition adds about 26 KB to the page, and the Mini edition does the same checks for about 5 KB. Mini is what we use.

**Why:** The UI only presents what the server sends, and it should notice when that isn't what we expect. At 5 KB, the check costs next to nothing.

**Options considered:**

- TypeScript types only, with the page trusting the server: smaller and simpler, but a malformed answer would crash deep in the page instead of showing a clear error.
- Checking only on the server: protects the server, but the page still trusts whatever comes back.

## 28. The dashboard's state isn't kept in the page address

**Decision:** The address says only which tab you're on (`/` or `/docs`, decision 21). The chosen period and the opened rows aren't in it, so every reload starts fresh: the last 12 months, company open. The demo switches are still remembered by the browser (decision 11).

**Why:** Putting the state in the address makes views shareable, and whether they should be shareable is a product question to answer first. Who shares with whom? Should an advisor's link show a colleague's numbers? Until that's settled, we don't build it.

**Within one visit, nothing is lost:** switching to the Docs tab and back keeps the dashboard exactly as you left it (period and opened rows), because that state lives above the tabs rather than inside the dashboard page. Only a reload starts fresh.

**Later:** Two README follow-ups:

- An open product question: how important is it to keep what someone was looking at, across reloads, visits, devices and shared links?
- Once sharing is agreed: put the period in the address first (cheap, and the most useful), then possibly the opened rows.

**Options considered:**

- The period only, e.g. `/?period=last-6-months`: cheap, and reloads keep the period.
- The period and the opened rows: a link reproduces exactly what you see, but every open and close must update the address, and the rows' random ids make the addresses ugly.

## 29. The chart uses Recharts, wrapped in our own component

**Decision:** The chart is drawn by [Recharts](https://recharts.github.io/) 3, hidden inside our own chart component. The rest of the app never imports Recharts; it only uses our component and its API.

**Why:** The full comparison of ten libraries, with sources, is in [chart-library-comparison.md](chart-library-comparison.md). In short:

- **Fit:** the only free library that draws the design's rounded columns exactly (`BarStack`), and its keyboard support is on by default: one Tab stop, ← / → between months. It draws SVG, so our CSS variables apply and tests can check the drawn bars.
- **Popularity:** by far the most used chart library in React apps (67.9M weekly downloads, against 5.5M for Chart.js's React wrapper).
- **Alive:** 14 releases in the last year, 27 people committing, 274 contributions merged in 90 days, and most new issues get closed. That makes it the least likely of the free options to be abandoned or to leave a bug unfixed.
- **Common practice:** most teams use a library. Large companies with design systems usually wrap a library or low-level building blocks in their own components. Wrapping it means that if Recharts ever became a problem, only our one component would change, the same boundary as with React Aria (decision 13).

**What changes in decision 18:**

- Kept: one Tab stop, ← / → between months with the label following, hover and tap, and the label's content (month, parts, total from the server).
- Escape to hide the label isn't built in, so we add it (Recharts lets us control whether the label shows). To be confirmed with a quick test.
- Home / End are dropped: with at most 12 months, ← / → is enough.
- Screen readers hear each month's label read aloud as focus moves, instead of every bar carrying its own label. Recharts adds that announcement only to its default label, so our own label must add it back itself.

**Cost:**

- About +116 KB of compressed JavaScript, the heaviest piece on the page. Everything together is roughly 280 KB (React 67, React Aria 84, Recharts 116, TanStack Query 10, Zod Mini 5). That's fine for a work dashboard, and the README says so.
- Recharts draws nothing until it knows its size, so tests give the chart a fixed size or provide the browser's size-watching API.

**Options considered** (details in the comparison):

- Chart.js: half the size and very well known, but it draws on a canvas (no individual bars for tests or screen readers, no keyboard support), and its maintenance has slowed to one release a year.
- Highcharts: the richest accessibility, but it needs a paid licence for commercial use.
- MUI X Charts: actively maintained with good keyboard support, but the columns' bottoms stay square, and it brings MUI's own styling system into our CSS-modules app.
- visx: small (+26 KB) and lets us match decision 18 exactly, but we'd still draw the chart ourselves.
- Our own chart without any library: rejected in favour of a well-maintained library.

## 30. The two tab addresses are handled by wouter

**Decision:** [wouter](https://github.com/molefrog/wouter), a tiny router, switches between `/` (Dashboard) and `/docs` (Docs), makes Back and Forward work, and lets the Docs page load only when it's opened.

**Why:** It's tiny (about +2 KB compressed), its API is close to React Router's (`Route`, `Link`, `Switch`, `useLocation`), and it covers everything two pages need. It's also a chance to try something new at little risk.

**Checked before deciding** (2026-10-01):

- **Alive:** version 3.13.0 released 2026-09-30, 8 releases in the last year, 9 people committing, 10 contributions merged in 90 days, 7.9k GitHub stars, 2.3M weekly downloads. Unlicense (public domain).
- **Correct links:** its `Link` ignores clicks made with Ctrl, Cmd, Alt or Shift, or with anything but the left button (source, lines 277–281), so opening a tab in a new browser tab still works.
- **Fits our tabs:** its `Link` accepts `aria-current`, which the tabs need to mark the current page. React Aria's `Link` doesn't (checked in its types), so `NavTabs` uses wouter's `Link` directly and React Aria's router integration isn't needed.

**Options considered:**

- React Router (8.4, +14 KB, 65M weekly downloads): the standard every reviewer knows, but more than two pages need.
- About 30 lines of our own: no dependency, but link clicks, Back/Forward and their edge cases would be ours to get right and test.

## 31. The Docs tab renders Markdown with react-markdown

**Decision:** The Docs tab (decision 20) renders the repo's Markdown with [react-markdown](https://github.com/remarkjs/react-markdown) 10 and its table plugin, remark-gfm, because our docs use tables.

**Cost:** about +48 KB compressed, loaded only when someone opens the Docs tab, so the dashboard doesn't pay for it. 41M weekly downloads.

**Why:** It's the standard way to show Markdown in React. It turns Markdown into React elements rather than raw HTML, so no HTML injection is involved.

## 32. The Inter font ships with the app

**Decision:** The design's fonts come from [Fontsource](https://fontsource.org/)'s `@fontsource-variable/inter` (version 5.3, 5.3M weekly downloads), bundled with our app and served from our own site. We use its optical-size edition, one variable font file (71 KB for Latin characters) that covers both:

- **Inter**, for all regular text
- **Inter Display**, for the 35px title. It isn't a separate font: it's Inter's version drawn for large sizes, and the browser switches to it automatically at large sizes.

Only the Latin file downloads, because Fontsource splits the font by alphabet.

**Why:** It's the design's exact font, from one file, with no outside services. Nothing contacts Google, it works behind strict company networks, and the browser caches it.

**Options considered:**

- Google Fonts: one line in the page, but every visitor's browser contacts Google, which companies increasingly avoid for privacy reasons, and the page depends on Google being reachable.
- Each computer's built-in fonts: nothing to load, but the page would no longer match the design.

## 33. Code-quality tools: strict TypeScript, ESLint and Prettier

**Decision:**

- **TypeScript** in its strictest mode.
- **Node 24**, the current long-term-support version, which Vercel supports.
- **ESLint** (a linter: it flags bugs and risky patterns) with typescript-eslint, which uses type information to catch real bugs such as a forgotten `await`, and the React team's Hooks rules.
- **Prettier** (a formatter: it rewrites spacing and line breaks automatically, so style is never discussed).

Versions and popularity checked on 2026-10-01: ESLint 10.11 (185M weekly downloads), Prettier 3.9 (158M), typescript-eslint 8.71 (104M), React Hooks rules 7.1 (113M).

**One caveat:** the usual accessibility lint plugin (`eslint-plugin-jsx-a11y`, 55M weekly) hasn't had a release since October 2024. We check that it works with ESLint 10 during setup and drop it if it doesn't. React Aria and the automated accessibility checks in tests cover the same ground.

**Update (2026-10-01, while planning):** its latest release (6.10.2) supports ESLint only up to version 9, so it's dropped.

**Why:** It's the standard reviewers expect, and the type-aware checks catch the bugs that matter most in our data-loading code.

**Options considered:**

- Biome (18.9M weekly): one fast tool for both jobs, with a simpler setup and built-in React and accessibility rules, but fewer rules and weaker type-aware checks.
- Oxlint + Prettier (26.5M weekly for Oxlint): a very fast linter that re-implements ESLint's popular rules, but it's newer and its type-aware checks are still maturing.

## 34. The README says how AI was used

**Decision:** The README has a short, honest section on how AI was used, along these lines: "I used Claude Code as a pair: for research, drafting and code. Every decision was mine, and each one is recorded with its reasoning in the decisions docs. I reviewed and understand all of the code." The exact wording is settled at the final docs stage.

**Why:** The brief says to use LLMs however you normally would, so using one is fine. Saying how answers the question before it's asked, and it points reviewers to the decisions docs as evidence of the human judgment they want to assess.

**Options considered:**

- Not mentioning it: allowed, but reviewers may wonder, and it would come up in the walkthrough anyway.
- A detailed account (which parts were AI-written, the prompts used): very transparent, but long, and it shifts the focus from the result to the process.

## 35. The API: one address, one answer shape, one error shape

**Decision:**

- **One address:** `GET /api/client-counts?period=…`. It's named after the glossary's "client count"; `/api/clients` would suggest a list of client records.
- **`period`** is one of `last-12-months` (the default), `last-6-months`, `last-3-months` or `last-month`. The list lives in `packages/contract`, so the server's check and the page's dropdown can never disagree.
- **The answer (200):** `{ "months": [...], "company": {...} }`. `months` lists the months covered, and every row's `values` is trimmed to exactly those months, in the same order. `company` is the brief's payload, plus Anna's `avatarUrl` (decision 16).
- **Errors** share one shape, `{ "error": { "code", "message" } }`: 400 with `invalid_period` for an unknown period, and 500 with `internal_error` when something breaks or the demo "fail" switch is on. The page shows its own friendly message; the server's message is for developers.
- **Demo notes** travel in a request header, `X-Demo: slow`, `fail`, or both. "slow" waits 2 seconds and "fail" answers with a 500. The server only listens when its `DEMO_MODE=true` setting is on (locally, and on the hosted demo).
- **No caching:** answers carry `Cache-Control: no-store`, so every request really reaches the server. Otherwise a cached answer could hide a switched-on demo.
- **On the server:** the data file is the brief's payload, copied exactly, plus Anna's `avatarUrl`. The first month (`2024-02`) sits next to it as a setting, because the payload has no dates. Picking the months is one small, pure function. Anna's photo is served as a static file by the page's hosting.

**Why the demo notes are a header:** they must apply to one request from one browser. On the hosted demo, several reviewers may be using the page at once, and one person's "fail" must not break it for others. A header does that, and keeps the API's address limited to real parameters. Headers are the usual place for information about a request, as opposed to what's being requested.

**Options considered for the demo notes:**

- A parameter in the address (`&demo=fail`): also per request and easy to try by hand, but it mixes a debug instruction into the real API's address.
- A cookie: sent automatically, but it's hidden, sticky state that affects every request.
- A switch stored on the server: nothing to send with each request, but it would affect every visitor at once.

## 36. Few, meaningful tests (provisional)

**Decision (to be revisited):** A small set of about 10–12 tests, each tied to a realistic bug it would catch, following [testing-strategy.md](testing-strategy.md), which also holds the research behind it. In short:

- Test what the user sees and does; fake only the network (MSW); never mock our own code.
- Mostly whole-app tests in Vitest's simulated browser, a few API tests, at most one pure-function test (what the chart shows), and one or two real-browser tests with Playwright, written last.
- Expected values are literal numbers from the brief's data, never computed with our own code.
- Every test is seen failing once, by breaking one line on purpose.
- The list is agreed before tests are written, and nothing is added without a reason.

**Why:** It follows what experienced developers recommend, and it guards against the known problems with AI-written tests: tests that restate the code, tests that can't fail, and too many tests.

**Open questions:** whether server tests are in scope for a frontend assignment (the whole-app tests already run through the real server logic), and whether the list is right. Both are revisited before tests are written.

**Update (2026-10-01):** testing moves to the last step of the build, and the list is decided then.

**Options considered:**

- Unit and component tests only: covers the brief, but real-browser behaviour (layout at 375px, real focus) goes unchecked.
- Real-browser tests only: closest to real use, but slow, and small pieces of logic can't be tested on their own.

## 37. A "Components" tab shows our UI components

**Decision:** A third tab, "Components" (`/components`), between Dashboard and Docs. It's a gallery page that shows each component from our own small design system (`ui/`) in its main states, with small sample data, for example:

- the table with rows open and closed, and a row with nothing inside
- the chart with one, three and five colours
- the avatar with a photo and with initials
- the dropdown and the switches

It loads only when opened. Each component's examples sit in one file next to it (e.g. `TreeTable.examples.tsx`), written in the same shape as Storybook stories: a named example that renders the component in one state.

**Why:** Reviewers see the design-system side of the work inside the app, with no extra tools to install, build or host. Nevis's job ad mentions shaping a design system.

**Later:** "Move the examples to Storybook" is a README follow-up. Because the examples are written story-style, that's mostly copying.

**Options considered** (checked 2026-10-01):

- Storybook 10, the industry standard (26.9M weekly downloads, 91k stars, released 2026-09-29): stories, live controls, a per-story accessibility checker, documentation pages, and stories that can run as tests. It can be served from the same deployment (e.g. under `/storybook/`), but it's still a separate app, with its own build, setup, dependencies and interface; our tab would open it or embed it in a frame. It pays off for a team with dozens of components, and it's heavy for our eight or so.
- Ladle: a lighter Storybook-like tool using the same story format, but used far less (345K weekly) and last released 11 months ago.

## 38. Component APIs: one rule for choosing the style

**Problem:** The brief asks for component APIs "the way you would on a real team: composable, with clear boundaries". There are two common styles: compound components (a set of parts you assemble, like HTML's `<table>`, `<tr>`, `<td>`) and props (one component configured with data).

**Decision:** One rule decides the style:

| When | Style | Our components |
|---|---|---|
| The user of the component assembles its structure | Compound parts | `NavTabs` (`NavTabs.Link` for each tab) |
| The component is driven by data | Props with render functions | `TreeTable` (columns described as data), `StackedColumnChart` (`renderLabel`) |
| A simple control or container | Plain props | `Select`, `Switch`, `Avatar`, `Skeleton`, `Card`, `Button` |

**`TreeTable` in practice:** the feature describes each column once, with its header and a `cell` function for drawing that column's cell. `TreeTable` handles the tree itself: the recursion into children, chevrons only on rows that can open, indentation, ignoring clicks on rows without children, and the pinned first column.

```tsx
<TreeTable
  label="Client counts per month"
  rows={[tree]}
  getRowId={(row) => row.id}
  getChildren={(row) => row.children}
  openRowIds={openRowIds}
  onRowOpenChange={onRowOpenChange}
  columns={[
    { id: 'name', header: 'Name', hideHeader: true, isRowHeader: true, cell: (row) => <RowName row={row} /> },
    ...months.map((month, i) => ({ id: month, header: formatMonth(month), align: 'end', cell: (row) => formatCount(row.values[i]) })),
  ]}
/>
```

It stays generic, knowing nothing about clients, and TypeScript checks that every `cell` function receives the right row type.

**Why:** Our rows are all alike (a name, then one number per month), so columns described as data fit naturally. That's the usual shape for data tables (TanStack Table, AG Grid, MUI's Data Grid). The recursion lives once inside `ui/`, instead of in every feature that uses the table. The `cell` functions keep it composable: the feature decides what goes inside each cell, such as the avatar.

**Options considered:**

- A compound `TreeTable` (`TreeTable.Header`, `.Column`, `.Body`, `.Row`, `.Cell`, `.ChildRows`): anything goes, but every feature would write the tree recursion itself, which is React Aria's way of thinking leaking out of `ui/`.
- Compound everywhere: maximum flexibility, but simple controls like a switch become verbose to use.
- Plain props everywhere, without render functions: short to use, but every new need becomes another special-case prop.

## 39. The page's details that Figma doesn't cover

**Decision (approved as defaults, may be revisited):**

- **Layout, following the design:** the top bar, the title row ("Clients" with the period dropdown on the right), the chart card (caption, chart, legend), then the table card. The page fills the window with the design's 16px side padding, and on very wide screens the bars stop growing at the design's width.
- **New elements, styled from the design's colours, fonts and corners:**
  - Top bar: a white strip with a thin bottom border. Tabs are text links, the current one in full ink with a 2px underline and the others at 60%. The demo switches sit on the right.
  - Chart label: a small white card with a thin border and 8px corners, listing the month, each part with its colour square and number, and the total.
  - Loading placeholders: light grey blocks shaped like the page, with a gentle pulse.
  - Error: "Couldn't load clients" and a "Try again" button (a `Button` in `ui/`), replacing the chart and table.
  - Keyboard focus: a 2px outline in the ink colour.
- **Behaviour defaults:**
  - Every row gets the design's hover shade (a reading aid across 12 columns), but only rows that can open show the "clickable" hand cursor.
  - Numbers have thousands separators, and months read "Feb 2024" ("Feb" on phones, decision 15).
  - The chevron turns smoothly and the chart's bars move briefly when they change. With the system's "reduce motion" setting on, nothing animates.
  - Browser tab titles: "Clients · Nevis home task", with matching titles for Components and Docs.
  - The code survives cases our data doesn't have: a company with no branches shows the company row alone, and a row with nothing to split shows a single colour.

**How new components get their look:** any component without a Figma design (the top bar and tabs, the dropdown, the switches, the chart label, the placeholders, the error state, the button) first gets a visual mockup of all its states, made by an agent. It's built only after the repo owner approves the mockup.

## 40. Versions: current releases, with two deliberate exceptions

**Decision:** Use the current stable release of everything, as checked on 2026-10-01, with two exceptions:

- **TypeScript 6.0.3, not 7.0.** TypeScript 7 is the new compiler rewritten in Go, but typescript-eslint (decision 33) supports only TypeScript below 6.1 so far. Its type-aware checks are the reason we chose it, so we stay on 6.0, the last release before the rewrite, which follows the same language rules. Upgrading is a README follow-up for when typescript-eslint supports 7.
- **MSW 2.15, not 3.0.** MSW 3.0 came out on 2026-09-28, three days before this decision. In a time-boxed project, a brand-new major version is an avoidable risk: fresh bugs, and docs and examples still catching up. 2.15 has been stable since July.

Every other tool's current major version has been out for at least four weeks. The full list is in the design doc.

## 41. Styling rules, adapted from existing styling standards

**Decision:** Our CSS follows a set of styling standards the repo owner uses in another project. We take them as good practice rather than rules to follow to the letter. The details are in the design doc (§5.8). We adopt:

- **Units that respect the reader's text size:** rem for font sizes, spacing and widths; px only for borders, outlines and dividers; unitless line heights; no font size set on the page root.
- **Tokens instead of raw values:** components use tokens (one layer, named by purpose) for colours and sizes, never raw values.
- **Closed `ui/` components:** code that uses them can't restyle them. They accept no `className` or `style` props, and every allowed variation is an explicit option the component offers, such as `variant="secondary"`. Components have no outer margins; the parent's layout places them (e.g. with `gap`). This keeps every button looking like every other button, and when one looks odd, there's only one place to check. The cost is that a one-off need means adding an option. (Confirmed separately, after considering open components and a "`className` for placement only" middle ground.)
- **React Aria states** styled through their data attributes, so hover doesn't stick after a tap on touch screens. Every state of every interactive component is styled and shown in the Components tab.
- **Layout that doesn't break:** rem media queries, no fixed heights on text, long names wrap.
- **Motion:** animate only `transform` and `opacity`, and keep non-essential motion off under reduced motion.
- **Minimal global CSS,** and Lightning CSS so newer CSS syntax works in every supported browser.
- **Accessibility details:**
  - WCAG 2.2 AA contrast
  - focus never hidden behind the pinned table column
  - zoom never restricted
- **A check for every UI change:** narrow widths, large text and 200% zoom, keyboard only, forced colours, reduced motion, contrast, and a phone.

**Adapted, because the standards were written for a Next.js project:**

- `next/font` becomes Fontsource (decision 32).
- Turbopack becomes Vite with Lightning CSS.
- Storybook becomes our Components tab (decision 37).

**Not adopted:**

- **Two layers of tokens** (raw values plus purpose-named tokens pointing at them): one layer is enough for an app this size.
- **Mobile-first layout:** the design is a desktop layout, and narrow screens only need to not break (decision 15). Base styles follow the desktop design, and a few media queries adjust narrow screens.

**Deliberate deviations:**

- **Line height:** the standards ask for at least 1.5 on body text. The table and chart keep the design's 14/20 (1.43) to match it; the Docs page's prose uses 1.5 or more.
- **Width:** the brief asks for 375px, and the standards ask for 320px (WCAG's reflow rule). We check both, since it costs little.

**Checked:** the design's grey text (the ink at 60%) reaches 4.81:1 contrast on the white cards and 4.68:1 on the page, above the 4.5:1 minimum. The focus outline is 18.4:1.

**Why:** These practices cover accessibility (text size, zoom, touch, forced colours), consistency (closed components, tokens) and performance, without inventing our own rules.
