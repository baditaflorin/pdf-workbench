import { useEffect, useRef, useState } from "react";

type Props = {
  onChange: (dataUrl: string | undefined) => void;
};

export function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = "#172033";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = event.currentTarget.getContext("2d");
    const position = pointerPosition(event);

    if (!context) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(position.x, position.y);
    setDrawing(true);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) {
      return;
    }

    const context = event.currentTarget.getContext("2d");
    const position = pointerPosition(event);

    if (!context) {
      return;
    }

    context.lineTo(position.x, position.y);
    context.stroke();
  }

  function end(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) {
      return;
    }

    setDrawing(false);
    onChange(event.currentTarget.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    onChange(undefined);
  }

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        width={560}
        height={180}
        aria-label="Draw signature"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      <button type="button" className="ghost-button" onClick={clear}>
        Clear drawing
      </button>
    </div>
  );
}
