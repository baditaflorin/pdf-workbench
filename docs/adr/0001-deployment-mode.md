# 0001 - Deployment Mode

## Status

Accepted

## Context

The product handles sensitive PDFs. The bootstrap prompt prefers GitHub Pages whenever feasible and requires a runtime backend only when browser or build-time execution is insufficient.

## Decision

Use Mode A: Pure GitHub Pages. The app is a static React/Vite site published from `main` `/docs`. PDF editing, form filling, signing appearance, OCR, export, and local AI assistance run in the browser using JavaScript, Web Workers, browser storage, and lazy-loaded modules.

Native tools named in the idea are represented by browser-safe equivalents in v1:

- Ghostscript/qpdf/pdfcpu class work: `pdf-lib` plus `pdfjs-dist`
- Tesseract: `tesseract.js`
- Local LLM: browser-local `LanguageModel` API when available, with no network fallback
- Pandoc: local Markdown/HTML/text export helpers

## Consequences

Documents are never uploaded to a server controlled by this project. GitHub Pages cannot provide COOP/COEP headers, so v1 avoids features that require `SharedArrayBuffer`. Large OCR and AI work is lazy and may be slower than native tools.

## Alternatives Considered

Mode B was not needed because v1 has no static dataset. Mode C would unlock native CLIs but would add document upload risk, server operations, and cost before the product proves its core workflow.
