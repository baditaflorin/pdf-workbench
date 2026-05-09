# 0042 Inference Engine

## Status

Accepted

## Context

V1 exposes pages, raw fields, and flat extracted text. Users need the app to infer obvious document facts: form, scan, invoice, paper, large publication, mixed-language text, corruption, and next action.

## Decision

Add a deterministic browser-side inference engine. It uses ordered heuristics over PDF metadata, field names, text samples, text density, file size, and page count. Each inference returns a label, confidence, reason, and suggested next action.

## Consequences

The engine is inspectable, testable, and fast. It will not claim semantic certainty where browser-only evidence is weak; low-confidence results are shown as such.

## Alternatives Considered

A local LLM classifier was rejected for default inference because browser LLM availability is not consistent and would make fixture outputs non-deterministic.
