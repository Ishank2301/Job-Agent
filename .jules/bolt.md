
## 2024-05-18 - [Optimize Scraped Job Deduplication]
**Learning:** Pulling entire columns (like `url` or `external_id`) into memory sets for deduplication causes O(N) memory and DB loads that scale poorly as the table grows.
**Action:** Always extract the relevant keys from incoming data first and use an `.in_()` clause to filter database queries, keeping memory footprints proportional to the incoming batch size (O(M)).

## 2024-05-18 - String Allocations inside Render-blocking Filter Loops connected to React Inputs
**Learning:** Found a major performance bottleneck where dynamic string interpolation and `.toLowerCase()` string creation were happening directly inside the `.filter()` function connected to an input on `JobsBoard.tsx`. Filtering an array of jobs using these string allocations causes continuous O(N) memory allocations and GC sweeps with each keystroke as the state updates.
**Action:** When filtering lists over data, pre-compute the search strings inside a generic `useMemo` that only triggers when the data array changes. In the input-driven `useMemo`, filter against this pre-computed string and use early returns to stop processing as quickly as possible.
