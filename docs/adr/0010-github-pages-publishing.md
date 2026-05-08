# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live GitHub Pages URL is a first-class deliverable from the initial scaffold.

## Decision

Publish from `main` branch `/docs`. Vite builds into `docs/` with `base: "/pdf-workbench/"`. The prebuild step removes only generated Pages files and preserves source documentation such as `docs/adr/`. The postbuild step writes `404.html` as an SPA fallback and `.nojekyll` to avoid Jekyll processing. `docs/` is intentionally committed and not gitignored.

## Consequences

Every pushed build can be served by Pages without GitHub Actions. Built assets use hashed filenames for cache busting, and documentation survives rebuilds.

## Alternatives Considered

A `gh-pages` branch was rejected because it would add extra local release choreography. Publishing from `main /` was rejected because it would mix source and generated files.
