
## 2024-05-18 - [Optimize Scraped Job Deduplication]
**Learning:** Pulling entire columns (like `url` or `external_id`) into memory sets for deduplication causes O(N) memory and DB loads that scale poorly as the table grows.
**Action:** Always extract the relevant keys from incoming data first and use an `.in_()` clause to filter database queries, keeping memory footprints proportional to the incoming batch size (O(M)).

## 2024-05-18 - [Optimize List Grouping in Mapped Views]
**Learning:** Calling `.filter()` on a large master list inside a `.map()` over categories results in O(C * N) time complexity which causes re-render lags in React.
**Action:** Always pre-group list data into a Map or Record via a single pass `useMemo` dependency (O(N)), then lookup the sublists directly during category `.map()` iterations.
