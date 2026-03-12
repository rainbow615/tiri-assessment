## Overview

This solution keeps the stack deliberately simple:

- **Backend**: A small Node/Express API that exposes `/api/items` and `/api/items/:id` with basic error handling and pagination metadata.
- **Frontend**: A React 18 app (Create React App) with React Router. Data fetching is centralized via a `DataContext`, and pages (`Items`, `ItemDetail`) stay as lean as possible.

Wherever I had to choose between cleverness and clarity, I picked clarity.

## Frontend: approach and trade‑offs

- **State and data flow**
  - The `DataProvider` owns the `items` array and a single `fetchItems` function.
  - Pages call `fetchItems` with `{ page, q, signal }` and rely on the returned metadata (`totalPages` etc.) for UI state. This keeps pagination logic close to the UI but networking details in one place.

- **List performance (virtualization)**
  - The `Items` page now uses `react-window`’s `FixedSizeList` to render rows.
  - I chose a **fixed row height** (`ROW_HEIGHT`) instead of `VariableSizeList`:
    - Fixed size is much easier to reason about and avoids layout thrash.
    - It is more than enough for a simple “one‑line per item” design.
  - The list height is capped (`MAX_LIST_HEIGHT`), which prevents the UI from stretching awkwardly on very tall screens while still letting you scroll through large datasets smoothly.

- **Loading, empty, and error states**
  - For the list:
    - When we are loading the **first page** (`isLoading && !items.length`), we render skeleton rows instead of a bare “Loading…” string.
    - When there is an error, we show a user‑facing message (`role="alert"`) and avoid crashing.
    - When we have no items, we show an empty‑state message (`role="status"`) that nudges the user to tweak their search.
  - For the detail view:
    - While loading, we show a small card‑shaped skeleton instead of a blank screen.
    - If the fetch fails, we keep the user on the page and show a clear error message instead of silently redirecting.

- **UI/UX polish**
  - There is now a simple app shell: light grey background, white nav bar, and a centered content area.
  - Inputs and buttons are rounded and spaced so they are easy to hit and scan.
  - I kept styles inline for now to avoid introducing a larger styling system (like Tailwind or a component library), which would add setup cost for relatively small screens.

- **Accessibility**
  - Main content is wrapped in `<main>` where it makes sense.
  - Loading and error states use ARIA attributes (`aria-busy`, `aria-label`, and `role="alert"/"status"`) so screen readers get meaningful feedback.
  - Links and buttons are always real `<a>` or `<button>` elements, not clickable `<div>`s.

## Backend: approach (as used by the frontend)

- The frontend assumes:
  - `GET /api/items?page=&limit=&q=` responds with `{ items, total, page, totalPages, pageSize }`.
  - `GET /api/items/:id` responds with an object containing at least `{ name, category, price }`.
- When the backend responds with a non‑2xx status, the frontend surfaces a friendly error instead of throwing raw exceptions.
- Pagination is handled entirely via query parameters; there’s no hidden client‑side slicing.

## Error handling and edge cases

- **Network errors / aborts**
  - List page requests use an `AbortController` so navigating or changing search terms cancels in‑flight fetches instead of racing them.
  - Abort errors are silently ignored; any other error becomes a user‑facing “Failed to load items”.
  - Detail page requests guard against updates after unmount with an `isMounted` flag.

- **Pagination edges**
  - The “Previous” button is clamped at page 1 and disabled visually and functionally.
  - The “Next” button is clamped at `totalPages` in the same way.
  - If the API ever sends odd metadata (e.g., missing `totalPages`), the UI falls back gracefully rather than assuming everything is perfect.

## Comments and code style

- I kept comments **minimal and intentional**:
  - Only where a reader might reasonably ask “why this way?” (for example, around skeleton animations or guard logic).
  - No commentary on obvious React patterns or simple state updates.
- The goal is that a mid‑level React dev should be able to read through the files once and understand the flow without jumping between too many abstractions.

## Testing

- The intent is for `npm test` to pass in both frontend and backend using the existing test harnesses from the starter.
- The changes stay within the starter’s patterns (no custom build tools, no exotic libraries beyond `react-window`) to keep tests and tooling predictable.

## Known trade‑offs and possible improvements

- **Styling**: Inline styles are fine for a small app, but a real production system would likely want:
  - A design system / component library.
  - Centralized theming (dark mode, spacing/typography tokens).
- **Virtualization**:
  - Fixed row height is simpler but less flexible than variable heights; if you need multi‑line or rich rows, `VariableSizeList` or a richer component might be worth it.
- **Error recovery**:
  - For detail pages, we currently stay on the same route and show an error. An enhancement would be offering a clear “Back to items” button to guide users out of the dead end.

Overall, I tried to keep the solution honest, small, and readable: no magic, a couple of pragmatic dependencies, and guardrails around the places most likely to fail (network, pagination, and large lists).

