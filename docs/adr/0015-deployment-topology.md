# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode C deployment artifacts are not needed for a static GitHub Pages app.

## Decision

Deploy only through GitHub Pages at https://baditaflorin.github.io/pdf-workbench/. No Docker Compose, nginx, Prometheus, or server directory is included in v1.

## Consequences

Operational burden is very low. Features requiring a confidential server or native processing must wait for a future Mode C ADR.

## Alternatives Considered

Docker hosting was rejected for v1 because it would weaken the local-first document privacy model.
