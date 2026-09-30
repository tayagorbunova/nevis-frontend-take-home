# Chart library comparison

Which library should draw the stacked column chart? This compares ten candidates on two things: how well each fits our chart, and how popular and alive it is, meaning how likely it is to be abandoned, or to leave a bug we hit unfixed. All numbers were collected on 2026-10-01 (see [How this was checked](#how-this-was-checked)). The decision itself is recorded in [decisions.md](decisions.md).

## What our chart needs

- Stacked columns for 1–12 months, with 1–5 parts per column.
- The design's look: each column clipped as one shape with 4px rounded corners, dotted gridlines, small grey axis labels, and a legend (which we render ourselves).
- Labels on hover, tap and keyboard, one Tab stop, ← / → between months (decision 18), and something for screen readers.
- Tests that check how the data maps into the chart.
- A reasonable weight: React on its own is 67 KB of compressed JavaScript.

## How well each fits our chart

| Library | Draws with | The design's rounded columns | Keyboard | Screen readers | Tests in our setup | Licence | Adds to the page |
|---|---|---|---|---|---|---|---|
| **Recharts 3** | SVG | Yes, built in (`BarStack`) | On by default: one Tab stop, ← / → by month. No Home/End or Escape | Reads the label aloud as you move; chart title and description | Work with a fixed chart size | Free (MIT) | +116 KB |
| **Chart.js 4** (+ react-chartjs-2) | Canvas | Close: only the ends of each stack are rounded | None | Only a description of the whole canvas | Canvas has to be faked; bars can't be inspected | Free (MIT) | +55 KB |
| **ECharts 6** (+ echarts-for-react) | Canvas or SVG | No | None | An auto-generated description | Not documented | Free (Apache/MIT) | +191 KB |
| **Highcharts 13** | SVG | Yes, built in | The fullest: ← / →, Home/End, Escape | Rich descriptions built in | Layout only approximate | **Paid for commercial use** | +144 KB |
| **AG Charts 14** | Canvas | Only the top of each stack | ← / → between items, Home/End | Not confirmed | Canvas has to be faked | Free edition (MIT) + paid edition | +400 KB |
| **MUI X Charts 9** | SVG | Top corners only; the bottom stays square | On by default: ← / → within one colour | Reads the focused bar | Hover tests don't work | Free (MIT) + paid tiers | +162 KB, and brings MUI's own styling system |
| **Nivo** | SVG or canvas | Only per part, not the whole column | Off by default; when on, every part is its own Tab stop, no arrow keys | A label per part | Only with a fixed size | Free (MIT) | +104 KB |
| **visx 4** | SVG | We draw it with its helpers | We build it | We build it | Easy | Free (MIT) | +26 KB |
| **Victory 37** | SVG | Only per part | Each bar can be made its own Tab stop; no arrow keys | A label per bar | Not confirmed | Free (MIT) | +131 KB |
| **Observable Plot** | SVG | No | None | A label per element | Works | Free (ISC) | +88 KB, and it isn't a React component |

## How popular and alive each one is

What the columns mean:

- **Weekly downloads**: installs from npm last week. They include indirect installs (other packages depending on it) and automated builds, so they overstate direct use, but they're the standard popularity measure.
- **Stars**: GitHub bookmarks. They show accumulated interest over the years, not current use.
- **Releases (12 months)**: stable versions published in the last year.
- **Commits / people (12 months)**: code changes in the last year, and how many different people made them. Very large numbers at companies can include automated commits.
- **New issues (90 days)**: bug reports and requests opened in the last 90 days, and how many of those are already closed.
- **Merged PRs (90 days)**: code contributions accepted in the last 90 days.

| Library | Weekly downloads | Stars | Latest release | Releases (12 months) | Commits / people (12 months) | New issues, 90 days (closed) | Merged PRs (90 days) | Maintained by |
|---|---|---|---|---|---|---|---|---|
| **Recharts** | **67.9M** | 27.6k | 3.10.1, Jul 2026 | 14 | 1,046 / 27 | 48 (29) | 274 | Volunteer community project |
| **Chart.js** | 14.7M | **67.7k** | 4.5.1, Oct 2025 | 1 | 21 / 4 | 10 (2) | 10 | Volunteer community project |
| ↳ react-chartjs-2 | 5.5M | 6.9k | 5.3.1, Oct 2025 | 1 | 44 / 3 | 0 | 0 | Volunteer community project |
| **ECharts** | 6.1M | 67.4k | 6.1.0, May 2026 | 1 | 266 / 23 | 30 (7) | 20 | Apache Software Foundation |
| ↳ echarts-for-react | 1.7M | 5.0k | 3.0.6, Jan 2026 | 5 | 4 / 3 | 1 (0) | 0 | Mostly one person |
| **Highcharts** | 3.0M | 12.5k | 13.1.1, Sep 2026 | 10 | 6,352 / 37 | 176 (78) | 207 | Highsoft (a company) |
| ↳ @highcharts/react | 0.24M | 1.2k | 5.3.0, Aug 2026 | 9 | 33 / 4 | 5 (3) | 4 | Highsoft |
| **AG Charts** | 2.1M | 0.5k | 14.2.0, Sep 2026 | 14 | 10,921 / 27 | 7 (5) | 963 | AG Grid (a company) |
| **MUI X Charts** | 1.2M | 5.9k | 9.14.0, Sep 2026 | 46 | 2,334 / 82 | 123 (81) | 483 | MUI (a company); GitHub numbers cover all of MUI X |
| **Nivo** | 1.1M | 14.1k | 0.99.0, May 2025 | 0 | 24 / 7 | 3 (1) | 2 | Mostly one person |
| **visx** | 6.5M | 21.1k | 4.0.0, Jun 2026 | 1 | 121 / 11 | 3 (0) | 0 | Airbnb |
| **Victory** | 0.53M | 11.2k | 37.3.6, Jan 2025 | 0 | 3 / 1 | 1 (0) | 0 | Nearform (formerly Formidable) |
| **Observable Plot** | 0.84M | 5.4k | 0.6.17, Feb 2025 | 0 | 38 / 5 | 7 (2) | 0 | Observable (a company) |

## Risk of being abandoned or leaving our bugs unfixed

| Library | Risk | Why |
|---|---|---|
| **Recharts** | Low | The most-used React chart library by far. A release roughly every month, 27 people committing, 274 merged contributions in 90 days, and most new issues get closed. It's run by volunteers rather than a company, so the risk isn't zero. |
| **Highcharts** | Low | A company's paid product, released about monthly. But it needs a paid licence for commercial use. |
| **MUI X Charts** | Low | A company's product, released every one to two weeks. |
| **AG Charts** | Low | A company's product, very active. |
| **ECharts** (core) | Low | An Apache Software Foundation project with 23 people committing, though most new issues stay open. |
| ↳ echarts-for-react | High | Mostly one person, no activity since January, and **malicious versions were published to npm in May 2026**. |
| **Chart.js** | Medium | Hugely used, but activity has dropped to a trickle: one release and four people in a year, and 2 of 10 new issues closed. Its React wrapper had one release in a year. |
| **visx** | Medium | Owned by Airbnb, but releases are rare: one in the last year, after a gap of about a year and a half. No contributions merged in 90 days. |
| **Observable Plot** | Medium–high | No release for 19 months, and no contributions merged in 90 days. |
| **Nivo** | High | No release for 16 months, mostly one person. |
| **Victory** | High | Three commits by one person in a year, and no release since January 2025. |

## Conclusion

- **Popularity:** for React apps, Recharts is far ahead (67.9M weekly downloads, against 5.5M for Chart.js's React wrapper). Chart.js has the most GitHub stars because it's older and works with any framework, not because it's used more in React.
- **Best fit and best health together:** Recharts. It's the only free library that draws the design's rounded columns exactly, its keyboard support covers the core of decision 18 by default, and it's the most actively maintained of the free options.
- **Worth knowing:** Highcharts has the richest accessibility, but its licence rules it out for a product like Nevis's without buying it. Chart.js is half Recharts' size, but it's now barely maintained and draws on a canvas.

## How this was checked

- **Fit, licence and features:** each library's own documentation, and where the docs were silent, its source code at the released version. Research done on 2026-10-01.
- **Size:** a minimal stacked column chart with axes and hover labels for each library, bundled with esbuild (minified, then gzip-compressed). "Adds to the page" is that size minus React's own 67 KB.
- **Popularity and health:** npm's download API (last week) and registry (release dates), and GitHub's API (stars, commit and issue searches, contributor statistics), collected by a script on 2026-10-01. The 12-month window starts on 2025-10-01 and the 90-day window on 2026-07-03.
