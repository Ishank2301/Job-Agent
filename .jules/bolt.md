
## 2024-05-18 - [Optimize Scraped Job Deduplication]
**Learning:** Pulling entire columns (like `url` or `external_id`) into memory sets for deduplication causes O(N) memory and DB loads that scale poorly as the table grows.
**Action:** Always extract the relevant keys from incoming data first and use an `.in_()` clause to filter database queries, keeping memory footprints proportional to the incoming batch size (O(M)).

## 2024-05-18 - [Optimize Record Counting Queries]
**Learning:** Pulling entire collections into memory (e.g. `len(db.execute(select(...)).scalars().all())`) is inefficient and scales poorly as datasets grow (O(N) memory/DB fetch).
**Action:** Always utilize native DB aggregations like `func.count(Model.id)` combined with `scalar_one()` (O(1) memory) when you only need to determine the count of records.
