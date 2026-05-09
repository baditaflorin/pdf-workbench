# Privacy

PDF Workbench is designed so documents stay in the browser.

## What Is Sent Over The Network

- Static app assets from https://baditaflorin.github.io/pdf-workbench/
- Public commit metadata from https://api.github.com/repos/baditaflorin/pdf-workbench/commits/main
- Tesseract language/core assets when OCR is first used, loaded by `tesseract.js`

## What Is Not Sent

- PDF files
- OCR text
- Form field values
- Signature drawings
- Local AI prompts or outputs

## Local Storage

The app stores data only in this browser's IndexedDB:

- active project archive when autosave is enabled
- original PDF bytes inside that local active project archive
- page order, rotations, deletions, form values, text stamps, visible signature appearances, OCR text, extracted text, activity log, document intelligence, app version, and commit
- recent project metadata: file name, page count, OCR page count, last updated timestamp
- settings: autosave, debug panel, destructive-action confirmation

The active project archive never leaves the browser unless you explicitly download or share the `.pdfwb.json` file yourself. Use Clear project to remove the active archive, and Clear recent to remove recent metadata.

## Analytics

No analytics, tracking beacons, remote logs, or user identifiers are included.
