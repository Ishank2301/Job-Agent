## 2024-03-24 - Deduplication Scale Issue
**Learning:** In the job scraper persistence logic, loading the entire `Job.url` and `Job.external_id` columns into memory using an unfiltered `select()` is an O(N) operation that causes major memory usage problems as the database grows.
**Action:** Use `where(Column.in_(subset))` based on the newly fetched jobs batch, rather than fetching all rows from the database. Additionally, always track newly inserted identifiers in a `set()` within the same iteration loop to prevent duplicates occurring within a single scraped batch.
