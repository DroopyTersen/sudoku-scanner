import { h, Fragment } from "preact";
import { useRef, useEffect } from "preact/hooks";
import useCameraVideoStream from "./useCameraVideoStream";
import useCanvasOverlay from "./useCanvasOverlay";

export default function Scanner() {
  const video = useCameraVideoStream();
  const canvas = useCanvasOverlay(video, { interval: 75 });
  return (
    <div className="scanner">
      <h2>Scanner</h2>
      {/* need to have a visible video for mobile safari to work */}
      <canvas {...canvas.props} className="preview-canvas" />
      <video
        {...video.props}
        playsInline
        muted
        width={5}
        height={5}
        className="video-stream"
      />
    </div>
  );
}
