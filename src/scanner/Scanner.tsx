import { h, Fragment } from "preact";
import { useRef, useEffect } from "preact/hooks";
import useCameraVideoStream from "./useCameraVideoStream";
import useCanvasOverlay from "./useCanvasOverlay";
import useStreamScanner from "./useStreamScanner";

export default function Scanner() {
  const video = useCameraVideoStream();
  const processor = useStreamScanner(video);
  const canvas = useCanvasOverlay(video, processor, { interval: 100 });
  useEffect(() => {
    // if (canvas.hasGrid && video.isPlaying) {
    //   setTimeout(() => {
    //     video.stop();
    //   }, 10);
    // }
  }, [canvas.hasGrid, video.isPlaying]);
  return (
    <div className="scanner">
      <h2>Scanner</h2>
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
          <div className="canvas-overlay" onClick={() => video.stop()}>
            <div>Tap to Solve!</div>
          </div>
        )}
      </div>
      <div>
        <video {...video.props} playsInline muted width={100} height={100} />
      </div>
    </div>
  );
}
