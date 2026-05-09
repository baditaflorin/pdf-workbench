import type { OcrResult, PdfIntelligence } from "./types";

export type ExportMetadata = {
  sourceId: string;
  fileName: string;
  appVersion: string;
  commit: string;
  schemaVersion: string;
  generatedAt: string;
  shape: string;
  conditions: string[];
  primaryAction: string;
};

export function buildPlainText(
  embeddedText: string,
  ocrResults: OcrResult[],
  metadata?: ExportMetadata,
) {
  const sections = [
    metadata ? buildTextMetadata(metadata) : "",
    embeddedText.trim(),
    ...ocrResults.map(
      (result) =>
        `${result.pageLabel} OCR\nConfidence: ${result.confidence}%\nEngine: ${
          result.engine ?? "tesseract.js"
        }\nLanguage: ${result.language ?? "eng"}\n\n${result.text}`,
    ),
  ]
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.join("\n\n---\n\n");
}

export function buildMarkdown(
  fileName: string,
  embeddedText: string,
  ocrResults: OcrResult[],
  metadata?: ExportMetadata,
) {
  const sections = [`# ${fileName}`];

  if (metadata) {
    sections.push(
      "## Export metadata",
      [
        `- Source ID: ${metadata.sourceId}`,
        `- App version: ${metadata.appVersion}`,
        `- Commit: ${metadata.commit}`,
        `- Schema: ${metadata.schemaVersion}`,
        `- Generated at: ${metadata.generatedAt}`,
        `- Shape: ${metadata.shape}`,
        `- Conditions: ${metadata.conditions.join(", ") || "none"}`,
        `- Suggested action: ${metadata.primaryAction}`,
      ].join("\n"),
    );
  }

  sections.push(embeddedText.trim());

  for (const result of ocrResults) {
    sections.push(
      `## ${result.pageLabel} OCR`,
      `Confidence: ${result.confidence}%\n\n${result.text.trim()}`,
    );
  }

  return sections.filter(Boolean).join("\n\n");
}

export function buildHtml(
  fileName: string,
  embeddedText: string,
  ocrResults: OcrResult[],
  metadata?: ExportMetadata,
) {
  const markdown = buildMarkdown(fileName, embeddedText, ocrResults, metadata);
  const paragraphs = markdown
    .split(/\n{2,}/)
    .map((block) => {
      if (block.startsWith("# ")) {
        return `<h1>${escapeHtml(block.slice(2))}</h1>`;
      }

      if (block.startsWith("## ")) {
        return `<h2>${escapeHtml(block.slice(3))}</h2>`;
      }

      return `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(fileName)}</title>
  <style>body{font-family:system-ui,sans-serif;max-width:72ch;margin:3rem auto;line-height:1.6;color:#172033}</style>
</head>
<body>
${paragraphs}
</body>
</html>`;
}

export function buildExportMetadata(
  fileName: string,
  intelligence: PdfIntelligence,
  appVersion: string,
  commit: string,
  generatedAt = new Date().toISOString(),
): ExportMetadata {
  return {
    sourceId: intelligence.sourceId,
    fileName,
    appVersion,
    commit,
    schemaVersion: intelligence.schemaVersion,
    generatedAt,
    shape: intelligence.shape.id,
    conditions: intelligence.conditions.map((condition) => condition.id).sort(),
    primaryAction: intelligence.primaryAction,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildTextMetadata(metadata: ExportMetadata) {
  return [
    "PDF Workbench Export Metadata",
    `Source ID: ${metadata.sourceId}`,
    `File: ${metadata.fileName}`,
    `App version: ${metadata.appVersion}`,
    `Commit: ${metadata.commit}`,
    `Schema: ${metadata.schemaVersion}`,
    `Generated at: ${metadata.generatedAt}`,
    `Shape: ${metadata.shape}`,
    `Conditions: ${metadata.conditions.join(", ") || "none"}`,
    `Suggested action: ${metadata.primaryAction}`,
  ].join("\n");
}
