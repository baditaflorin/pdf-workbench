# Phase 3 Output Pathway Audit

Status: baseline before Phase 3 implementation

| Output pathway | Baseline status | Finding | Phase 3 decision |
|---|---|---|---|
| Edited PDF download | Works fully | Exports visible edits, form values, page order, and flattened forms. | Keep and test. |
| TXT export | Works partially | Requires text extraction/OCR and downloads, but no copy shortcut. | Finish copy-to-clipboard. |
| Markdown export | Works partially | Downloads with metadata, but no state round-trip. | Keep. |
| HTML export | Works partially | Downloads with metadata, but print route is not explicit. | Keep. |
| Project state download | Not built | User cannot save a workbench project and reload later. | Finish versioned `.pdfwb.json`. |
| Project state import | Not built | Export round-trip is impossible. | Finish. |
| Copy-to-clipboard | Not built | Users often need text in email/docs/chat rather than a file. | Finish. |
| JSON/automation-ready output | Not built | No stable state artifact for external tooling. | Finish through versioned project JSON. |
| Print-friendly | Not built | Browser print prints the whole app chrome. | Finish basic print mode for preview/work state. |
| Share link | Not built | Unsafe for private PDFs and too large for real documents. | Out of scope. |
| Screenshot/embed/API/curl | Not built | Static local-only PDF tool has no runtime API and should not imply one. | Out of scope. |

Baseline counts: green 1, yellow 3, red 5, out of scope 2.
