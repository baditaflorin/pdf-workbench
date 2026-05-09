# 0064 DRY Consolidation Map

## Status

Accepted

## Decision

Project state import/export, byte encoding, archive validation, and canonical round-trip comparison will live in `src/features/pdf/projectArchive.ts`. IndexedDB persistence will live in `src/lib/storage.ts`. UI code will call those boundaries rather than duplicating serialization details.

## Consequences

Export/import tests and UI use one state contract.

## Alternatives Considered

Inlining archive JSON in `PdfWorkbench.tsx` was rejected because the component is already too large.
