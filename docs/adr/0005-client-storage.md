# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Users should be able to recover recent work without sending PDFs to a server.

## Decision

Use IndexedDB for recent project metadata and small text outputs. Keep original PDF bytes in memory during v1 sessions. Use `localStorage` only for small preferences.

## Consequences

The app remains private and offline-friendly. Very large PDFs are not persisted automatically in v1, reducing accidental sensitive data retention.

## Alternatives Considered

OPFS was considered for large document persistence, but IndexedDB metadata is enough for v1 and has broader compatibility.
