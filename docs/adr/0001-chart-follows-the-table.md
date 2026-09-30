# The chart follows what you open in the table

The design's chart splits the whole company by acquisition channel, but the data only has channels for one advisor, so that chart can't be drawn. We decided the chart shows the breakdown of the most recently opened table row (the company by branch, a branch by advisor, an advisor by channel), starting with the company open, so the chart and the table always describe the same thing.

## Considered options

- A fixed chart of the company split by branch: simple, but the chart could never zoom in, and it never looks like the design.
- A channel split at every level, with clients who have no channel data shown as "unknown": matches the design's legend, but about 90% of every company bar would be "unknown".

## Consequences

- What the chart shows depends on which table rows are open, so the chart and the table read from one shared piece of state instead of each keeping their own.
- Opening a row just to read its numbers also changes the chart. A caption above the chart always says what it shows, so the change is never silent.
- For the one advisor with channel data, the chart looks exactly like the design.
