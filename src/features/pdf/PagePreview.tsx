import { useEffect, useRef, useState } from "react";
import { errorMessage } from "../../lib/errors";

type Props = {
  bytes: Uint8Array;
  pageIndex: number;
  refreshKey: string;
};

export function PagePreview({ bytes, pageIndex, refreshKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!canvasRef.current) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { renderPdfPage } = await import("./pdfRenderer");
        if (!cancelled && canvasRef.current) {
          await renderPdfPage(bytes, pageIndex, canvasRef.current, 1.2);
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [bytes, pageIndex, refreshKey]);

  return (
    <div className="preview-frame">
      {loading ? <p className="preview-status">Rendering page...</p> : null}
      {error ? <p className="preview-error">{error}</p> : null}
      <canvas ref={canvasRef} aria-label="Selected PDF page preview" />
    </div>
  );
}
