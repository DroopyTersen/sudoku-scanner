import { useRef, useEffect } from "preact/hooks";
export default function useCanvasOverlay(video, { interval = 100 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // render the overlay
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const canvas = canvasRef.current;
      if (canvas && video.isPlaying) {
        // // update the peformance stats
        // setImageCaptureTime(processor.captureTime);
        // setThresholdTime(processor.thresholdTime);
        // setConnectedComponentTime(processor.connectedComponentTime);
        // setGetCornerPOintsTime(processor.cornerPointTime);
        // setExtractImageTime(processor.extractPuzzleTime);
        // setExtractBoxesTime(processor.extractBoxesTime);
        // setOcrTime(processor.neuralNetTime);
        // setSolveTime(processor.solveTime);
        // display the output from the processor
        const context = canvas.getContext("2d");
        if (context) {
          console.log("drawing");
          context.drawImage(video.ref.current, 0, 0);
          //   if (processor.corners) {
          //     const {
          //       topLeft,
          //       topRight,
          //       bottomLeft,
          //       bottomRight,
          //     } = processor.corners;
          //     context.strokeStyle = "rgba(0,200,0,0.5)";
          //     context.fillStyle = "rgba(0,0,0,0.3)";
          //     context.lineWidth = 3;
          //     context.beginPath();
          //     context.moveTo(topLeft.x, topLeft.y);
          //     context.lineTo(topRight.x, topRight.y);
          //     context.lineTo(bottomRight.x, bottomRight.y);
          //     context.lineTo(bottomLeft.x, bottomLeft.y);
          //     context.closePath();
          //     context.stroke();
          //     context.fill();
          //   }
          //   if (processor.gridLines) {
          //     context.strokeStyle = "rgba(0,200,0,0.5)";
          //     context.lineWidth = 2;
          //     processor.gridLines.forEach((line) => {
          //       context.moveTo(line.p1.x, line.p1.y);
          //       context.lineTo(line.p2.x, line.p2.y);
          //     });
          //     context.stroke();
          //   }
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
  }, [canvasRef, video.isPlaying]);

  return {
    props: {
      ref: canvasRef,
      width: video.width,
      height: video.height,
    },
  };
}
