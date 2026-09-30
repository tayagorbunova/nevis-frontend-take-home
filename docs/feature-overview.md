# Feature overview

A plain-language summary of what we're building and why. Word definitions live in [GLOSSARY.md](../GLOSSARY.md).

## Who is who

- **Clients**: ordinary people or families with savings. They pay a professional to manage their money, for example to invest it or plan for retirement.
- **Advisors**: those professionals. Each advisor looks after their own list of clients.
- **Company**: the advisory firm that employs the advisors, often across several offices called **branches**.
- **Managers**: people who run a branch or the whole company.
- **Nevis**: a software company. It sells its app to advisory firms, and the advisors use it at work.

The clients are the advisors' clients, not Nevis's. Nevis's customer is the company.

An analogy: a chain of dental clinics. Patients see dentists, dentists work in clinics, the chain owns the clinics, and Nevis is the company selling the chain its software.

```text
Nevis ── sells its app to ──▶ the company
                               ├─ Branch 1 (an office)
                               │   ├─ Anna Blackwood (advisor) ── her 25–38 clients
                               │   ├─ James Walker (advisor)
                               │   └─ … 3 more advisors
                               ├─ Branch 2
                               └─ Branch 3
```

## Book of business

Industry slang for an advisor's list of clients, like a dentist's list of patients. "Growing your book" means gaining clients. Here it's measured as a number: how many clients someone has each month.

## The feature

A screen in Nevis's app called **Clients**. It answers one question: how many clients do we have each month, and is that number going up?

- **Managers** look at the whole company, one branch or one advisor.
- **Advisors** look at their own clients.

It also shows how clients arrived, which the brief calls the **acquisition channel**:

- **Existing clients**: people who were already clients the month before.
- **New organic**: new clients who came for free, for example recommended by a friend.
- **New paid**: new clients who came through paid advertising.

Anna Blackwood, from the data:

| Month | Total | Already hers | Recommended | From ads |
|---|---|---|---|---|
| March 2024 | 26 | 25 | 1 | 0 |
| April 2024 | 28 | 26 | 1 | 1 |

## The screen

- **Chart**: one bar per month, 12 bars. A bar's height is the total number of clients. Its colours split that total into existing clients (purple), new organic (peach) and new paid (dark red). At a glance you see whether the number is growing and where new clients come from.
- **Table**: the same numbers, exactly. One column per month, and one row each for the company, its branches, its advisors and their channels. Clicking a row opens it to show the level beneath.

## The data we're given

- A tree: Company → 3 branches → 5 advisors (only in Branch 1) → 3 channels (only for Anna Blackwood).
- Every row has an id, a name and 12 numbers: its client count for each month from February 2024 to January 2025. The months themselves aren't in the data; they come from the design.
- The tree is deliberately uneven: Branch 2 and Branch 3 have no advisors listed, and only Anna has a channel split.
- Because only Anna has a channel split, the design's chart (the whole company split by channel) can't be drawn from this data. How we handle that is a decision recorded in the design docs.
- In three places a row's number doesn't equal the sum of the rows inside it:
  - Company, May 2024: 301, but its branches add up to 279.
  - Branch 1, August 2024: 214, but its advisors add up to 216.
  - Anna Blackwood, May to September 2024: her channels are off by 1 or 2 each month.
- The design shows the same layout with some different numbers, so its numbers are placeholders. The brief tells us to serve the data, so the data is what we show.
