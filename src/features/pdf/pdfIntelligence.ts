import type {
  ConfidenceBand,
  DocumentShapeId,
  FieldIntelligence,
  PdfConditionId,
  PdfConditionInference,
  PdfFormField,
  PdfFormStats,
  PdfInference,
  PdfIntelligence,
  PdfPrimaryAction,
  PdfShapeInference,
  PdfTextStats,
  PdfUserError,
  PdfWarning,
} from "./types";

export type PdfIntelligenceSignal = {
  fileName: string;
  sizeBytes: number;
  pageCount: number;
  sourceId: string;
  fields: PdfFormField[];
  sampleText: string;
  pagesSampled: number;
  elapsedMs?: number;
  error?: PdfUserError;
  analyzedAt?: string;
};

const largePageThreshold = 100;
const largeSizeThreshold = 5 * 1024 * 1024;

const conditionLabels: Record<PdfConditionId, string> = {
  clean_text: "Clean text PDF",
  dense_text: "Dense text",
  structured_text: "Structured text",
  fillable_form: "Fillable form",
  government_form: "Government form",
  government_publication: "Government publication",
  xfa_form: "XFA-style form",
  encrypted: "Encrypted PDF",
  restricted_pdf: "Restricted PDF",
  corrupted: "Corrupted PDF",
  partial_pdf: "Partial PDF",
  scanned: "Scanned document",
  large_document: "Large document",
  mixed_language: "Mixed language",
  rtl_text: "Right-to-left text",
};

const shapeLabels: Record<DocumentShapeId, string> = {
  generic_pdf: "General PDF",
  academic_paper: "Academic paper",
  tax_form: "Tax form",
  employment_form: "Employment form",
  government_form: "Government form",
  government_publication: "Government publication",
  invoice: "Invoice",
  scanned_archive: "Scanned archive",
  language_lesson: "Language lesson",
  damaged_pdf: "Damaged PDF",
};

const actionLabels: Record<PdfPrimaryAction, string> = {
  review: "Review the document",
  extract_outline: "Extract an outline",
  complete_form: "Complete the form",
  unlock_or_flatten: "Open an unlocked or flattened copy",
  extract_key_values: "Extract key values",
  ocr_with_confidence: "Run OCR with confidence review",
  verify_reading_order: "Verify reading order",
  replace_file: "Replace the file",
};

export function buildPdfIntelligence(
  signal: PdfIntelligenceSignal,
): PdfIntelligence {
  const normalizedText = normalizePdfText(signal.sampleText);
  const textStats = buildTextStats(
    signal.sampleText,
    normalizedText,
    signal.pagesSampled,
  );
  const formStats = buildFormStats(signal.fields);
  const conditions = inferConditions(signal, textStats, formStats);
  const shape = inferShape(signal, normalizedText, conditions, formStats);
  const primaryAction = inferPrimaryAction(signal.error, shape.id, conditions);
  const warnings = inferWarnings(signal, conditions, formStats, textStats);

  return {
    schemaVersion: "pdf-intelligence.v1",
    sourceId: signal.sourceId,
    sizeBytes: signal.sizeBytes,
    pageCount: signal.pageCount,
    conditions,
    shape,
    primaryAction,
    summary: buildSummary(shape, conditions, primaryAction),
    textStats,
    formStats,
    warnings,
    analyzedAt: signal.analyzedAt ?? new Date(0).toISOString(),
    elapsedMs: signal.elapsedMs ?? 0,
  };
}

export function buildSourceId(fileName: string, bytes: Uint8Array) {
  const hash = fnv1a(bytes);
  const base = fileName
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 44);
  return `${base || "pdf"}-${bytes.byteLength}-${hash}`;
}

export function normalizePdfText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function confidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 80) {
    return "high";
  }

  if (confidence >= 55) {
    return "medium";
  }

  return "low";
}

export function explainPdfError(error: unknown): PdfUserError {
  const technicalDetail =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  const lower = technicalDetail.toLowerCase();

  if (lower.includes("encrypted")) {
    return {
      kind: "encrypted_pdf",
      title: "This PDF is restricted",
      what: "The browser could not open the document because it is encrypted or permission-restricted.",
      why: "Some government and form PDFs require an owner password or a flattened copy before browser tools can edit them.",
      nextStep:
        "Open the PDF in its source app and export an unlocked or flattened copy, then try that file here.",
      recoverable: true,
      technicalDetail,
    };
  }

  if (
    lower.includes("failed to parse") ||
    lower.includes("invalid pdf") ||
    lower.includes("invalid object") ||
    lower.includes("xref")
  ) {
    return {
      kind: "corrupt_pdf",
      title: "This PDF looks incomplete or corrupted",
      what: "The document structure stops before the browser can read the pages safely.",
      why: "This usually happens when a download, email attachment, scanner transfer, or upload was interrupted.",
      nextStep:
        "Re-download or re-export the PDF. If it came from a scanner, ask for a fresh PDF instead of this partial file.",
      recoverable: true,
      technicalDetail,
    };
  }

  if (lower.includes("cancel")) {
    return {
      kind: "operation_cancelled",
      title: "Operation cancelled",
      what: "The running PDF operation was stopped before it changed the project.",
      why: "Long document work can be cancelled to keep the browser responsive.",
      nextStep: "Start the operation again when you are ready.",
      recoverable: true,
      technicalDetail,
    };
  }

  if (lower.includes("page") && lower.includes("0")) {
    return {
      kind: "empty_pdf",
      title: "This PDF has no readable pages",
      what: "The browser could not find a usable page tree in the document.",
      why: "The file may be empty, damaged, or not actually a PDF.",
      nextStep:
        "Check the file in another PDF viewer, then export a fresh copy.",
      recoverable: true,
      technicalDetail,
    };
  }

  return {
    kind: "unknown_pdf_error",
    title: "The PDF could not be processed",
    what: "The browser hit an unexpected PDF problem.",
    why: "The file may use a PDF feature this local-only workbench does not understand yet.",
    nextStep:
      "Try exporting a flattened PDF from another viewer and open that copy here.",
    recoverable: true,
    technicalDetail,
  };
}

export function errorToIntelligence(
  fileName: string,
  sizeBytes: number,
  sourceId: string,
  error: PdfUserError,
) {
  return buildPdfIntelligence({
    fileName,
    sizeBytes,
    pageCount: 0,
    sourceId,
    fields: [],
    sampleText: "",
    pagesSampled: 0,
    error,
  });
}

export function canonicalIntelligence(intelligence: PdfIntelligence) {
  return {
    schemaVersion: intelligence.schemaVersion,
    sourceId: intelligence.sourceId,
    sizeBytes: intelligence.sizeBytes,
    pageCount: intelligence.pageCount,
    shape: intelligence.shape.id,
    primaryAction: intelligence.primaryAction,
    conditions: intelligence.conditions.map((condition) => condition.id).sort(),
    warnings: intelligence.warnings.map((warning) => warning.id).sort(),
    textStats: intelligence.textStats,
    formStats: intelligence.formStats,
  };
}

function inferConditions(
  signal: PdfIntelligenceSignal,
  textStats: PdfTextStats,
  formStats: PdfFormStats,
) {
  const conditions: PdfConditionInference[] = [];
  const lowerName = signal.fileName.toLowerCase();
  const normalized = normalizePdfText(signal.sampleText).toLowerCase();

  if (signal.error?.kind === "encrypted_pdf") {
    conditions.push(
      condition(
        "encrypted",
        98,
        "The PDF loader reported document encryption.",
        "Use an unlocked or flattened copy.",
      ),
      condition(
        "restricted_pdf",
        92,
        "Encrypted PDFs often restrict editing even when printing is allowed.",
        "Check the document permissions in the source viewer.",
      ),
    );
  }

  if (signal.error?.kind === "corrupt_pdf") {
    conditions.push(
      condition(
        "corrupted",
        98,
        "The PDF parser could not reconstruct a valid page tree.",
        "Replace the file with a fresh export.",
      ),
      condition(
        "partial_pdf",
        88,
        "The parser failed near a stream/object boundary, which is common for truncated files.",
        "Re-download or re-scan the PDF.",
      ),
    );
  }

  if (formStats.totalFields > 0) {
    conditions.push(
      condition(
        "fillable_form",
        95,
        `${formStats.totalFields} fillable field(s) were detected.`,
        "Review the inferred field labels before filling.",
      ),
    );
  }

  if (
    lowerName.includes("w9") ||
    lowerName.includes("i9") ||
    lowerName.includes("t1261") ||
    /\b(irs|uscis|revenue agency|form w-9|form i-9)\b/i.test(normalized)
  ) {
    conditions.push(
      condition(
        "government_form",
        88,
        "The file name, document text, or field names match a government form.",
        "Use form validation before exporting.",
      ),
    );
  }

  if (
    lowerName.includes("w9") ||
    lowerName.includes("t1261") ||
    signal.fields.some((field) => field.name.includes("topmostSubform"))
  ) {
    conditions.push(
      condition(
        "xfa_form",
        83,
        "The field identifiers match XFA-style form naming.",
        "Flatten after filling and verify the exported PDF.",
      ),
    );
  }

  if (
    signal.pageCount >= largePageThreshold ||
    signal.sizeBytes >= largeSizeThreshold
  ) {
    conditions.push(
      condition(
        "large_document",
        90,
        `${signal.pageCount || "Many"} pages or ${formatBytes(signal.sizeBytes)} exceeds the large-document budget.`,
        "Use progress-aware extraction and bounded page navigation.",
      ),
    );
  }

  if (
    signal.pageCount > 0 &&
    textStats.normalizedCharacters < Math.max(80, signal.pagesSampled * 80) &&
    (signal.pageCount > 2 || textStats.normalizedCharacters < 2) &&
    formStats.totalFields === 0
  ) {
    conditions.push(
      condition(
        "scanned",
        signal.pageCount >= largePageThreshold ? 90 : 72,
        "The sampled pages contain little embedded text.",
        "Run OCR and review confidence before using the export.",
      ),
    );
  }

  if (textStats.hasMixedScripts) {
    conditions.push(
      condition(
        "mixed_language",
        86,
        "The text sample contains both Latin and right-to-left script.",
        "Verify reading order before exporting text.",
      ),
    );
  }

  if (textStats.hasRtlScript) {
    conditions.push(
      condition(
        "rtl_text",
        88,
        "The text sample contains right-to-left characters.",
        "Check whether exported text preserves the intended order.",
      ),
    );
  }

  if (
    /\bpublication\s+17\b|\bfederal income tax\b|\byour federal income tax\b/i.test(
      normalized,
    )
  ) {
    conditions.push(
      condition(
        "government_publication",
        91,
        "The text matches a government publication rather than a short form.",
        "Extract an outline or table of contents first.",
      ),
    );
  }

  if (
    textStats.normalizedCharacters > 1000 &&
    !hasCondition(conditions, "scanned")
  ) {
    conditions.push(
      condition(
        "dense_text",
        82,
        "The sampled pages contain substantial embedded text.",
        "Extract text or an outline before editing.",
      ),
    );
  }

  if (isStructuredText(normalized) && !hasCondition(conditions, "scanned")) {
    conditions.push(
      condition(
        "structured_text",
        78,
        "The text sample has recognizable document sections or key-value language.",
        "Use the inferred shape as a starting point.",
      ),
    );
  }

  if (conditions.length === 0 && signal.pageCount > 0) {
    conditions.push(
      condition(
        "clean_text",
        75,
        "The file opened cleanly and no special PDF condition was detected.",
        "Review, edit, or export normally.",
      ),
    );
  }

  return uniqueConditions(conditions);
}

function inferShape(
  signal: PdfIntelligenceSignal,
  normalizedText: string,
  conditions: PdfConditionInference[],
  formStats: PdfFormStats,
): PdfShapeInference {
  const lowerName = signal.fileName.toLowerCase();
  const lowerText = normalizedText.toLowerCase();

  if (signal.error?.kind === "corrupt_pdf") {
    return shape(
      "damaged_pdf",
      98,
      "The parser could not read a valid PDF structure.",
    );
  }

  if (
    lowerName.includes("w9") ||
    /form w-9|taxpayer identification/i.test(lowerText)
  ) {
    return shape("tax_form", 94, "The file matches IRS Form W-9 signals.");
  }

  if (
    lowerName.includes("i9") ||
    /form i-9|employment eligibility/i.test(lowerText)
  ) {
    return shape(
      "employment_form",
      94,
      "The file matches USCIS Form I-9 signals.",
    );
  }

  if (
    lowerName.includes("t1261") ||
    /canada revenue agency|individual tax number/i.test(lowerText)
  ) {
    return shape(
      "government_form",
      88,
      "The file matches a government tax-number application.",
    );
  }

  if (
    hasCondition(conditions, "scanned") &&
    signal.pageCount >= largePageThreshold
  ) {
    return shape(
      "scanned_archive",
      88,
      "The document is large and has little embedded text.",
    );
  }

  if (
    /\binvoice\b|\bsubtotal\b|\bamount due\b|\bvendor\b|\bremit\b/i.test(
      lowerText,
    )
  ) {
    return shape(
      "invoice",
      86,
      "The text sample contains invoice vocabulary and totals.",
    );
  }

  if (
    /attention is all you need|\babstract\b|\breferences\b|\barxiv\b/i.test(
      lowerText,
    )
  ) {
    return shape(
      "academic_paper",
      88,
      "The text sample contains academic paper sections.",
    );
  }

  if (hasCondition(conditions, "government_publication")) {
    return shape(
      "government_publication",
      90,
      "The text identifies a long government publication.",
    );
  }

  if (
    hasCondition(conditions, "mixed_language") &&
    /hebrew|romanization|english/i.test(lowerText)
  ) {
    return shape(
      "language_lesson",
      84,
      "The sample mixes language-learning columns and right-to-left text.",
    );
  }

  if (formStats.totalFields > 0) {
    return shape(
      "government_form",
      68,
      "The document is fillable but the exact form shape is uncertain.",
    );
  }

  return shape(
    "generic_pdf",
    70,
    "No specialized document shape was detected.",
  );
}

function inferPrimaryAction(
  error: PdfUserError | undefined,
  shapeId: DocumentShapeId,
  conditions: PdfConditionInference[],
): PdfPrimaryAction {
  if (error?.kind === "encrypted_pdf") {
    return "unlock_or_flatten";
  }

  if (error?.kind === "corrupt_pdf") {
    return "replace_file";
  }

  if (
    shapeId === "tax_form" ||
    shapeId === "employment_form" ||
    shapeId === "government_form"
  ) {
    return "complete_form";
  }

  if (shapeId === "invoice") {
    return "extract_key_values";
  }

  if (shapeId === "academic_paper" || shapeId === "government_publication") {
    return "extract_outline";
  }

  if (hasCondition(conditions, "scanned")) {
    return "ocr_with_confidence";
  }

  if (
    hasCondition(conditions, "mixed_language") ||
    hasCondition(conditions, "rtl_text")
  ) {
    return "verify_reading_order";
  }

  return "review";
}

function inferWarnings(
  signal: PdfIntelligenceSignal,
  conditions: PdfConditionInference[],
  formStats: PdfFormStats,
  textStats: PdfTextStats,
) {
  const warnings: PdfWarning[] = [];

  if (signal.error) {
    warnings.push({
      id: signal.error.kind,
      label: signal.error.title,
      confidence: 95,
      reason: signal.error.why,
      nextStep: signal.error.nextStep,
    });
  }

  if (hasCondition(conditions, "scanned")) {
    warnings.push({
      id: "ocr-required",
      label: "OCR needed for searchable text",
      confidence: 90,
      reason: "Embedded text is sparse compared with the page count.",
      nextStep:
        "Run OCR and verify low-confidence pages before exporting text.",
    });
  }

  if (hasCondition(conditions, "large_document")) {
    warnings.push({
      id: "large-document-budget",
      label: "Large document workflow",
      confidence: 88,
      reason: "Large PDFs can make extraction and page navigation slow.",
      nextStep:
        "Use progress-aware extraction and cancel if the result is not useful.",
    });
  }

  if (formStats.rawIdentifierFields > 0) {
    warnings.push({
      id: "raw-form-identifiers",
      label: "Raw form identifiers detected",
      confidence: 84,
      reason: `${formStats.rawIdentifierFields} field(s) use internal PDF names.`,
      nextStep:
        "Review inferred labels and confidence before exporting a filled form.",
    });
  }

  if (textStats.hasRtlScript) {
    warnings.push({
      id: "rtl-reading-order",
      label: "Reading order needs review",
      confidence: 82,
      reason:
        "Right-to-left text can extract in a visually plausible but semantically wrong order.",
      nextStep:
        "Compare exported text with the PDF preview before using it downstream.",
    });
  }

  return warnings;
}

function buildTextStats(
  sampleText: string,
  normalizedText: string,
  pagesSampled: number,
): PdfTextStats {
  const hasRtlScript = /[\u0590-\u08ff]/u.test(normalizedText);
  const hasLatin = /[a-z]/iu.test(normalizedText);

  return {
    sampleCharacters: sampleText.length,
    normalizedCharacters: normalizedText.length,
    pagesSampled,
    hasRtlScript,
    hasMixedScripts: hasRtlScript && hasLatin,
  };
}

function buildFormStats(fields: PdfFormField[]): PdfFormStats {
  const mappedFields = fields.filter(
    (field) =>
      field.intelligence &&
      field.intelligence.confidence >= 70 &&
      !looksLikeRawFieldName(field.intelligence.displayName),
  ).length;
  const requiredFields = fields.filter(
    (field) => field.intelligence?.required,
  ).length;
  const rawIdentifierFields = fields.filter((field) =>
    looksLikeRawFieldName(field.name),
  ).length;

  return {
    totalFields: fields.length,
    mappedFields,
    requiredFields,
    rawIdentifierFields,
  };
}

function buildSummary(
  shape: PdfShapeInference,
  conditions: PdfConditionInference[],
  primaryAction: PdfPrimaryAction,
) {
  const topConditions = conditions
    .slice(0, 3)
    .map((item) => item.label.toLowerCase())
    .join(", ");
  const conditionText = topConditions ? ` with ${topConditions}` : "";
  return `${shape.label}${conditionText}. Suggested next step: ${actionLabels[primaryAction]}.`;
}

function isStructuredText(text: string) {
  return /\b(abstract|references|invoice|subtotal|total|table of contents|publication|form|signature|date)\b/i.test(
    text,
  );
}

function condition(
  id: PdfConditionId,
  confidence: number,
  reason: string,
  nextStep?: string,
): PdfConditionInference {
  return {
    id,
    label: conditionLabels[id],
    confidence,
    reason,
    nextStep,
  };
}

function shape(
  id: DocumentShapeId,
  confidence: number,
  reason: string,
): PdfShapeInference {
  return {
    id,
    label: shapeLabels[id],
    confidence,
    reason,
  };
}

function hasCondition(
  conditions: Array<PdfInference & { id: string }>,
  id: PdfConditionId,
) {
  return conditions.some((conditionItem) => conditionItem.id === id);
}

function uniqueConditions(conditions: PdfConditionInference[]) {
  const seen = new Set<PdfConditionId>();
  return conditions
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    })
    .sort(
      (a, b) => b.confidence - a.confidence || a.label.localeCompare(b.label),
    );
}

function looksLikeRawFieldName(value: string) {
  return /topmostSubform|\[[0-9]+\]|^f\d+_|^c\d+_|^CB_/i.test(value);
}

function fnv1a(bytes: Uint8Array) {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} bytes`;
}

export function buildFieldStats(fields: PdfFormField[]): PdfFormStats {
  return buildFormStats(fields);
}

export function fieldConfidenceBand(field: FieldIntelligence | undefined) {
  return confidenceBand(field?.confidence ?? 0);
}
