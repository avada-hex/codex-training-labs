# Top-up Ideas for the Myntra-style Site

This list helps participants modify, extend, or refactor the Express + React codebase during the third pass.

1. **Mega menu for Indian festivals**: Build a React component that renders a structured menu, fetches the same catalog, and exposes hover menus for Festive Picks and Local Artisan collections. Update CSS for drop-down states and document the aria attributes.
2. **Filterable product drawer**: Add stateful filters (price range, delivery speed, category) in the React app and compute a filtered product array before rendering. Keep the backend unchanged, but document the selectors used in the summary prompts.
3. **Localized offer banner**: Replace the hero status card with a rotating banner that pulls messages from an array kept in React state (e.g., "Diwali Flash Sale", "Metro Express Delivery"). Animate transitions via CSS keyframes.
4. **Mini cart experience**: Build a cart component that allows users to add items, stores them in localStorage, and shows running totals. Summarize the implementation and any side effects in docs/report-prompts.md.
5. **Backend polish**: Hook the Express API to a JSON file or mock database, add logging for each request, and validate responses with Jest or a simple script.
6. **Technical documentation update**: Run a static analysis (eslint, lint-staged, or Lighthouse) and capture the results in a report using docs/report-prompts.md. Mention unexpected warnings and next steps.

After implementing an idea, summarize the change via docs/summary-prompts.md and docs/report-prompts.md so future learners can learn from your work.
