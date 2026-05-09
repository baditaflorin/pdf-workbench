# Phase 3 Output Pathway Audit

Status: updated after Phase 3 implementation

| Output pathway | Baseline status | Final status | Evidence |
|---|---|---|---|
| Edited PDF download | Works fully | Green | Existing export path still covered by smoke and manual build checks. |
| TXT export | Works partially | Green | Text download remains available after extraction/OCR; Copy button adds direct clipboard exit. |
| Markdown export | Works partially | Green | Markdown export includes metadata and remains unchanged. |
| HTML export | Works partially | Green | HTML export remains available; print route is explicit. |
| Project state download | Not built | Green | State button downloads a versioned `.pdfwb.json` archive with PDF bytes, edits, fields, text, OCR, activity, version, and commit. |
| Project state import | Not built | Green | Archive import restores canonical project state; unit and Playwright smoke cover round-trip. |
| Copy-to-clipboard | Not built | Green | Copy writes extracted/OCR text and reports permission failures with a next step. |
| JSON/automation-ready output | Not built | Green | Project archive schema is zod-validated and documented as `pdf-workbench.project.v1`. |
| Print-friendly | Not built | Green | Print action calls browser print and print CSS suppresses app chrome. |
| Share link | Not built | Out of scope | ADR 0062 rejects private document state in URLs. |
| Screenshot/embed/API/curl | Not built | Out of scope | Mode A has no runtime API; screenshot/embed outputs are not product claims. |

Before: green 1, yellow 3, red 5, out of scope 2.

After: green 9, yellow 0, red 0, out of scope 2.
