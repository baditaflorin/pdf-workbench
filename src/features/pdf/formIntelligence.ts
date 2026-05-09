import type {
  FieldInferredType,
  FieldIntelligence,
  FieldWarning,
  PdfFormField,
} from "./types";

export type FormContext = {
  fileName: string;
};

type KnownField = {
  displayName: string;
  section: string;
  inferredType: FieldInferredType;
  required: boolean;
  confidence: number;
  reason: string;
};

const w9Fields: Record<string, KnownField> = {
  "f1_01[0]": known("Name", "Part I: taxpayer identity", "name", true),
  "f1_02[0]": known(
    "Business name or disregarded entity name",
    "Part I: taxpayer identity",
    "business_name",
    false,
  ),
  "c1_1[0]": known(
    "Federal tax classification: individual/sole proprietor",
    "Federal tax classification",
    "choice",
    false,
  ),
  "c1_1[1]": known(
    "Federal tax classification: C corporation",
    "Federal tax classification",
    "choice",
    false,
  ),
  "c1_1[2]": known(
    "Federal tax classification: S corporation",
    "Federal tax classification",
    "choice",
    false,
  ),
  "c1_1[3]": known(
    "Federal tax classification: partnership",
    "Federal tax classification",
    "choice",
    false,
  ),
  "c1_1[4]": known(
    "Federal tax classification: trust/estate",
    "Federal tax classification",
    "choice",
    false,
  ),
  "c1_1[5]": known(
    "Federal tax classification: limited liability company",
    "Federal tax classification",
    "choice",
    false,
  ),
  "f1_03[0]": known(
    "LLC tax classification code",
    "Federal tax classification",
    "choice",
    false,
  ),
  "c1_1[6]": known(
    "Federal tax classification: other",
    "Federal tax classification",
    "choice",
    false,
  ),
  "f1_04[0]": known(
    "Other federal tax classification",
    "Federal tax classification",
    "free_text",
    false,
  ),
  "c1_2[0]": known(
    "Exempt payee or FATCA reporting code applies",
    "Exemptions",
    "choice",
    false,
  ),
  "f1_05[0]": known("Address", "Part I: taxpayer identity", "address", true),
  "f1_06[0]": known(
    "City, state, and ZIP code",
    "Part I: taxpayer identity",
    "address",
    true,
  ),
  "f1_07[0]": known(
    "Requester name and address",
    "Requester",
    "address",
    false,
  ),
  "f1_08[0]": known("Account numbers", "Requester", "free_text", false),
  "f1_09[0]": known(
    "Social security number, first 3 digits",
    "Part I: taxpayer identification number",
    "tax_id",
    false,
  ),
  "f1_10[0]": known(
    "Social security number, middle 2 digits",
    "Part I: taxpayer identification number",
    "tax_id",
    false,
  ),
  "f1_11[0]": known(
    "Social security number, last 4 digits",
    "Part I: taxpayer identification number",
    "tax_id",
    false,
  ),
  "f1_12[0]": known(
    "Employer identification number, first 2 digits",
    "Part I: taxpayer identification number",
    "tax_id",
    false,
  ),
  "f1_13[0]": known(
    "Employer identification number, last 7 digits",
    "Part I: taxpayer identification number",
    "tax_id",
    false,
  ),
  "f1_14[0]": known("Signature", "Part II: certification", "signature", true),
  "f1_15[0]": known("Date", "Part II: certification", "date", true),
};

export function enhanceFormFields(
  fields: PdfFormField[],
  context: FormContext,
) {
  return fields.map((field) => {
    const intelligence = inferFieldIntelligence(field, context);
    return {
      ...field,
      intelligence: {
        ...intelligence,
        warnings: validateField(field, intelligence),
      },
    };
  });
}

export function inferFieldIntelligence(
  field: PdfFormField,
  context: FormContext,
): FieldIntelligence {
  const fileName = context.fileName.toLowerCase();
  const w9Field = fileName.includes("w9") ? lookupW9Field(field.name) : null;

  if (w9Field) {
    return { ...w9Field, warnings: [] };
  }

  const displayName = cleanDisplayName(field.name);
  const inferredType = inferType(displayName, field.type);
  const section = inferSection(displayName, fileName);
  const rawName = looksLikeRawFieldName(field.name);
  const confidence = rawName ? 48 : inferConfidence(displayName, inferredType);

  return {
    displayName,
    section,
    inferredType,
    required: inferRequired(displayName, inferredType),
    confidence,
    reason: rawName
      ? "The PDF exposes an internal field identifier; the label is a best-effort cleanup."
      : "The label comes from the PDF field name and was classified by common form vocabulary.",
    warnings: [],
  };
}

export function validateField(
  field: PdfFormField,
  intelligence: FieldIntelligence,
): FieldWarning[] {
  const warnings: FieldWarning[] = [];
  const value = field.value.trim();

  if (intelligence.required && !value && !field.checked) {
    warnings.push({
      id: "required-empty",
      message: "Required field is empty.",
      confidence: 86,
    });
  }

  if (value && intelligence.inferredType === "date" && !isLikelyDate(value)) {
    warnings.push({
      id: "date-format",
      message:
        "This looks like a date field, but the value is not a recognizable date.",
      confidence: 82,
    });
  }

  if (value && intelligence.inferredType === "tax_id") {
    const digits = value.replace(/\D/g, "");
    if (![2, 3, 4, 7, 9].includes(digits.length)) {
      warnings.push({
        id: "tax-id-format",
        message: "Tax ID fields should contain the expected number of digits.",
        confidence: 78,
      });
    }
  }

  if (
    value &&
    intelligence.inferredType === "email" &&
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
  ) {
    warnings.push({
      id: "email-format",
      message: "This does not look like a valid email address.",
      confidence: 80,
    });
  }

  return warnings;
}

export function fieldLabel(field: PdfFormField) {
  return field.intelligence?.displayName ?? cleanDisplayName(field.name);
}

function lookupW9Field(name: string) {
  const key = Object.keys(w9Fields).find((fieldKey) => name.includes(fieldKey));
  return key ? w9Fields[key] : null;
}

function known(
  displayName: string,
  section: string,
  inferredType: FieldInferredType,
  required: boolean,
): KnownField {
  return {
    displayName,
    section,
    inferredType,
    required,
    confidence: 95,
    reason: "Known IRS W-9 field order and identifier mapping.",
  };
}

function cleanDisplayName(value: string) {
  const cleaned = value
    .replace(/topmostSubform\[0\]\./gi, "")
    .replace(/Page\d+\[0\]\./gi, "")
    .replace(/ReadOrder\[0\]\./gi, "")
    .replace(/\[[0-9]+\]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\bmmddyyyy\b/gi, "MM/DD/YYYY")
    .replace(/\bmmddyyy\b/gi, "MM/DD/YYYY")
    .trim();

  if (!cleaned) {
    return "Unnamed field";
  }

  return cleaned
    .split(" ")
    .map((word) =>
      /^[A-Z0-9/]+$/.test(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function inferSection(label: string, fileName: string) {
  const normalized = label.toLowerCase();

  if (fileName.includes("i9")) {
    if (/preparer|translator/.test(normalized)) {
      return "Preparer and translator certification";
    }

    if (
      /list a|list b|list c|document|employer|authorized representative|firstdayemployed/.test(
        normalized,
      )
    ) {
      return "Section 2: employer review";
    }

    if (/rehire|section 3/.test(normalized)) {
      return "Section 3: reverification and rehire";
    }

    return "Section 1: employee information";
  }

  if (/signature|certification/.test(normalized)) {
    return "Certification";
  }

  if (/address|city|state|zip/.test(normalized)) {
    return "Address";
  }

  return "Document fields";
}

function inferType(
  label: string,
  fieldType: PdfFormField["type"],
): FieldInferredType {
  const normalized = label.toLowerCase();

  if (fieldType === "checkbox" || fieldType === "choice") {
    return "choice";
  }

  if (/e-?mail/.test(normalized)) {
    return "email";
  }

  if (/phone|telephone/.test(normalized)) {
    return "phone";
  }

  if (
    /social security|ssn|tin|ein|taxpayer identification|a-?number|uscis/.test(
      normalized,
    )
  ) {
    return "tax_id";
  }

  if (/date|expiration|birth|employed|rehire/.test(normalized)) {
    return "date";
  }

  if (/signature|signer/.test(normalized)) {
    return "signature";
  }

  if (/address|city|state|zip|apt/.test(normalized)) {
    return "address";
  }

  if (/document number|passport|admission number/.test(normalized)) {
    return "document_number";
  }

  if (/business|organization|org name|employer/.test(normalized)) {
    return "business_name";
  }

  if (/name|family|given/.test(normalized)) {
    return "name";
  }

  return "free_text";
}

function inferRequired(label: string, inferredType: FieldInferredType) {
  const normalized = label.toLowerCase();

  if (/if any|optional|additional|other last names|apt/.test(normalized)) {
    return false;
  }

  return (
    inferredType === "name" ||
    inferredType === "date" ||
    inferredType === "signature" ||
    inferredType === "address" ||
    /required|employee|employer|taxpayer|document number/.test(normalized)
  );
}

function inferConfidence(label: string, inferredType: FieldInferredType) {
  if (inferredType === "unknown") {
    return 35;
  }

  if (/^f\d+\s|^c\d+\s|^CB\b/i.test(label)) {
    return 45;
  }

  if (inferredType === "free_text") {
    return 74;
  }

  return 82;
}

function isLikelyDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) ||
    /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(value) ||
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(value)
  );
}

function looksLikeRawFieldName(value: string) {
  return /topmostSubform|\[[0-9]+\]|^f\d+_|^c\d+_|^CB_/i.test(value);
}
