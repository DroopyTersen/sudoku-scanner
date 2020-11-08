import { useRef, useEffect } from "preact/hooks";
import { drawBoundingBox, drawGrid, drawImage } from "../utils/canvas";
const MIN_BOXES = 20;

export default function useCanvasOverlay(
  video,
  processor,
  { interval = 100, mode }
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasGrid =
    processor && processor.boxes && processor.boxes.length > MIN_BOXES;
  if (processor && processor.boxes) {
    console.log("BOXES", processor.boxes.length);
  }
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const canvas = canvasRef.current;
      if (canvas && video.isPlaying) {
        const context = canvas.getContext("2d");
        if (context) {
          drawImage(context, processor, mode);
          if (processor && processor.corners) {
            drawBoundingBox(context, processor.corners);
          }
          if (hasGrid && processor.gridLines) {
            drawGrid(context, processor.gridLines);
          }
          //   if (processor.solvedPuzzle) {
          //     context.fillStyle = "rgba(0,200,0,1)";
          //     for (let y = 0; y < 9; y++) {
          //       for (let x = 0; x < 9; x++) {
          //         if (processor.solvedPuzzle[y][x]) {
          //           const {
          //             digit,
          //             digitHeight,
          //             digitRotation,
          //             position,
          //             isKnown,
          //           } = processor.solvedPuzzle[y][x];
          //           if (!isKnown) {
          //             context.font = `bold ${digitHeight}px sans-serif`;
          //             context.translate(position.x, position.y);
          //             context.rotate(Math.PI - digitRotation);
          //             context.fillText(
          //               digit.toString(),
          //               -digitHeight / 4,
          //               digitHeight / 3
          //             );
          //             context.setTransform();
          //           }
          //         }
          //       }
          //     }
          //   }
        }
      }
    }, interval);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [canvasRef, video.isPlaying, processor]);

  return {
    hasGrid,
    props: {
      ref: canvasRef,
      width: video.width,
      height: video.height,
    },
  };
}
