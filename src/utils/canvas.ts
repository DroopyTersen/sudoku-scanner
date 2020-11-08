export const drawBoundingBox = (context: CanvasRenderingContext2D, corners) => {
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

export const drawGrid = (context: CanvasRenderingContext2D, gridLines) => {
  context.strokeStyle = "rgba(200,0,0,0.4)";
  context.lineWidth = 2;
  gridLines.forEach((line) => {
    context.moveTo(line.p1.x, line.p1.y);
    context.lineTo(line.p2.x, line.p2.y);
  });
  context.stroke();
};

export const drawImage = (
  context: CanvasRenderingContext2D,
  processor,
  mode: CanvasMode = "original"
) => {
  if (processor && processor[mode]) {
    context.putImageData(processor[mode], 0, 0);
  }
};

export type CanvasMode = "original" | "greyscale" | "thresholded";
