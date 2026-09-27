
## 2026-09-21 - Frontend Filter Optimization
**Learning:** Repetitive string manipulation (concatenation, `toLowerCase`) inside Array `filter` loops can cause severe UI lag during keystrokes, particularly on longer list arrays.
**Action:** When filtering a dataset based on multiple fields, use `useMemo` to precompute a single, lowercased `searchString` representation for each record before the filter loop. This separate precomputation reduces allocations and repeated lowercasing during input-driven filtering, improving responsiveness for large in-memory lists.


## 2024-05-18 - [Optimize Scraped Job Deduplication]
**Learning:** Pulling entire columns (like `url` or `external_id`) into memory sets for deduplication causes O(N) memory and DB loads that scale poorly as the table grows.
**Action:** Always extract the relevant keys from incoming data first and use an `.in_()` clause to filter database queries, keeping memory footprints proportional to the incoming batch size (O(M))[...]

## 2024-05-18 - String Allocations inside Render-blocking Filter Loops connected to React Inputs
**Learning:** Found a major performance bottleneck where dynamic string interpolation and `.toLowerCase()` string creation were happening directly inside the `.filter()` function connected to an in[...]
**Action:** When filtering lists over data, pre-compute the search strings inside a generic `useMemo` that only triggers when the data array changes. In the input-driven `useMemo`, filter against t[...]

## 2026-09-27 - [Optimize Database Row Counting]
**Learning:** Fetching all rows of a SQLAlchemy query using `.scalars().all()` and then applying Python`s `len()` on the result pulls unnecessary data across the network into application memory, w[...]
**Action:** Use SQLAlchemy`s `func.count(Model.id)` to compute the length inside the database directly, returning just an integer back to the application.
