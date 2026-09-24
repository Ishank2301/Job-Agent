## 2024-05-18 - [Optimize Scraped Job Deduplication]
**Learning:** Pulling entire columns (like `url` or `external_id`) into memory sets for deduplication causes O(N) memory and DB loads that scale poorly as the table grows.
**Action:** Always extract the relevant keys from incoming data first and use an `.in_()` clause to filter database queries, keeping memory footprints proportional to the incoming batch size (O(M)).

## 2024-11-09 - [Sargable Datetime Queries in SQLAlchemy]
**Learning:** Using database functions like `func.date()` on an indexed column in SQLAlchemy `where` clauses prevents the database from using the index effectively, causing a full table or index scan. This degrades performance as the table grows.
**Action:** Always use range filters (e.g., `>= start_of_period` and `< end_of_period`) on datetime columns instead of applying date truncation or formatting functions, allowing PostgreSQL to perform efficient index range scans.
