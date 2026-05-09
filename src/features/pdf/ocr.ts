import { renderPdfPageToBlob } from "./pdfRenderer";

export async function runOcrOnPage(
  bytes: Uint8Array,
  pageIndex: number,
  onProgress?: (message: string) => void,
  signal?: AbortSignal,
) {
  throwIfAborted(signal);
  const image = await renderPdfPageToBlob(bytes, pageIndex, 2);
  throwIfAborted(signal);
  const { createWorker } = await import("tesseract.js");
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  const cancelWorker = () => {
    void worker?.terminate();
  };

  signal?.addEventListener("abort", cancelWorker, { once: true });
  worker = await createWorker("eng", 1, {
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
    throwIfAborted(signal);
    const result = await worker.recognize(image);
    throwIfAborted(signal);
    return {
      text: result.data.text.trim(),
      confidence: Math.round(result.data.confidence ?? 0),
    };
  } finally {
    signal?.removeEventListener("abort", cancelWorker);
    await worker.terminate();
  }
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new DOMException("Operation cancelled.", "AbortError");
  }
}
