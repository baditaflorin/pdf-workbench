# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The app needs accessible controls, fast iteration, strict typing, and GitHub Pages publishing.

## Decision

Use React, TypeScript strict mode, and Vite. Use Tailwind CSS v4 as the CSS engine, with project CSS for the product surface. Use Vitest for unit tests and Playwright for smoke/e2e tests.

## Consequences

The frontend stack is familiar and deploys cleanly to GitHub Pages. Vite's `base` is `/pdf-workbench/`, and production output lands in `docs/`.

## Alternatives Considered

Svelte and Solid were viable, but React has broader PDF/rendering ecosystem examples and a larger contributor pool.
