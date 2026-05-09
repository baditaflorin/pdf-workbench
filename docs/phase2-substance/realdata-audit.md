# Phase 2 Substance Real-Data Audit

Status: draft for confirmation

Scope: Phase 2 Substance §0 only. This audit records how v1 behaves on real PDF inputs before any Phase 2 ADRs or code changes.

Live app tested: https://baditaflorin.github.io/pdf-workbench/

Local app tested from the built GitHub Pages artifact in `docs/`.

Version baseline: v0.1.0, commit c567efd.

## Primary Flow Definition

For this product, the v1 happy path is:

1. Open a PDF locally in the browser.
2. Preview pages and understand what kind of PDF it is.
3. If applicable, fill forms, extract text, OCR scanned content, stamp/sign, reorder/delete pages.
4. Export a useful edited PDF or text artifact without uploading the document.

For Phase 2, "useful" means the app makes an accurate first guess about what the user brought in and what the next action should be.

## Inputs

| # | Fixture | Source | Reality represented |
|---|---|---|---|
| 1 | `01-w3c-dummy.pdf` | https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf | Clean tiny born-digital PDF |
| 2 | `02-arxiv-attention.pdf` | https://arxiv.org/pdf/1706.03762 | Dense academic paper with structured content |
| 3 | `03-irs-w9.pdf` | https://www.irs.gov/pub/irs-pdf/fw9.pdf | Real XFA-style fillable tax form |
| 4 | `04-uscis-i9.pdf` | https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf | Real large AcroForm employment form |
| 5 | `05-canada-t1261.pdf` | https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/t1261/t1261-fill-23e.pdf | Encrypted/XFA government form |
| 6 | `06-sample-invoice.pdf` | https://isaw.nyu.edu/guide/finance/forms-docs/sample-vendor-invoice/@@download/file/Sample%20Vendor%20Invoice.pdf | Real invoice-style business document |
| 7 | `07-jfk-scan.pdf` | https://www.archives.gov/files/research/jfk/releases/2025/0318/104-10181-10007.pdf | Large scanned archival PDF |
| 8 | `08-irs-pub17.pdf` | https://www.irs.gov/pub/irs-pdf/p17.pdf | Large tagged government publication |
| 9 | `09-hebrew-introductions.pdf` | https://www.linguajunkie.com/wp-content/uploads/Hebrew_Introductions-1.pdf | Mixed English/Hebrew RTL learning PDF |
| 10 | `10-truncated-w9.pdf` | Derived by truncating `03-irs-w9.pdf` to 40 KB | Partial/corrupted upload |

## Observations

| # | What v1 did | What it should have done | Failure cause | Failure mode | Manual work pushed to user |
|---|---|---|---|---|---|
| 1 | Opened in 132 ms, detected 1 page and 0 form fields, extracted text in 165 ms. | Same. Also could show basic metadata. | No major failure. | Clear success. | None for the basic path. |
| 2 | Opened 15 pages in 597 ms and extracted embedded text in 391 ms. Output is one long text stream. | Detect paper shape: title, authors, abstract, section headings, references, and extraction confidence. | Text extraction is flat; no document-structure inference. | Wrong-by-omission: app says extraction succeeded but gives low-value output. | User must manually find sections and useful chunks. |
| 3 | Opened 6 pages and 23 fields. Form panel showed raw names like `topmostSubform[0].Page1[0].f1_01[0]`. | Detect W-9 form, map fields to visible labels, group by section, infer required fields, validate TIN/check boxes. | Form reader exposes internal field identifiers; no label extraction or domain validation. | Visible but developer-shaped. | User must visually match raw field IDs to form labels. |
| 4 | Opened 4 pages and 128 fields. Some labels were readable, but the form is one long flat list. | Group Section 1/2/3 fields, detect dates, signatures, document-number fields, required fields, and incomplete sections. | Field extraction lacks section model, validation, and completion rules. | Partially useful but brittle. | User must scroll and know the I-9 workflow. |
| 5 | Failed to open and displayed `Input document to PDFDocument.load is encrypted... ignoreEncryption`. | Say: "This PDF is encrypted/restricted. Provide a password or use an unlocked/flattened copy." Keep the original safe and explain options. | Raw pdf-lib error escapes to UI; no encrypted-PDF classification. | Obvious failure, poor explanation, no next step. | User must understand PDF encryption internals. |
| 6 | Opened 1 page, 0 fields, extracted 437 bytes of text. | Recognize invoice shape and infer vendor, invoice number, date, line items, subtotal/total, and confidence. | No domain extraction for common business documents. | Wrong-by-omission. | User must copy invoice data by hand. |
| 7 | Opened 122 pages. Embedded extraction said no text. OCR page 1 took 4.4 s and produced 49% confidence with noisy text. | Detect image-only/scanned PDF, offer OCR strategy, estimate time, support batch/cancel, surface low confidence and page anomalies. | No scan classifier, no batch OCR plan, no layout/language cleanup. | Honest but underpowered. | User must OCR pages one by one and judge noise manually. |
| 8 | Opened 142 pages in 3.8 s, rendered 142 page rows, extracted text in 1.3 s. | Treat as a large document: progress, cancellation, virtualized page list, section/table-of-contents inference. | Scale assumptions are small-doc oriented. | Slow/overwhelming rather than incorrect. | User must navigate a huge page rail manually. |
| 9 | Opened 2 pages and extracted text. Hebrew content appears as flat mixed-direction text; no language/RTL signal. | Detect mixed English/Hebrew, preserve reading order better, mark language/script confidence, warn if extraction order is suspect. | No script/language/layout awareness. | Silent risk: export may look plausible but be semantically scrambled. | User must verify text order manually. |
| 10 | Failed to open and displayed parse coordinates: `line:157 col:2809 offset=36099`. | Say: "This PDF appears incomplete or corrupted. Try re-downloading; if it came from email/scanner, ask for a fresh export." | Parser error is not translated into a domain diagnosis. | Obvious failure, poor explanation, no recovery path. | User must infer that the file is truncated. |

## Current Baseline

Clear pass with no meaningful manual intervention: 1/10.

Partial pass where v1 opens the file but does not produce a smart first guess: 6/10.

Clear failure or unusable flow: 3/10.

The biggest issue is not that v1 crashes. It usually does not. The issue is that it treats every PDF as pages plus raw text, even when the document is obviously a form, scan, invoice, paper, large publication, encrypted file, or corrupted upload.

## Phase 2 Pass-Rate Trend

After implementing the Phase 2 intelligence layer, all 10 fixtures receive the expected document-condition label and primary action in the automated fixture suite. The practical pass rate moved from 1/10 clear pass to 8/10 useful first guess or actionable recovery path. The remaining partial cases are semantic extraction for academic-paper outlines and invoice key values: the app recognizes those shapes but does not yet extract full structured records.

## Top 5 Logic Gaps

1. PDF condition detection is missing. The app does not classify encrypted, corrupted, scanned, large, form-heavy, mixed-language, or structure-rich PDFs before choosing a workflow.
2. Form intelligence is too shallow. It exposes raw field names, lacks visible-label mapping, required-field detection, section grouping, field-type inference, and domain validation.
3. Text/OCR intelligence is manual and page-local. The app does not automatically detect image-only documents, choose OCR, batch work, preserve confidence, or explain low-confidence output.
4. Common document shapes are not recognized. Invoices, academic papers, government publications, and forms all collapse into a generic page/text model.
5. Error and scale behavior is library-shaped. Large files lack progress/cancel/virtualization, and broken/encrypted files show parser internals instead of domain terms and next steps.

## Top 3 Intuition Failures

1. "Extract text" can report success while producing a flat output that is not useful for the document the user actually uploaded.
2. Encrypted and corrupted PDFs fail with implementation details, so the user knows something broke but not what to do next.
3. A scanned 122-page PDF requires page-by-page OCR even though the app has enough evidence to infer "this whole document is scanned."

## Top 3 Feels-Stupid Moments

1. The user has to map `topmostSubform[0].Page1[0].f1_01[0]` to the visible W-9 field label.
2. The user has to decide when to use OCR; the app already knows when embedded text is absent.
3. The user has to manually identify invoice totals, paper sections, and form completion gaps from raw extracted text.

## What Smart Means For PDF Workbench

1. On upload, classify the PDF condition: clean text, fillable form, scanned/image-only, encrypted/restricted, corrupted/partial, large, mixed-language, or common business/document shape.
2. Produce a useful first guess immediately: form labels and required fields for forms, key fields for invoices, section outlines for papers/publications, OCR recommendation for scans.
3. Attach confidence and reasoning to every inference, then carry that confidence into previews and exports.
4. Translate failures into domain language with a next step, while keeping the user's file/state intact.
5. Keep real-scale operations coherent: progress after 300 ms, cancellation for long work, no giant unbounded UI lists, deterministic output.

## Phase 2 Substance Success Metrics

1. Real-data pass rate: at least 7/10 fixtures complete their primary flow with no manual intervention beyond confirming/correcting the app's first guess.
2. Classification accuracy: 10/10 fixtures receive the correct document-condition label and a sensible next action.
3. Form intelligence: W-9 and I-9 visible-label mapping reaches at least 80% of fields, and required/date/TIN/signature fields are identified with confidence.
4. Scan/OCR intelligence: image-only/scanned fixtures are detected automatically; OCR confidence is visible; exports include per-page confidence and source provenance.
5. Error quality: 0 raw library/parser errors reach the user on the fixture set; every error states what happened, why, and what to try next.
6. Determinism: re-running the same fixture with the same operation state produces byte-identical canonical extraction output for 10/10 fixtures.
7. Performance honesty: operations over 300 ms show progress, operations over 5 s are cancellable, and the 142-page fixture does not render an unbounded page list.
8. No silent wrongness: mixed-language and low-confidence OCR outputs are marked as uncertain in preview and export.

## Out Of Scope For Phase 2 Substance

1. No deployment-mode change; this remains Mode A, GitHub Pages and browser-only.
2. No backend, accounts, cloud sync, server OCR, or server-side LLM.
3. No new visual polish, dark mode, command palette, marketing pages, or landing-page work.
4. No new broad feature surface beyond making the existing PDF opening, form filling, OCR, extraction, editing, and export flows smarter.
5. No cryptographic signing/certification implementation; v1 still only creates visible signature appearances.
6. No password cracking or permission bypass. Encrypted PDFs may be diagnosed and handled only when the user supplies legitimate access or an unlocked copy.
7. No promise of perfect OCR, legal/tax advice, or fully automated document understanding. Low confidence must be exposed honestly.
