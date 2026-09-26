
## 2024-05-18 - [Optimize Scraped Job Deduplication]
**Learning:** Pulling entire columns (like `url` or `external_id`) into memory sets for deduplication causes O(N) memory and DB loads that scale poorly as the table grows.
**Action:** Always extract the relevant keys from incoming data first and use an `.in_()` clause to filter database queries, keeping memory footprints proportional to the incoming batch size (O(M)).

## 2024-05-18 - String Allocations inside Render-blocking Filter Loops connected to React Inputs
**Learning:** Found a major performance bottleneck where dynamic string interpolation and `.toLowerCase()` string creation were happening directly inside the `.filter()` function connected to an input on `JobsBoard.tsx`. Filtering an array of jobs using these string allocations causes continuous O(N) memory allocations and GC sweeps with each keystroke as the state updates.
**Action:** When filtering lists over data, pre-compute the search strings inside a generic `useMemo` that only triggers when the data array changes. In the input-driven `useMemo`, filter against this pre-computed string and use early returns to stop processing as quickly as possible.
## 2026-09-26 - [Optimize React List Rendering by Pre-Grouping]
**Learning:** Calling `.filter()` on a large list of objects (like applications) directly inside a `.map()` iterator over columns or categories triggers an (C \times N)$ operation on every re-render. In state-driven components like a Kanban board, this blocks the main thread during simple interactions (drag-and-drop or column movement).
**Action:** Always pre-group lists into dictionary maps based on categories using `useMemo` ((N)$), so accessing filtered items inside the column render is a constant time lookup ((1)$) instead of requiring full array iteration per column.
