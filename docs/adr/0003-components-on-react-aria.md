# Interactive components are built on React Aria

The table with rows that open and close is the hardest accessibility work in the brief, and the brief requires it to work from the keyboard and expose its hierarchy to screen readers. We decided to build our own components (our look, our APIs) on top of React Aria Components, which supplies the tested behaviour (keyboard, focus, screen-reader information), instead of writing the treegrid ourselves or adopting a fully styled library.

## Considered options

- Everything ourselves (native table plus our own keyboard code, the browser's dropdown, a checkbox styled as a switch): no extra weight, but about 200 lines of tricky focus and keyboard code that we'd have to verify with screen readers ourselves.
- A fully styled library (Material UI, Mantine): its own look to fight against, and heavier.

## Consequences

- About 84 KB of extra compressed JavaScript (67 KB → 151 KB, measured with react-aria-components 1.21.1). Acceptable for a work dashboard used on laptops, and stated in the README.
- React Aria's table fires a "row action" on click and Enter. We wire it to open and close rows, and ignore it on rows with nothing inside.
- Our components wrap React Aria, so the rest of the app never imports it directly. Replacing it later means rewriting those wrappers, not the app.
