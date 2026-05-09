# Phase 3 Codebase Health Audit

Status: baseline before Phase 3 implementation

## Measurements

Largest modules:

| File | Lines | Finding |
|---|---:|---|
| `src/features/pdf/PdfWorkbench.tsx` | 1306 | God component: state orchestration, inputs, outputs, persistence hooks, controls, and presentational panels. |
| `src/features/pdf/pdfIntelligence.ts` | 801 | Large but coherent domain inference module. |
| `src/index.css` | 824 | Single stylesheet; acceptable for current app but growing. |
| `src/features/pdf/formIntelligence.ts` | 413 | Coherent form heuristics module. |

## DRY Violations

1. PDF form-field reading is duplicated between `src/features/pdf/pdfDocument.ts` and `src/features/pdf/pdfIntelligence.test.ts`.
2. Download/export naming lives in UI code rather than a single project archive/export module.
3. User-facing operation errors are mostly canonical, but `ErrorBoundary` still exposes raw React error text.

## SOLID Violations

1. `PdfWorkbench.tsx` has many reasons to change: file input, operation state, document actions, exports, panels, settings-like debug behavior, and recent history.
2. Persistence is metadata-only and coupled directly to UI.
3. Project state has no stable import/export boundary.

## Dead Code

1. `src/lib/errors.ts` remains only for `PagePreview`; it is not the canonical PDF user error path.
2. `src/assets/react.svg` and `src/assets/vite.svg` are unused starter assets.

## TODO/FIXME/XXX/HACK

No production TODO/FIXME/XXX/HACK markers were found. Text matches in generated assets were ignored.

## Type Safety Holes

No `any` or `@ts-ignore` appears in authored `src` files. Boundary JSON parsing for future state import does not exist yet and must use zod.

## Inconsistent Patterns

1. Recent metadata uses IndexedDB, while active project state is memory-only.
2. Exports are spread between UI and conversion helpers.
3. Debug is controlled only by URL query, not user settings.

## Test Coverage Holes

1. No tests for drag/drop, paste, sample loading, project state export/import, clear state, or autosave restore.
2. Smoke test covers opening a generated PDF but not taking work back out.
3. Real-data fixture tests cover intelligence, not end-to-end state persistence.
