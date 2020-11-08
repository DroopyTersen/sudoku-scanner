import { h, Fragment } from "preact";
import { useRef, useEffect, useCallback, useState } from "preact/hooks";
import { CanvasMode } from "../utils/canvas";
import useCameraVideoStream from "./useCameraVideoStream";
import useCanvasOverlay from "./useCanvasOverlay";
import useStreamScanner from "./useStreamScanner";

export default function Scanner({ onSuccess, onCancel, mode }) {
  const video = useCameraVideoStream();
  const processor = useStreamScanner(video);
  const canvas = useCanvasOverlay(video, processor, {
    interval: 100,
    mode,
  });

  const lockImage = () => {
    video.stop();
    onSuccess(processor);
  };

  return (
    <div className="scanner">
      {/* need to have a visible video for mobile safari to work */}
      <div
        style={{
          position: "relative",
          width: `${video.width}px`,
          height: `${video.height}px`,
        }}
      >
        <canvas {...canvas.props} className="preview-canvas" />
        {canvas.hasGrid && (
          <div className="canvas-overlay" onClick={lockImage}>
            <div>Tap to Solve!</div>
          </div>
        )}
      </div>
      <div>
        <button type="button" onClick={onCancel}>
          Back
        </button>
      </div>
      <div>
        <video {...video.props} playsInline muted width={100} height={100} />
      </div>
    </div>
  );
}
