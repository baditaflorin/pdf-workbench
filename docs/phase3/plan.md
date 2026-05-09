# Phase 3 Plan

Status: implemented autonomously

## Picklist

| Rank | Catalog item | Work |
|---:|---:|---|
| 1 | 1 | Add drag/drop, paste, sample, multi-file, state import, and mobile-friendly picker coverage. |
| 2 | 8 | Restore active project after reload and provide a real start-fresh path. |
| 3 | 11 | Add downloadable versioned project state file. |
| 4 | 41 | Import state file and restore canonical state. |
| 5 | 10 | Add copy-to-clipboard for extracted/OCR text. |
| 6 | 13 | Add print-friendly mode. |
| 7 | 4 | Multi-file intake with per-file success/failure. |
| 8 | 6 | Clipboard read with fallback to paste event. |
| 9 | 7 | Add first-class sample loader. |
| 10 | 15 | Triage half-baked features. |
| 11 | 16 | Finish kept recent/activity/debug/export features. |
| 12 | 18 | Add settings section with only working settings. |
| 13 | 19 | Align README/privacy/architecture docs. |
| 14 | 20 | Consolidate export/state logic into project archive module. |
| 15 | 22 | Add canonical project archive types. |
| 16 | 23 | Add zod validation at project-state JSON boundary. |
| 17 | 31 | Apply one PDF user error pattern to new pathways. |
| 18 | 32 | Keep local UI state in React, persisted project state in IndexedDB. |
| 19 | 35 | Avoid `any`; imported JSON is `unknown` validated by zod. |
| 20 | 36 | Validate external state imports with zod. |
| 21 | 38 | Autosave active project across reload/tab close. |
| 22 | 39 | Add persisted schema version and migration policy. |
| 23 | 40 | Add clear project/history controls. |
| 24 | 42 | README features become verified checklist. |
| 25 | 44 | Add inline guidance for unavailable URL/share/local-AI paths. |
| 26 | 46 | Run stranger test in a fresh browser context. |
| 27 | 47 | Fix top three stranger-test issues. |

## Success Gates

1. `make test`, `make build`, and `make smoke` pass.
2. Live GitHub Pages smoke passes.
3. State export/import round-trip is tested.
4. New input/output audit rows are updated to green or ADR-out-of-scope.
5. Version is bumped to v0.3.0 and tagged.
