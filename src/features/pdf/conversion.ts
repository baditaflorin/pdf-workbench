import type { OcrResult } from "./types";

export function buildPlainText(embeddedText: string, ocrResults: OcrResult[]) {
  const sections = [
    embeddedText.trim(),
    ...ocrResults.map((result) => `${result.pageLabel}\n${result.text}`),
  ]
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.join("\n\n---\n\n");
}

export function buildMarkdown(
  fileName: string,
  embeddedText: string,
  ocrResults: OcrResult[],
) {
  const sections = [`# ${fileName}`, embeddedText.trim()];

  for (const result of ocrResults) {
    sections.push(`## ${result.pageLabel} OCR`, result.text.trim());
  }

  return sections.filter(Boolean).join("\n\n");
}

export function buildHtml(
  fileName: string,
  embeddedText: string,
  ocrResults: OcrResult[],
) {
  const markdown = buildMarkdown(fileName, embeddedText, ocrResults);
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
