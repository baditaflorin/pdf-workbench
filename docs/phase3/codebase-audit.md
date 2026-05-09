# Phase 3 Codebase Health Audit

Status: updated after Phase 3 implementation

## Measurements

Largest modules after implementation:

| File | Lines | Finding |
|---|---:|---|
| `src/features/pdf/PdfWorkbench.tsx` | 1862 | Still too large. Phase 3 added real pathways faster than it split UI orchestration. This remains the largest Phase 4 refactor candidate. |
| `src/index.css` | 916 | Single stylesheet grew with print, batch, drag, and settings states. Acceptable for static app, but should split once a design system exists. |
| `src/features/pdf/pdfIntelligence.ts` | 801 | Large but coherent domain inference module. No Phase 3 changes. |
| `src/features/pdf/formIntelligence.ts` | 413 | Coherent form heuristics module. |
| `src/features/pdf/projectArchive.ts` | 313 | New single boundary for versioned state import/export and zod validation. |

## DRY Violations

Before: 3 known issues.

After:

1. PDF form-field reading duplication was removed; tests now use `readFormFields` from `src/features/pdf/pdfDocument.ts`.
2. Project state naming, schema, bytes encoding, and canonical round-trip logic now live in `src/features/pdf/projectArchive.ts`.
3. New import/export errors use the existing `PdfUserError` what/why/next-step pattern.

Remaining accepted duplication: a few UI button layouts are repeated in `PdfWorkbench.tsx`. They are presentational and are not core logic.

## SOLID Violations

Closed:

1. Project archive import/export is now a separate module with tests.
2. Storage owns recent metadata, active project archive, and settings through one IndexedDB boundary.
3. External JSON state is validated at the boundary before the UI sees it.

Still open:

1. `PdfWorkbench.tsx` remains a god component. It is usable and tested, but future Phase 4 work should split file intake, export actions, settings, and panels into focused hooks/components.

## Dead Code

Before: 2 known issues.

After:

1. `src/assets/react.svg` and `src/assets/vite.svg` were deleted.
2. `src/lib/errors.ts` remains because `PagePreview` still uses it for renderer-level failures; it is not dead.

## TODO/FIXME/XXX/HACK

No production TODO/FIXME/XXX/HACK markers were found. Generated Pages assets were excluded from this scan.

## Type Safety Holes

No `any` or `@ts-ignore` appears in authored `src` files. Imported project-state JSON is parsed as `unknown` and validated with zod.

## Inconsistent Patterns

Before: 3 known issues.

After:

1. Browser persistence now consistently goes through `src/lib/storage.ts`.
2. State archive serialization consistently goes through `src/features/pdf/projectArchive.ts`.
3. Debug is controllable by URL query or persisted setting.

## Test Coverage

Added:

1. Unit coverage for project archive export/import round-trip and malformed archive rejection.
2. E2E smoke coverage for state download, clear project, and state re-import.
3. Real-data fixture tests continue to cover intelligence determinism.

Remaining gap: drag/drop and Clipboard API paths are implemented through the same intake functions but are not separately automated across operating systems.
