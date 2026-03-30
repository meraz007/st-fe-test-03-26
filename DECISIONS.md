# Candidate Decisions & Notes

Please use this file to briefly outline your technical choices and the rationale behind them.

## 1. State Management & Architecture
*Why did you structure your state the way you did? Which patterns did you choose for handling the flaky API requests, loading states, and error handling?*

I extracted all data-fetching logic into a custom `useProducts` hook (`src/hooks/useProducts.ts`) to separate concerns — the UI components don't know anything about retries, race conditions, or API details.

**State structure:** I use a single `ProductsState` object with two distinct loading flags:
- `isLoading` — true only when there's no data at all (initial load). Triggers a skeleton card grid.
- `isFetching` — true during any fetch, including refetches. The UI dims existing products and shows an "Updating…" indicator instead of replacing the grid with a spinner. This avoids jarring layout shifts when paginating or filtering.

**Flaky API handling:** The hook implements automatic retry with exponential backoff (up to 3 retries, delays of 800ms → 1600ms → 3200ms). With the API's 20% failure rate, the probability of all 4 attempts failing is 0.2⁴ ≈ 0.16%, making errors nearly invisible to users. Only after all retries are exhausted does the UI show an error state with a manual Retry button.

**Race conditions:** An incrementing `requestId` ref ensures that when the user changes filters or pages quickly, stale responses from older requests are silently discarded. This prevents the classic bug where a slow response from request #1 overwrites the newer result from request #2.

**Search debouncing:** The App component separates `searchInput` (updates on every keystroke) from `search` (updates after a 400ms debounce). Only the debounced value is passed to the hook, preventing unnecessary API calls while the user is still typing.

## 2. Trade-offs and Omissions
*What did you intentionally leave out given the constraints of a take-home assignment? If you had more time, what would you prioritize next?*

**Intentional omissions:**
- **No external state management library** (Redux, Zustand, etc.) — the app is a single page with one 
data source; React's built-in `useState`/`useEffect` keeps things simple and avoids unnecessary 
dependencies.
- **No React Query / SWR** — while these libraries handle caching, retries, and stale data elegantly, 
using one would obscure the retry and race-condition logic that the assignment specifically asks 
candidates to demonstrate.
- **No response caching** — each page/filter change triggers a fresh API call, even for previously visited pages. In production I would add an in-memory cache (or use React Query's built-in cache) keyed by `page+category+search` so navigating back to a previous page is instant.



## 3. AI Usage
*How did you utilize AI tools (ChatGPT, Copilot, Cursor, etc.) during this assignment? Provide a brief summary of how they assisted you.*

I used **Cursor (with Opus 4.6)** as a coding assistant throughout the assignment. Specifically:
- **Scaffolding:** Used it to generate the initial component structure (ProductCard, Pagination, useProducts hook) based on the requirements I described.
- **Architecture decisions:** Discussed the trade-offs between different retry strategies and loading state approaches before implementing.
- **Code review:** Had it explain the code back to me to verify correctness and catch potential issues (e.g., the dual-fetch bug on initial mount, race condition handling).
- **Iteration:** Refined the implementation through conversation — started with a simpler version in App.tsx, then refactored into the hook + component architecture based on the full requirements.

All final code was reviewed and understood by me before submission.

## 4. Edge Cases Identified
*Did you notice any edge cases or bugs that you didn't have time to fix? Please list them here.*


- **Broken images with no fallback:** Product images load from `picsum.photos`. If the CDN is down or an image seed returns a 404, the browser shows a broken image icon. Adding an `onError` fallback to swap in a placeholder SVG would handle this gracefully.

- **Mock data inconsistency across HMR reloads:** The `api.ts` mock generates prices, categories, and stock via `Math.random()` at module load time. During Vite HMR, if the module is re-evaluated, all product data changes (different prices, different categories). This only affects development — not production — but it can be confusing when debugging filter behavior because the dataset shifts under you.

- **Pagination can reference a now-invalid page:** If a user is on page 5 of "All Categories", then switches to "Outdoors" (which may only have 3 pages), the code resets to page 1 via `setPage(1)`. This works correctly. However, if the API were real and the dataset changed server-side between requests (e.g., products were deleted), the user could land on a valid page number that now returns an empty result set. The empty state handles this, but a "Page not found, showing page 1" redirect would be more polished.

- **No request cancellation on unmount:** If the component unmounts while the retry loop is still running (e.g., due to navigation in a future multi-page version), the async function continues and calls `setState` on an unmounted component. React 18+ suppresses the warning, but adding an `AbortController` or a mounted ref would be cleaner.
