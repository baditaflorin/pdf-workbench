# 0006 - WASM Modules

## Status

Accepted

## Context

OCR is compute-heavy and should not increase the initial JavaScript payload.

## Decision

Lazy-load `tesseract.js` only after the user starts OCR. PDF mutation uses JavaScript libraries in v1. The app does not require COOP/COEP headers because GitHub Pages cannot set them.

## Consequences

Initial load remains small. OCR runs locally but can be slower than native Tesseract.

## Alternatives Considered

qpdf/Ghostscript/pdfcpu WASM builds were deferred because they are large, have uneven browser packaging, and would risk the payload budget.
