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

The app stores recent project metadata in IndexedDB:

- file name
- page count
- OCR page count
- last updated timestamp

Original PDF bytes are kept in memory during the session and are not persisted automatically in v1.

## Analytics

No analytics, tracking beacons, remote logs, or user identifiers are included in v1.
