# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Production browser logs should be minimal.

## Decision

Use visible UI status, toasts, and error panels for user-facing operations. Avoid production `console.log`. Use `console.error` only for unrecoverable developer diagnostics caught by the global error boundary.

## Consequences

Users get clear feedback without leaking document details into logs.

## Alternatives Considered

Remote logging was rejected because it would create a privacy surface and require a backend or third-party service.
