import { useRef, useEffect } from "preact/hooks";
const MIN_BOXES = 20;

const drawBoundingBox = (context: CanvasRenderingContext2D, corners) => {
  const { topLeft, topRight, bottomLeft, bottomRight } = corners;
  context.strokeStyle = "rgba(200,0,0,0.5)";
  context.fillStyle = "rgba(0,0,0,0.2)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(topLeft.x, topLeft.y);
  context.lineTo(topRight.x, topRight.y);
  context.lineTo(bottomRight.x, bottomRight.y);
  context.lineTo(bottomLeft.x, bottomLeft.y);
  context.closePath();
  context.stroke();
  context.fill();
};

const drawGrid = (context: CanvasRenderingContext2D, gridLines) => {
  context.strokeStyle = "rgba(200,0,0,0.4)";
  context.lineWidth = 2;
  gridLines.forEach((line) => {
    context.moveTo(line.p1.x, line.p1.y);
    context.lineTo(line.p2.x, line.p2.y);
  });
  context.stroke();
};
export default function useCanvasOverlay(video, processor, { interval = 100 }) {
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
          context.drawImage(video.ref.current, 0, 0);
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
