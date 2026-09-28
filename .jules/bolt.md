## 2026-09-27 - [Optimize search filter performance in JobsBoard]
**Learning:** Pre-computing search strings outside the filter loop in React `useMemo` hooks prevents O(N * string_concat) overhead on every keystroke, significantly improving responsiveness when searching large datasets.
**Action:** Always pre-compute and memoize expensive string concatenations and data transformations for searchable fields before applying the actual search filter.
