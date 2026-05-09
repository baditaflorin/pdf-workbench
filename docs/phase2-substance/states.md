# Phase 2 State Taxonomy

Status: implemented

## Reachable States

| State | Trigger | UI behavior | User exit |
|---|---|---|---|
| Empty | First load or after failed open with no project | Empty workbench prompt | Open PDF |
| Opening | User selects a file | Status says "Opening PDF..." | Wait; opening itself is short and not cancellable |
| Analyzing | Open succeeded and the app samples text/fields | Status says "Analyzing document shape..." | Wait |
| Loaded clean | PDF opens and no special condition is detected | Preview, page list, tools, intelligence summary | Edit/export/open another PDF |
| Loaded form | Fields are detected | Form panel shows inferred labels, sections, requiredness, confidence, validation warnings | Fill fields/export/open another PDF |
| Loaded scanned | Sparse embedded text is detected | Intelligence warning says OCR is needed | OCR page/extract/open another PDF |
| Loaded large | 100+ pages or 5 MB+ | Page rail is bounded to 80 pages by default, with "Show all" as an explicit choice | Show all/extract/cancel/open another PDF |
| Loaded mixed-language | RTL and Latin text are both detected | Reading-order warning appears | Verify export/open another PDF |
| Extracting text | User clicks Extract text | Progress text updates by page | Cancel |
| OCR in progress | User clicks OCR page | Tesseract status/progress appears | Cancel stale UI update; worker cancellation is best-effort |
| Exporting PDF | User clicks Export edited PDF | Status says export is running | Wait |
| Recoverable error | Encrypted, corrupted, unsupported, cancelled, or missing text operation | Error state shows what/why/next step; debug mode shows technical detail | Open another PDF/retry operation |
| Debug | URL contains `?debug=1` | Debug panel shows intelligence JSON, raw field ids, warnings, and confidence bands | Remove query param |

## Stuck-State Audit

Every reachable state has at least one user-actionable exit. The main remaining limitation is Tesseract.js cancellation: the UI cancels stale updates and terminates the worker when possible, but browser OCR can still spend time unwinding the worker.

## Concurrency Rules

1. Each long operation gets an operation id.
2. Stale async completions are ignored if a newer operation has started or the current one was cancelled.
3. Buttons that mutate or export are disabled while a busy operation is running.
4. Cancelled operations do not commit partial extracted/OCR text into project state.
