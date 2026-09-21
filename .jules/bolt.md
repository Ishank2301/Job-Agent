## 2026-09-21 - Frontend Filter Optimization
**Learning:** Repetitive string manipulation (concatenation, `toLowerCase`) inside Array `filter` loops can cause severe UI lag during keystrokes, particularly on longer list arrays.
**Action:** When filtering a dataset based on multiple fields, use `useMemo` to precompute a single, lowercased `searchString` representation for each record *before* the filter loop. This separates the heavy string operations from the fast character-matching loop triggered by input changes.
