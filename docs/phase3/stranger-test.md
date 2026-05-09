# Phase 3 Stranger Test

Date: 2026-05-09

Method: fresh Playwright browser context plus a manual cold walkthrough mindset using real fixture `test/fixtures/realdata/03-irs-w9.pdf` and the generated sample PDF. No existing IndexedDB state was assumed.

## Scenario

1. Land on the app from a clean browser context.
2. Open a real PDF with the file picker.
3. Find the first useful interpretation without reading docs.
4. Save work, clear the project, and recover it from the saved file.
5. Try the obvious exits: edited PDF, text copy/download, print, recent/history clearing.

## Findings

| Finding | Severity | Response |
|---|---|---|
| The app did not provide a safe sample path for someone without a PDF ready. | High | Added Sample button that creates and opens a real PDF through normal intake. |
| A user could not tell whether work would survive reload. | High | Added autosave setting, active-project restore, Save state, Start fresh, and clear-state controls. |
| Local AI looked broken when the browser did not expose the LanguageModel API. | Medium | Added capability detection, disabled unavailable action, and visible browser limitation text. |
| State export existed as a concept only after implementation; users needed a visible import path. | High | Picker, drag/drop, and paste now accept `.pdfwb.json`; smoke test covers export, clear, import. |
| Recent history looked like it should reopen projects. | Medium | Recent list is now explicitly metadata and clearable; restoration is through autosave/state archive. |

## Top 3 Fixed Before Done

1. Added visible Sample, Save state, and Start fresh actions to make the first-run and recovery paths obvious.
2. Added state archive import through the normal file input path and Playwright smoke coverage.
3. Disabled Local AI when unavailable and explained the browser dependency in-place.

## Remaining Huh Moments

1. Drag/drop and paste work, but they are not independently visible until a user tries them.
2. Recent items still do not reopen old documents; this is honest now, but a true project browser would be better.
3. A huge PDF can still make the first preview feel slow while pdf.js warms up, although long extraction/OCR operations are cancellable.
