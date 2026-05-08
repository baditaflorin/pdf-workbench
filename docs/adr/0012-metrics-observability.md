# 0012 - Metrics and Observability

## Status

Accepted

## Context

Analytics can reveal sensitive workflow patterns. Mode A has no server metrics.

## Decision

No analytics in v1. The app exposes no beacon, tracker, or remote logging path. GitHub Pages traffic metrics, if viewed by the repo owner, are outside the app runtime.

## Consequences

Privacy is stronger, but product insight must come from user feedback, issues, and stars.

## Alternatives Considered

Plausible and a Cloudflare Worker beacon were considered and deferred.
