# 0044 Confidence Model

## Status

Accepted

## Context

No silent wrongness is a Phase 2 requirement. Inferences must not look certain when they are guesses.

## Decision

Confidence is represented as an integer from 0 to 100 with three display bands: high at 80+, medium at 55-79, and low below 55. Every condition, document shape, form-field label, validation warning, and OCR result carries confidence or derives from a confidence-bearing source.

## Consequences

Exports and debug output can preserve uncertainty. Users can correct or ignore low-confidence results instead of trusting them blindly.

## Alternatives Considered

Binary "detected/not detected" flags were rejected because they hide uncertainty.
