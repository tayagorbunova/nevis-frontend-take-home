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

- On the left, two tabs: "Dashboard" and "Docs".
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
