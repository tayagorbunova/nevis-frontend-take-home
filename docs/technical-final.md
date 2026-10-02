# Technical decisions

## Tech stack

- **Language:** TypeScript
- **Server:** Hono
- **Shared:** Zod, ESLint, Prettier, npm workspaces
- **Client:** React, Vite, React Aria Components, Recharts, TanStack Query, wouter, CSS Modules

As you can see, I've used quite a few external libraries. I approached this project as I would a real product, and most of these are tools I'd normally reach for. Let me explain the main choices.

## React Aria Components

React Aria is usually my go-to component library. It's headless, it's built with a strong focus on accessibility, and I trust the Adobe team to test it far more thoroughly than I ever could. As far as I know, it's also the only headless component library that comes with a table: Base UI, Radix UI, Headless UI, Ark UI and Ariakit don't have one.

The obvious downside is the extra bundle size. But for a B2B product whose users are mostly on laptops, I think the accessibility support and the development time it saves are worth that cost.

## Recharts

Recharts is a widely used React charting library, and it's actively maintained. Of all the libraries I compared, it was the only free one with built-in support for rounding a whole stacked column the way the design does. It also supports keyboard navigation out of the box.

It's wrapped in my own chart component, so the rest of the app never imports Recharts directly.

The main alternatives considered:

- **Chart.js:** the second most popular, and half the size. But it draws on a canvas, so the bars aren't separate elements that the keyboard, a screen reader or a test can reach. It also seems less actively maintained at the moment.
- **visx:** low-level building blocks from Airbnb. Small and flexible, but I'd have to build more of the chart myself, including its keyboard and screen-reader support.
- **Highcharts:** the best accessibility of them all, but it needs a paid licence for commercial use.

## TanStack Query

For an app with a single API endpoint, this might look like overkill. But it handles several behaviours the app actually uses: loading and error states, keeping the previous numbers on screen while a new period loads, caching periods you've already viewed, and retrying the request when you click "Try again".

The app demonstrates all of these states, so the library does useful work here.

## Wouter

I only needed basic routing, and wouter is tiny. I'd never used it before, so this also seemed like a good chance to try it.

## CSS Modules

I considered using SCSS with CSS Modules because the job description mentions it. But I didn't need any Sass-specific features here, such as mixins, so I kept the styles in plain CSS. Switching to SCSS later would be straightforward if the need came up.

## State management

One thing I deliberately left out is a separate library for client state. That decision can't be made from a small slice of a product like this take-home.

To pick one, I'd want to know what the rest of the app's state looks like: what needs to be stored, which screens share it, and what should survive a reload.

For now, TanStack Query handles the server data, while the selected period and expanded rows use plain React state.

## Other tools

A quick note on the rest:

- **Hono:** a small server framework that suits an API with a single endpoint.
- **Zod:** defines shared data schemas for the server and client, with runtime validation.
- **npm workspaces:** npm comes with Node.js, so there's no need to install another package manager. For a bigger monorepo, I'd probably pick pnpm for its speed and stricter dependency isolation.
- **react-markdown:** renders these docs in the app. It's here only for this take-home; a real product wouldn't need it.
