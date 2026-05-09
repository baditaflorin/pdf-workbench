# Phase 3 Feature Claims Audit

Status: updated after Phase 3 implementation

| Claim source | Claim | Baseline status | Final status | Evidence |
|---|---|---|---|---|
| README | Open PDFs locally; no upload path | Shipped fully | Green | Intake remains browser-only; privacy doc updated for local persistence. |
| README | Reorder, rotate, delete, export pages | Shipped fully | Green | Existing controls still pass smoke and manual checks. |
| README | Fill detected AcroForm fields | Shipped fully | Green | Values persist through state archive. |
| README | Add text stamps and visible signature appearances | Shipped fully | Green | Edits persist through archive and PDF export. |
| README | Extract embedded text, OCR pages, export TXT/Markdown/HTML | Shipped fully | Green | Adds copy output; single-page OCR limitation remains explicit. |
| README | Save/import project state and autosave locally | Not claimed | Green | README, architecture, privacy, and tests now describe it. |
| README | Show version/latest commit/repo/PayPal links | Shipped fully | Green | Version badge is updated during release; app header continues to show version/commit. |
| Privacy doc | Stores only recent metadata | Shipped partially | Green | Rewritten to say active project bytes are persisted locally when autosave is enabled. |
| Architecture doc | IndexedDB metadata only | Shipped partially | Green | Rewritten as IndexedDB project state plus settings and recent metadata. |
| In-app | Recent project history | Shipped partially | Green | Recent list is clearable; restoration is handled by autosave/state import instead of pretending recents reopen. |
| In-app | Local AI summary | Shipped partially | Green | Unavailable browser-local AI is disabled with plain guidance. |

Before mismatches: README badge, privacy storage, architecture storage, recent history behavior, local AI availability.

After mismatches: none known in tested claims.
