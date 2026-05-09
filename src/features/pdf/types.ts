export type PdfFieldType = "text" | "checkbox" | "choice" | "unknown";

export type ConfidenceBand = "high" | "medium" | "low";

export type PdfConditionId =
  | "clean_text"
  | "dense_text"
  | "structured_text"
  | "fillable_form"
  | "government_form"
  | "government_publication"
  | "xfa_form"
  | "encrypted"
  | "restricted_pdf"
  | "corrupted"
  | "partial_pdf"
  | "scanned"
  | "large_document"
  | "mixed_language"
  | "rtl_text";

export type DocumentShapeId =
  | "generic_pdf"
  | "academic_paper"
  | "tax_form"
  | "employment_form"
  | "government_form"
  | "government_publication"
  | "invoice"
  | "scanned_archive"
  | "language_lesson"
  | "damaged_pdf";

export type PdfPrimaryAction =
  | "review"
  | "extract_outline"
  | "complete_form"
  | "unlock_or_flatten"
  | "extract_key_values"
  | "ocr_with_confidence"
  | "verify_reading_order"
  | "replace_file";

export type PdfInference = {
  id: string;
  label: string;
  confidence: number;
  reason: string;
  nextStep?: string;
};

export type PdfShapeInference = PdfInference & {
  id: DocumentShapeId;
};

export type PdfConditionInference = PdfInference & {
  id: PdfConditionId;
};

export type PdfTextStats = {
  sampleCharacters: number;
  normalizedCharacters: number;
  pagesSampled: number;
  hasRtlScript: boolean;
  hasMixedScripts: boolean;
};

export type PdfFormStats = {
  totalFields: number;
  mappedFields: number;
  requiredFields: number;
  rawIdentifierFields: number;
};

export type PdfWarning = {
  id: string;
  label: string;
  confidence: number;
  reason: string;
  nextStep: string;
};

export type PdfIntelligence = {
  schemaVersion: "pdf-intelligence.v1";
  sourceId: string;
  sizeBytes: number;
  pageCount: number;
  conditions: PdfConditionInference[];
  shape: PdfShapeInference;
  primaryAction: PdfPrimaryAction;
  summary: string;
  textStats: PdfTextStats;
  formStats: PdfFormStats;
  warnings: PdfWarning[];
  analyzedAt: string;
  elapsedMs: number;
};

export type PdfUserErrorKind =
  | "encrypted_pdf"
  | "corrupt_pdf"
  | "empty_pdf"
  | "unsupported_pdf"
  | "ocr_unavailable"
  | "operation_cancelled"
  | "unknown_pdf_error";

export type PdfUserError = {
  kind: PdfUserErrorKind;
  title: string;
  what: string;
  why: string;
  nextStep: string;
  recoverable: boolean;
  technicalDetail?: string;
};

export type FieldInferredType =
  | "name"
  | "business_name"
  | "tax_id"
  | "date"
  | "signature"
  | "address"
  | "email"
  | "phone"
  | "document_number"
  | "choice"
  | "free_text"
  | "unknown";

export type FieldWarning = {
  id: string;
  message: string;
  confidence: number;
};

export type FieldIntelligence = {
  displayName: string;
  section: string;
  inferredType: FieldInferredType;
  required: boolean;
  confidence: number;
  reason: string;
  warnings: FieldWarning[];
};

export type PdfFormField = {
  name: string;
  type: PdfFieldType;
  value: string;
  checked?: boolean;
  options?: string[];
  intelligence?: FieldIntelligence;
};

export type PdfPageState = {
  id: string;
  sourceIndex: number;
  label: string;
  width: number;
  height: number;
  rotation: number;
  deleted: boolean;
};

export type TextStamp = {
  id: string;
  pageId: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};

export type SignatureStamp = {
  id: string;
  pageId: string;
  signer: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageDataUrl?: string;
};

export type OcrResult = {
  pageLabel: string;
  text: string;
  confidence: number;
  createdAt: string;
  engine?: string;
  language?: string;
  source?: "ocr";
};

export type ActivityLogEntry = {
  id: string;
  at: string;
  kind:
    | "open"
    | "analyze"
    | "extract_text"
    | "ocr"
    | "edit"
    | "export"
    | "error"
    | "cancel";
  message: string;
  detail?: string;
};

export type PdfProject = {
  id: string;
  sourceId: string;
  fileName: string;
  sizeBytes: number;
  bytes: Uint8Array;
  pages: PdfPageState[];
  fields: PdfFormField[];
  textStamps: TextStamp[];
  signatureStamps: SignatureStamp[];
  ocrResults: OcrResult[];
  embeddedText: string;
  intelligence: PdfIntelligence;
  activityLog: ActivityLogEntry[];
  loadedAt: string;
};
