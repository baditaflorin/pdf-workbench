import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

export async function renderPdfPage(
  bytes: Uint8Array,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale = 1.25,
) {
  const loadingTask = getDocument({ data: bytes.slice() });
  const pdf = await loadingTask.promise;

  try {
    const page = await pdf.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas rendering is unavailable in this browser.");
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;
  } finally {
    await pdf.destroy();
  }
}

export async function renderPdfPageToBlob(
  bytes: Uint8Array,
  pageIndex: number,
  scale = 2,
) {
  const canvas = document.createElement("canvas");
  await renderPdfPage(bytes, pageIndex, canvas, scale);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Could not render the page for OCR."));
      }
    }, "image/png");
  });
}

export async function extractEmbeddedText(
  bytes: Uint8Array,
  pageIndex?: number,
) {
  const loadingTask = getDocument({ data: bytes.slice() });
  const pdf = await loadingTask.promise;
  const pageNumbers =
    typeof pageIndex === "number"
      ? [pageIndex + 1]
      : Array.from({ length: pdf.numPages }, (_, index) => index + 1);
  const chunks: string[] = [];

  try {
    for (const pageNumber of pageNumbers) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? (item as TextItem).str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) {
        chunks.push(`Page ${pageNumber}\n${text}`);
      }
    }
  } finally {
    await pdf.destroy();
  }

  return chunks.join("\n\n");
}
