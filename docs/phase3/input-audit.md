# Phase 3 Input Pathway Audit

Status: baseline before Phase 3 implementation

| Input pathway | Baseline status | Finding | Phase 3 decision |
|---|---|---|---|
| File picker PDF | Works fully | Single PDF opens, analyzes, previews, edits, and exports. | Keep and add multi-file support. |
| Drag and drop PDF | Not built | A stranger naturally drags a PDF into the app; nothing happens. | Finish. |
| Paste PDF/file from clipboard | Not built | Browser clipboard file paste is common for screenshots/files from OS tools. | Finish with permission-aware fallback. |
| Paste project JSON/state | Not built | There is no way to recover work from exported state. | Finish. |
| URL input | Not built | Fetching arbitrary PDFs from a static app is blocked by CORS and would train users to paste sensitive URLs. | Out of scope; document in ADR 0061. |
| Mobile file picker | Works partially | Native file picker should work through `<input type=file>`, but controls do not advertise Files/share-sheet usage. | Keep; document not device-verified. |
| Multi-file/batch | Not built | `input` accepts one PDF only; no partial success model. | Finish lightweight batch intake with per-file status. |
| Sample/demo input | Not built in UI | Tests generate a sample PDF, but users have no sample loader. | Finish, equal to user data entry points. |
| Imported state file | Not built | No `.pdfwb.json` or round-trip project state. | Finish. |
| Restored autosave | Not built | Recent list is metadata only; reload loses current project. | Finish active-project autosave and clear-state. |
| Deep links/share links | Not built | Hash-encoded full PDF state is inappropriate for sensitive and large documents. | Out of scope; document in ADR 0061/0062. |
| Folder input | Not built | Browser folder picking is not needed for a single-document PDF editor. | Out of scope. |

Baseline counts: green 1, yellow 1, red 8, out of scope 3.
