# Testing strategy

> **Status: draft, to be revisited before tests are written.** Open questions are at the end.

A small set of tests that each protect a real behaviour, rather than many tests that restate the code. This doc covers the research behind the plan (done on 2026-10-01), the plan itself, what we deliberately don't test, and the guardrails against the usual problems with AI-written tests.

## What experienced developers agree on

- **Test what the user sees and does,** through the screen (roles, names, visible text), not the code's internals. Tests coupled to implementation details fail on harmless refactors and still miss real bugs. ([Kent C. Dodds: Testing implementation details](https://kentcdodds.com/blog/testing-implementation-details), [Testing Library's guiding principles](https://testing-library.com/docs/guiding-principles), [Google Testing Blog: test behaviour, not implementation](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html))
- **Tests that only restate the code are "change detectors"** with negative value: delete or rewrite them. ([Google Testing Blog: Change-detector tests](https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html))
- **Mostly whole-feature (integration) tests, very few real-browser tests,** with TypeScript and the linter as a free bottom layer. The higher the level, the fewer the tests. ([Dodds: Write tests](https://kentcdodds.com/blog/write-tests), [The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications), [Ham Vocke: The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html))
- **Start from use cases, and from "what would hurt most if it broke"**, not from files. Coverage shows untested areas but is a bad target. ([Dodds: How to know what to test](https://kentcdodds.com/blog/how-to-know-what-to-test), [Martin Fowler: TestCoverage](https://martinfowler.com/bliki/TestCoverage.html))
- **Fake only the network,** with MSW, instead of mocking `fetch` or our own modules, and check how the UI reacts rather than which request was sent. ([Dodds: Stop mocking fetch](https://kentcdodds.com/blog/stop-mocking-fetch), [MSW: avoid request assertions](https://mswjs.io/docs/best-practices/avoid-request-assertions), [Google Testing Blog: Don't overuse mocks](https://testing.googleblog.com/2013/05/testing-on-toilet-dont-overuse-mocks.html))
- **Fewer, longer tests** shaped like a user's workflow. Several checks in one test are fine. ([Dodds: Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests))
- **A good test is behavioural, insensitive to code structure, deterministic, specific and predictive.** These properties trade off against each other, so use them as a review checklist. ([Kent Beck: Test Desiderata](https://testdesiderata.com/))
- **Snapshots only when small and deliberate;** big ones get re-recorded without being read. ([Dodds: Effective snapshot testing](https://kentcdodds.com/blog/effective-snapshot-testing))
- **Flaky tests destroy trust.** Isolate state, never sleep, control time, keep real-browser tests few. ([Martin Fowler: Eradicating non-determinism](https://martinfowler.com/articles/nonDeterminism.html), [Playwright best practices](https://playwright.dev/docs/best-practices))

## How AI-written tests go wrong, and our guardrails

| Failure mode | Evidence | Our guardrail |
|---|---|---|
| **Tautological tests:** the expected value is computed the same way the code computes it, so the test can never disagree. | [Birgitta Böckeler: TDD inside the agent loop (2026)](https://martinfowler.com/articles/exploring-gen-ai/tdd-in-the-agent-loop.html), [Matt Pocock's `tdd` skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md) | Expected values are literal numbers from the brief's data (e.g. 301), noted where they come from. |
| **Coverage that checks nothing:** in one experiment, 13 bugs planted on purpose in chart-mapping code with 100% coverage went unnoticed. | [Böckeler: Maintainability sensors (2026)](https://martinfowler.com/articles/sensors-for-coding-agents.html), [Thoughtworks Radar: mutation testing](https://www.thoughtworks.com/radar/techniques/mutation-testing) | Every test gets a "one-line break": break the code on purpose, watch the test fail, undo. |
| **Cheating to get green:** tests disabled, skipped, loosened or deleted. | [Kent Beck: Augmented coding (2025)](https://newsletter.kentbeck.com/p/augmented-coding-beyond-the-vibes), [Böckeler: Pushing AI autonomy (2025)](https://martinfowler.com/articles/pushing-ai-autonomy.html) | Test changes are reviewed like production code: look for `.skip`, `.only`, loosened checks and deleted assertions. |
| **Tests as ceremony:** written after the code and never seen failing, they give false security. | [Mark Seemann: AI-generated tests as ceremony (2026)](https://blog.ploeh.dk/2026/01/26/ai-generated-tests-as-ceremony/), [Simon Willison: red/green TDD](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/) | We read each failure message ourselves during the one-line break. |
| **Mocking everything:** tests end up checking the mocks. | [Google Testing Blog](https://testing.googleblog.com/2013/05/testing-on-toilet-dont-overuse-mocks.html) | The network (MSW) is the only fake. |
| **Too many tests,** with unexplained numbers and pointless checks. At Meta, only a quarter of generated test cases added coverage. | [arXiv 2410.10628](https://arxiv.org/abs/2410.10628), [Meta: TestGen-LLM](https://arxiv.org/abs/2402.09171) | The list below is agreed first, and nothing is added without a reason. |

**Matt Pocock's `tdd` skill** ([repo](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd)) says the same things:

- Test behaviour at a few agreed boundaries ("seams") through public interfaces.
- Mock only at system boundaries (network, time, randomness), never your own modules.
- Take expected values from an independent source.
- Write browser tests last.

It also openly lacks guidance on whether a change is worth testing at all ([issue #746](https://github.com/mattpocock/skills/issues/746)).

## The plan (draft): about 10–12 tests

| # | What it checks | Level | The bug it catches |
|---|---|---|---|
| 1 | The default request returns Feb 2024–Jan 2025, untouched (Company in May 2024 = 301), in the contract's shape. | API | Months out of line with the numbers; the server "fixing" totals |
| 2 | "Last 3 months" returns Nov 2024–Jan 2025, with every row trimmed to the matching values. | API | Counting back from today; off by one month |
| 3 | An unknown period gets a 400 "unknown period". | API | Crashing, or silently falling back to 12 months |
| 4 | The demo "fail" note is ignored without demo mode and obeyed with it. | API | Anyone could make the real site fail |
| 5 | The rule for what the chart shows, as a table of cases: the latest opened row wins, closing falls back, rows hidden inside a closed parent don't count (but stay open for when it reopens), everything closed shows Company. | Pure function | The chart stuck on a row that's no longer visible |
| 6 | First load: placeholders, then Company open with "Company by branch"; Branch 2 can't open; Company in May shows 301. | Whole app | A crash on rows with nothing inside; the UI recalculating 279 |
| 7 | Opening and closing rows by mouse and keyboard moves the chart: Branch 1 → Anna → back → Company. | Whole app | Keyboard opening not connected to the chart; wrong fallback |
| 8 | How the data maps into the chart: May's label shows 156 / 87 / 36 and the server's total, 301; Escape hides it. | Whole app (verified: Recharts' keyboard handling runs in the simulated browser) | Parts shifted by a month; the total summed instead of the server's |
| 9 | Changing the period keeps the old numbers (faded) until the new ones arrive, then shows only the new months. | Whole app | Flashing back to placeholders; old months under the new label |
| 10 | On error: "Couldn't load clients" and "Try again", with no stale numbers; Try again works. | Whole app | Old data under the wrong label |
| 11 | At 375px, neither page scrolls sideways, and Docs shows its content. | Real browser | Something overflowing on phones; docs missing from the build |

## What we deliberately don't test

- React Aria's own behaviour (↑ / ↓ / Home / End, focus handling, the full set of ARIA attributes): we test only our wiring (which rows are open and how that moves the chart).
- Recharts' own behaviour (drawing, colours, rounding, animation, label position, its Tab stop and ← / →): the keys are used only to reach the label.
- CSS and looks: class names, the faded state's opacity, placeholder shapes, indentation.
- Types and schema definitions.
- Behaviour that TanStack Query, wouter and react-markdown already guarantee.
- Small formatting helpers (month labels, initials), captions, cards, switch wrappers.
- Every row, month and mismatch: one representative value per behaviour is enough.
- A coverage percentage.

## Test smells we avoid

- Expected values computed with the code's own slicing, summing or mapping.
- Mocking our own hooks or components, or asserting that `fetch` was called with something.
- Big snapshots.
- Finding elements by class name, test id or CSS selector instead of role and name.
- Real waiting (the demo's 2 seconds, sleeps), a shared data cache between tests, or automatic retries left on.
- Test names that describe how the code works instead of what it does.
- Tests nobody has seen fail, and leftover `.skip` or `.only`.

## How the tests run

- **API tests** call the Hono app directly with `app.request(…)`, without starting a server ([Hono testing](https://hono.dev/docs/guides/testing)).
- **Whole-app tests** render the entire app in Vitest's simulated browser with Testing Library and user-event:
  - The only fake is the network (MSW), and its default handler passes requests on to our real Hono app, so these tests use the real server logic and the real data. Individual tests switch it to "fail" or "wait".
  - Each test gets a fresh data cache with automatic retries off ([TanStack Query testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing)).
  - React Aria recommends exactly this setup ([React Aria testing](https://react-aria.adobe.com/testing)).
  - Recharts measures its container, so the test setup provides a stand-in for the browser's size-watching API; Recharts itself isn't mocked.
- **Real-browser tests** use Playwright against the built app, and are written last. Vitest's own browser mode is an alternative.

## Open questions (to revisit)

- **Are server tests in scope at all?** This is a frontend assignment. The whole-app tests already run through the real server logic, so tests 1 and 2 are largely covered by tests 6 and 9. Only tests 3 (unknown period) and 4 (demo guard) check something nothing else does.
- **Is this the right list?** It's the research's proposal, not yet a final choice. Each test should still earn its place.
