import { h, Fragment } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { drawBoundingBox, drawGrid, drawImage } from "../utils/canvas";

function useRecognition({ scanData, mode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      drawImage(context, scanData, mode);
      drawBoundingBox(context, scanData.corners);
      drawGrid(context, scanData.gridLines);
    }
  }, [scanData, mode]);
  return {
    canvasProps: {
      ref: canvasRef,
    },
  };
}

export default function Recognition({ scanData, mode }) {
  let recognition = useRecognition({ scanData, mode });
  return (
    <div style={{ position: "relative" }}>
      <canvas
        {...recognition.canvasProps}
        className="preview-canvas"
        width={scanData.width}
        height={scanData.height}
      />
    </div>
  );
}
