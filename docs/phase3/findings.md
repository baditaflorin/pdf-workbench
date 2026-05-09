# Phase 3 Findings Synthesis

Status: updated after Phase 3 implementation

## Top 5 Usability Gaps

1. A stranger could not drag a PDF into the app or paste a PDF/state from the clipboard. Closed with drag/drop, paste listener, Clipboard API path, and batch intake.
2. Reload lost the current project. Closed with active-project autosave, state import/export, and clear-state controls.
3. There was no downloadable project state. Closed with versioned `.pdfwb.json` archive and round-trip tests.
4. Text output had only download exits. Closed with copy-to-clipboard and explicit print.
5. Local AI looked like a normal feature even when unavailable. Closed by detecting browser support and disabling with a domain explanation.

## Top 5 Half-Baked Features

| Feature | Outcome |
|---|---|
| Recent history | Finished honestly: recent metadata is clearable; current work restores through autosave/state files. |
| Local AI summary | Finished/honest: disabled when browser support is absent. |
| Activity log | Finished: persisted in autosave and project state files. |
| Debug panel | Finished: available through Settings and `?debug=1`. |
| Text exports | Finished: added copy-to-clipboard plus project-state round-trip. |

## Top 5 Codebase Pain Points

1. `PdfWorkbench.tsx` is still too large and remains the highest-value refactor.
2. Canonical project archive boundary was missing; closed with `projectArchive.ts`.
3. Metadata persistence could not restore work; closed with active archive storage.
4. Form-field reader duplication; closed by exporting and reusing `readFormFields`.
5. README/privacy/architecture drift; closed in Phase 3 docs update.

## Top 5 Documentation/Reality Mismatches

1. README badge was stale; fixed during v0.3.0 release update.
2. Privacy doc said original bytes were not persisted; fixed to describe local autosave.
3. Architecture doc said IndexedDB metadata only; fixed to describe active archive/settings.
4. Recent history implied more than it did; UI/docs now distinguish recents from restorable state.
5. Local AI availability was vague; README/UI now explain browser dependency.

## Fully Usable Means

1. A user can open their own PDF by picker, drag/drop, sample, batch selection, or supported paste.
2. A user can leave and reload without losing the current project, and can intentionally clear local state.
3. A user can export an edited PDF, text, copied text, print view, or versioned project state.
4. A user can import a state file and recover the same pages, fields, edits, OCR/text, activity, and intelligence.
5. A user sees unavailable or out-of-scope pathways explained before they become dead ends.

## Success Metrics

1. Input audit: all non-out-of-scope rows green. Passed.
2. Output audit: all non-out-of-scope rows green. Passed.
3. Controls audit: zero red rows and no production-only stubs. Passed.
4. State round-trip test: export then import restores canonical project state. Passed in unit and smoke coverage.
5. E2E smoke covers open, state export/import, and clear project. Passed.
6. README feature claims are updated and covered by tests or limitations. Passed.

## Out Of Scope

No backend, no URL proxy, no account sync, no share links containing documents, no new OCR/inference engine work, no visual polish, no cryptographic signatures.
