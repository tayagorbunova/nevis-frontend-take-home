# Clients can be filtered by a date range

The brief and the design show a fixed 12 months, but in a real product the months come from the server and users want to look at specific periods. We decided the API accepts an optional period (by default, the latest 12 months it has) and the page gets a period dropdown with presets (the last 12, 6 or 3 months, or the last month), built as part of the main work even though neither the brief nor the design asks for it. A picker for exact date ranges is a follow-up.

## Consequences

- The API response always says which months it covers. "Last 3 months" counts back from the latest month the server has, and the server works out which months that means, so the UI never assumes which months exist.
- Changing the range sends a new request while the page is in use, so loading and error states must work in the middle of a session, not only on first load.
- There is no design for the dropdown, so it's built from the design's existing styles (Inter, the same borders and colours).
