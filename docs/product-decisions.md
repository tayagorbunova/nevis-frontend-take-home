# Product decisions

The brief and the design left some things open. Here are the questions I had, what I decided, and what I'd explore next.

## What wasn't clear, and what I decided

### What should the chart show?

The design shows the company split by channel: existing clients, new organic and new paid. But the data only includes that breakdown for one advisor, Anna Blackwood. There isn't enough information to draw the same chart for a branch or the whole company.

I decided that the chart follows the table. It shows the row you opened last, split by what's inside it: the company by branch, a branch by advisor, and an advisor by channel. That last view matches the breakdown in the design.

So the chart goes down level by level as you open rows.

### What should the initial state of the chart be?

This depends on something the brief doesn't say: can there be more than one company in the table?

I assumed one company per dashboard. Each company should only see its own clients, and the data has a single company at the top. A realistic exception would be a group that owns several firms and wants a combined view. That would add a level above Company, which I left out of scope.

The page opens with the company row expanded, as in the design, and the chart starts with the company split by branch.

### What happens when the numbers don't add up?

There are three sets of mismatches between a row's total and the rows inside it:

- **Company, May 2024:** 301, but its branches add up to 279. Maria Gutierrez's May number is 22, which may be a typo for 44.
- **Branch 1, August 2024:** 214, but its advisors add up to 216. Robert Chen's August number is 58; the design has 56, which adds up.
- **Anna Blackwood, May to September 2024:** her channels are off by 1 or 2 each month. Her "New paid" numbers are shifted by one month compared to the design, where they add up.

These look like data-entry mistakes, but I can't be sure. Even correct totals don't always equal the sum of the rows below them. For example, a client with no assigned advisor might count for the company but not for anyone below it.

I don't know enough about how the numbers are calculated to decide, so I show the numbers exactly as they were given to me. In a real project I'd ask the product or backend team, and a mistake would be fixed on the server.

### Which months do the numbers belong to?

Each row has 12 numbers, but the data doesn't say which months they represent. Only the brief does: February 2024 to January 2025.

The page could assume a rule such as "always the last 12 months", but that would fail silently. With this dataset, it would already be wrong because the numbers end in January 2025. And even when it's right, the same fact lives in two places, the server and the page, that can drift apart.

So I decided that the server sends the months together with the numbers, and the page only turns them into labels such as "Feb 2024". The dates are part of what the data means, so they belong in the response.

## Filling in the design gaps

Some things weren't in the Figma file, or the design and the data didn't match.

### Advisor photos

The design shows a photo next to each advisor, but the data has no images.

I added a photo for Anna Blackwood to show what a row with a photo looks like. Her photo link is the only addition I made to the supplied dataset. The other advisors show their initials.

### Expandable rows

The design puts an arrow on every row, but most rows have nothing inside them. In the prototype, those arrows do nothing.

I only show an arrow when a row has something to open. Branch 2, Branch 3 and four of the five advisors therefore have no arrow, but their names still line up with the surrounding rows.

### Chart colours

The design has three colours, one per channel. But the chart also needs to show three branches and five advisors.

I kept the original three colours and added two in the same soft style. The channel view keeps the design's colours, and each of the five advisors gets a different colour.

### Chart caption

The design's chart has no title. Since my chart changes with the table, it needs a short explanation of what it's showing.

I added a caption at the top of the chart card: "Company by branch", "Branch 1 by advisor" or "Anna Blackwood by channel".

### Exact values in the chart

The design doesn't show a tooltip, and exact numbers are hard to read from stacked columns.

I added a tooltip for each month, available by mouse, keyboard and touch. Hover over a column, tap it, or focus the chart and use the arrow keys to see its values. Screen readers read it out too.

### Loading and error states

The brief asks for loading and error states, but the design shows neither.

On first load, grey placeholders reserve space for the chart and table. When you change the period, the previous numbers stay on screen, slightly faded, until the new ones arrive. If the request fails, an error message and a "Try again" button replace the chart and table.

### Small screens

The design shows one desktop screen, and a table with 13 columns won't fit on a phone. The brief asks that nothing breaks or overflows down to 375px wide.

I interpreted that as keeping the page within the screen while allowing the table to scroll sideways inside its own card. The names stay in place while the months scroll past them. The chart keeps all its columns, with narrower bars to fit the available space.

### Period selection

The brief and the design always show the same twelve months, with no way to look at a shorter period.

I added a dropdown with four presets: "Last 12 months", "Last 6 months", "Last 3 months" and "Last month". This wasn't requested, but I thought it would be useful.

The chart and table both show the selected period. "Last" counts back from the latest month in the data, so "Last 3 months" means November 2024 to January 2025 for this dataset.

### Demo controls

The "Slow responses" and "Fail requests" switches in the top bar are there for the demo, so you can try the loading and error states.

## What I'd explore next

- **Custom date ranges.** I'd extend the preset filter so people can choose a start and end month.
- **Shareable views.** I'd first clarify which parts of the dashboard people want to share. The selected period and expanded rows could then be kept in the URL.
- **Who sees what.** An advisor could land on their own clients, while a manager sees the company. That needs authentication and access rules enforced by the server, including for shared links.
- **More than five advisors.** Advisors after the fifth all use the same grey. For a larger team, I'd consider a bigger designed palette, generated colours that keep the same style and enough contrast, or showing the advisors with the most clients and grouping the rest as "Other".
- **Showing the trend.** I'd explore showing the change directly, such as "+17" for the company in March 2024, when the count went from 250 to 267. How best to present it is an open design question.
- **Channels at every level.** If the server supplied channel data for every row, the chart could offer a switch between the current breakdown and a breakdown by channel. The company view could then match the design's chart.

## Performance

Performance is another follow-up, but it covers several parts of the app, so I've given it a separate section.

With a dozen rows there's nothing to optimise yet, but a real company could have hundreds of advisors and several years of data. I'd expect three problems: the server's answer gets too big, the table gets too long to draw smoothly, and the chart gets too crowded to read. The usual solutions are to load data only when it's needed (for example, a branch's advisors when the branch is opened), to draw only the rows that are on screen, and to group or limit what the chart shows. I'd measure with realistic data before changing anything.
