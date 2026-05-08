# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The app needs a rich PDF workflow while staying static, testable, and local-first.

## Decision

Use a feature-oriented frontend:

- `features/pdf`: document state, PDF import/export, page operations, form filling, signing, OCR, and conversion
- `features/project`: public metadata, version display, GitHub commit lookup, and support links
- `lib`: browser storage, error handling, and shared utilities
- `workers`: lazy OCR and CPU-heavy browser work

`pdf-lib` owns PDF mutation. `pdfjs-dist` owns rendering. React components do not manipulate PDF bytes directly; they call feature services.

## Consequences

The UI remains thin enough to test. Large libraries can be split behind feature actions. Some Acrobat features are intentionally outside v1 because they require deeper native PDF operators or certified signing infrastructure.

## Alternatives Considered

A single monolithic app component would be faster initially but harder to test. A backend service would simplify native tool integration but conflicts with the privacy-first deployment goal.
