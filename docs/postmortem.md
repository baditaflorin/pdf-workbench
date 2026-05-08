# Postmortem

## What Was Built

PDF Workbench v0.1.0 is a pure GitHub Pages app at https://baditaflorin.github.io/pdf-workbench/.

The repo is public at https://github.com/baditaflorin/pdf-workbench.

Built in v1:

- Pages-ready React/Vite/TypeScript app published from `main` `/docs`
- Local PDF open, preview, page reorder, rotate, delete, and export
- AcroForm field detection and fill support for common field types
- Text stamps and visible signature appearances
- Embedded text extraction, page OCR with Tesseract.js, and TXT/Markdown/HTML export
- Browser-local `LanguageModel` API integration when available
- IndexedDB recent project metadata
- PWA manifest and service worker scoped to `/pdf-workbench/`
- Version, latest public commit, GitHub star link, and PayPal support link in the UI
- ADRs, deployment docs, architecture docs, privacy docs, hooks, unit tests, and Playwright smoke tests

## Was Mode A Correct?

Yes. Mode A was the right v1 choice. The core value is privacy: users can do common PDF chores without uploading sensitive documents. A Docker backend would make native Ghostscript/qpdf/pdfcpu/Pandoc integration stronger, but it would also create the exact document-upload trust problem v1 is trying to avoid.

The Mode A limitation is honest: v1 uses browser equivalents and does not claim full Acrobat or native CLI parity. Certified cryptographic PDF signing, advanced prepress, aggressive PDF repair, and high-volume batch conversion remain future Mode C candidates.

## What Worked

- `pdf-lib` plus `pdfjs-dist` covered the practical editing/rendering path.
- Lazy chunks kept the initial app JavaScript under 100KB gzipped.
- Playwright could generate a sample PDF in-test, upload it, render it, and verify the happy path.
- GitHub Pages from `/docs` worked, but only after the build learned to preserve `docs/adr/` and other human docs.

## What Did Not Work

- Embedding the git commit directly into hashed app JS created a build loop where every commit changed Pages assets.
- Tailwind v4 auto-scanned test/config files and changed CSS when non-app files contained utility-like words.
- Public Playwright verification initially navigated to `https://baditaflorin.github.io/` instead of the repo path because `page.goto("/")` resolves to the origin root.

## Surprises

- A different service worker on the shared GitHub Pages origin could interfere with browser tests, so Playwright now blocks service workers.
- Publishing docs and generated Pages output in the same `docs/` directory is workable, but it requires a precise generated-file cleanup script.

## Accepted Tech Debt

- Signature support is visible appearance signing only, not cryptographic signing.
- OCR outputs text but does not yet create an invisible searchable text layer inside the exported PDF.
- Native Ghostscript/qpdf/pdfcpu/Pandoc parity is documented as deferred.
- The screenshot is generated manually rather than through a committed `make screenshot` target.

## Next Three Improvements

1. Add searchable PDF OCR export with positioned invisible text.
2. Add OPFS-backed optional encrypted local document persistence for large PDFs.
3. Add stronger PDF fixture tests that inspect exported page order, stamps, and flattened form values.

## Time Spent vs Estimate

Estimated: 90 minutes for a useful Mode A scaffold.

Actual: about 2 hours because Pages publishing, build determinism, Tailwind scanning, and public-path smoke testing all needed hardening.
