# Phase 3 Findings Synthesis

Status: baseline before Phase 3 implementation

## Top 5 Usability Gaps

1. A stranger cannot drag a PDF into the app or paste a PDF/state from the clipboard.
2. Reload loses the current project; recent history is only metadata.
3. There is no downloadable project state, so work cannot round-trip.
4. Text output downloads exist, but copy-to-clipboard and print-friendly exits are missing.
5. Local AI appears as a normal button even when the browser cannot run it.

## Top 5 Half-Baked Features

| Feature | Decision |
|---|---|
| Recent history | Finish: autosave current project, clear history, restore on reload. |
| Local AI summary | Finish/hide: only expose actionable button when supported; otherwise state browser limitation. |
| Activity log | Finish: persist via active project and project state file. |
| Debug panel | Finish: expose through a real setting in addition to `?debug=1`. |
| Text exports | Finish: add copy-to-clipboard and project-state export/import. |

## Top 5 Codebase Pain Points

1. `PdfWorkbench.tsx` is too large.
2. No canonical project archive boundary.
3. Metadata persistence cannot restore real work.
4. Form-field reader duplication between implementation and tests.
5. README/privacy/architecture docs drift behind implementation.

## Top 5 Documentation/Reality Mismatches

1. README badge says 0.1.0 while app is 0.2.0.
2. Privacy doc says original PDF bytes are not persisted; Phase 3 will change this locally.
3. Architecture doc says IndexedDB metadata only.
4. Recent history reads as useful history but cannot restore work.
5. Local AI availability is not explained in README or UI.

## Fully Usable Means

1. A user can open their own PDF by picker, drag/drop, sample, batch selection, or supported paste.
2. A user can leave and reload without losing the current project, and can intentionally clear local state.
3. A user can export an edited PDF, text, copied text, print view, or versioned project state.
4. A user can import a state file and recover the same pages, fields, edits, OCR/text, activity, and intelligence.
5. A user sees unavailable or out-of-scope pathways explained before they become dead ends.

## Success Metrics

1. Input audit: all non-out-of-scope rows green.
2. Output audit: all non-out-of-scope rows green.
3. Controls audit: zero red rows and no production-only stubs.
4. State round-trip test: export then import restores canonical project state.
5. E2E smoke covers open, extract/copy or state export/import, and edited PDF export.
6. README feature claims are updated and covered by tests or limitations.

## Out Of Scope

No backend, no URL proxy, no account sync, no share links containing documents, no new OCR/inference engine work, no visual polish, no cryptographic signatures.
