# 0062 Output Pathway Coverage Policy

## Status

Accepted

## Context

V2 exported edited PDFs and text files, but not project state, clipboard text, or print-friendly output.

## Decision

Support edited PDF, TXT, Markdown, HTML, copy-to-clipboard, print, and versioned `.pdfwb.json` state export. Share links, screenshots, embed code, and runtime API snippets are out of scope.

## Consequences

Users can take work out of the app and come back later without server state.

## Alternatives Considered

Hash-encoded state URLs were rejected because real PDFs are too large and too sensitive for URL state.
