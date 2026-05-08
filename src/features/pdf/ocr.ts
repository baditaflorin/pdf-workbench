import { renderPdfPageToBlob } from "./pdfRenderer";

export async function runOcrOnPage(
  bytes: Uint8Array,
  pageIndex: number,
  onProgress?: (message: string) => void,
) {
  const image = await renderPdfPageToBlob(bytes, pageIndex, 2);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (event) => {
      if (event.status) {
        const progress =
          typeof event.progress === "number"
            ? ` ${Math.round(event.progress * 100)}%`
            : "";
        onProgress?.(`${event.status}${progress}`);
      }
    },
  });

  try {
    const result = await worker.recognize(image);
    return {
      text: result.data.text.trim(),
      confidence: Math.round(result.data.confidence ?? 0),
    };
  } finally {
    await worker.terminate();
  }
}
