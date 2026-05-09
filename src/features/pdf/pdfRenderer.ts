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
  options: {
    signal?: AbortSignal;
    onProgress?: (message: string) => void;
  } = {},
) {
  const loadingTask = getDocument({ data: bytes.slice() });
  const pdf = await loadingTask.promise;
  const pageNumbers =
    typeof pageIndex === "number"
      ? [pageIndex + 1]
      : Array.from({ length: pdf.numPages }, (_, index) => index + 1);
  const chunks: string[] = [];

  try {
    for (const [index, pageNumber] of pageNumbers.entries()) {
      throwIfAborted(options.signal);
      options.onProgress?.(
        `Extracting embedded text ${index + 1}/${pageNumbers.length}...`,
      );
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

export async function extractTextSample(
  bytes: Uint8Array,
  maxPages = 3,
  options: { signal?: AbortSignal } = {},
) {
  const loadingTask = getDocument({ data: bytes.slice() });
  const pdf = await loadingTask.promise;
  const pagesToSample = Math.min(pdf.numPages, maxPages);
  const chunks: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pagesToSample; pageNumber += 1) {
      throwIfAborted(options.signal);
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? (item as TextItem).str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) {
        chunks.push(text);
      }
    }
  } finally {
    await pdf.destroy();
  }

  return {
    text: chunks.join("\n\n"),
    pagesSampled: pagesToSample,
  };
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new DOMException("Operation cancelled.", "AbortError");
  }
}
