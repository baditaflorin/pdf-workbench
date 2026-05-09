import { z } from "zod";
import type { PdfProject } from "./types";

export const projectArchiveVersion = "pdf-workbench.project.v1";

const fieldWarningSchema = z.object({
  id: z.string(),
  message: z.string(),
  confidence: z.number(),
});

const fieldIntelligenceSchema = z.object({
  displayName: z.string(),
  section: z.string(),
  inferredType: z.enum([
    "name",
    "business_name",
    "tax_id",
    "date",
    "signature",
    "address",
    "email",
    "phone",
    "document_number",
    "choice",
    "free_text",
    "unknown",
  ]),
  required: z.boolean(),
  confidence: z.number(),
  reason: z.string(),
  warnings: z.array(fieldWarningSchema),
});

const formFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "checkbox", "choice", "unknown"]),
  value: z.string(),
  checked: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  intelligence: fieldIntelligenceSchema.optional(),
});

const pageStateSchema = z.object({
  id: z.string(),
  sourceIndex: z.number(),
  label: z.string(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  deleted: z.boolean(),
});

const textStampSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  fontSize: z.number(),
  color: z.string(),
});

const signatureStampSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  signer: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  imageDataUrl: z.string().optional(),
});

const ocrResultSchema = z.object({
  pageLabel: z.string(),
  text: z.string(),
  confidence: z.number(),
  createdAt: z.string(),
  engine: z.string().optional(),
  language: z.string().optional(),
  source: z.literal("ocr").optional(),
});

const conditionIdSchema = z.enum([
  "clean_text",
  "dense_text",
  "structured_text",
  "fillable_form",
  "government_form",
  "government_publication",
  "xfa_form",
  "encrypted",
  "restricted_pdf",
  "corrupted",
  "partial_pdf",
  "scanned",
  "large_document",
  "mixed_language",
  "rtl_text",
]);

const shapeIdSchema = z.enum([
  "generic_pdf",
  "academic_paper",
  "tax_form",
  "employment_form",
  "government_form",
  "government_publication",
  "invoice",
  "scanned_archive",
  "language_lesson",
  "damaged_pdf",
]);

const primaryActionSchema = z.enum([
  "review",
  "extract_outline",
  "complete_form",
  "unlock_or_flatten",
  "extract_key_values",
  "ocr_with_confidence",
  "verify_reading_order",
  "replace_file",
]);

const baseInferenceSchema = z.object({
  id: z.string(),
  label: z.string(),
  confidence: z.number(),
  reason: z.string(),
  nextStep: z.string().optional(),
});

const conditionInferenceSchema = baseInferenceSchema.extend({
  id: conditionIdSchema,
});

const shapeInferenceSchema = baseInferenceSchema.extend({
  id: shapeIdSchema,
});

const warningSchema = z.object({
  id: z.string(),
  label: z.string(),
  confidence: z.number(),
  reason: z.string(),
  nextStep: z.string(),
});

const intelligenceSchema = z.object({
  schemaVersion: z.literal("pdf-intelligence.v1"),
  sourceId: z.string(),
  sizeBytes: z.number(),
  pageCount: z.number(),
  conditions: z.array(conditionInferenceSchema),
  shape: shapeInferenceSchema,
  primaryAction: primaryActionSchema,
  summary: z.string(),
  textStats: z.object({
    sampleCharacters: z.number(),
    normalizedCharacters: z.number(),
    pagesSampled: z.number(),
    hasRtlScript: z.boolean(),
    hasMixedScripts: z.boolean(),
  }),
  formStats: z.object({
    totalFields: z.number(),
    mappedFields: z.number(),
    requiredFields: z.number(),
    rawIdentifierFields: z.number(),
  }),
  warnings: z.array(warningSchema),
  analyzedAt: z.string(),
  elapsedMs: z.number(),
});

const activityLogEntrySchema = z.object({
  id: z.string(),
  at: z.string(),
  kind: z.enum([
    "open",
    "analyze",
    "extract_text",
    "ocr",
    "edit",
    "export",
    "error",
    "cancel",
  ]),
  message: z.string(),
  detail: z.string().optional(),
});

const projectArchiveSchema = z.object({
  schemaVersion: z.literal(projectArchiveVersion),
  exportedAt: z.string(),
  appVersion: z.string(),
  commit: z.string(),
  selectedPageId: z.string().nullable(),
  project: z.object({
    id: z.string(),
    sourceId: z.string(),
    fileName: z.string(),
    sizeBytes: z.number(),
    bytesBase64: z.string(),
    pages: z.array(pageStateSchema),
    fields: z.array(formFieldSchema),
    textStamps: z.array(textStampSchema),
    signatureStamps: z.array(signatureStampSchema),
    ocrResults: z.array(ocrResultSchema),
    embeddedText: z.string(),
    intelligence: intelligenceSchema,
    activityLog: z.array(activityLogEntrySchema),
    loadedAt: z.string(),
  }),
});

export type ProjectArchive = z.infer<typeof projectArchiveSchema>;

export function exportProjectArchive(
  project: PdfProject,
  selectedPageId: string | null,
  appVersion: string,
  commit: string,
  exportedAt = new Date().toISOString(),
) {
  const archive = {
    schemaVersion: projectArchiveVersion,
    exportedAt,
    appVersion,
    commit,
    selectedPageId,
    project: {
      ...project,
      bytesBase64: bytesToBase64(project.bytes),
    },
  };

  return `${JSON.stringify(projectArchiveSchema.parse(archive), null, 2)}\n`;
}

export function importProjectArchive(json: string) {
  const archive = projectArchiveSchema.parse(JSON.parse(json) as unknown);
  const { bytesBase64, ...projectWithoutBytes } = archive.project;

  return {
    selectedPageId: archive.selectedPageId,
    project: {
      ...projectWithoutBytes,
      bytes: base64ToBytes(bytesBase64),
    } satisfies PdfProject,
    archive,
  };
}

export function canonicalProjectState(project: PdfProject) {
  return {
    sourceId: project.sourceId,
    fileName: project.fileName,
    sizeBytes: project.sizeBytes,
    pages: project.pages,
    fields: project.fields.map((field) => ({
      name: field.name,
      type: field.type,
      value: field.value,
      checked: field.checked,
      options: field.options,
      label: field.intelligence?.displayName,
      warnings: field.intelligence?.warnings.map((warning) => warning.id),
    })),
    textStamps: project.textStamps,
    signatureStamps: project.signatureStamps,
    ocrResults: project.ocrResults.map((result) => ({
      pageLabel: result.pageLabel,
      text: result.text,
      confidence: result.confidence,
      engine: result.engine,
      language: result.language,
      source: result.source,
    })),
    embeddedText: project.embeddedText,
    intelligence: {
      sourceId: project.intelligence.sourceId,
      conditions: project.intelligence.conditions.map((item) => item.id),
      shape: project.intelligence.shape.id,
      primaryAction: project.intelligence.primaryAction,
      warnings: project.intelligence.warnings.map((item) => item.id),
    },
  };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
