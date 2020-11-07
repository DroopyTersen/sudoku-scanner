import adaptiveThreshold from "./adaptiveThreshold";
import extractSquareFromRegion from "./applyHomographicTransform";
import extractBoxes from "./extractBoxes";
import findHomographicTransform, {
  Transform,
  transformPoint,
} from "./findHomographicTransform";
import getCornerPoints, { sanityCheckCorners } from "./getCornerPoints";
import getLargestConnectedComponent from "./getLargestConnectedComponent";
import Image from "./Image";
// size of image to use for processing
const PROCESSING_SIZE = 900;

onmessage = async function (e) {
  let { imageData, width, height } = e.data;
  let image = getImage(imageData, width, height);
  let corners = null;
  let gridLines = null;
  let boxes = null;
  const thresholded = adaptiveThreshold(image.clone(), 20, 20);
  const largestConnectedComponent = getLargestConnectedComponent(thresholded, {
    minAspectRatio: 0.5,
    maxAspectRatio: 1.5,
    minSize: Math.min(width, height) * 0.3,
    maxSize: Math.min(width, height) * 0.9,
  });
  if (largestConnectedComponent) {
    corners = getCornerPoints(largestConnectedComponent);

    if (sanityCheckCorners(corners)) {
      const transform = findHomographicTransform(PROCESSING_SIZE, corners);
      gridLines = createGridLines(transform);

      // extract the square puzzle from the original grey image
      const extractedImageGreyScale = extractSquareFromRegion(
        image,
        PROCESSING_SIZE,
        transform
      );
      // extract the square puzzle from the thresholded image - we'll use the thresholded image for determining where the digits are in the cells
      const extractedImageThresholded = extractSquareFromRegion(
        thresholded,
        PROCESSING_SIZE,
        transform
      );

      boxes = extractBoxes(extractedImageGreyScale, extractedImageThresholded);
    }
  }
  self.postMessage({ width, height, corners, gridLines, boxes });
};

const getImage = (imageData, width, height) => {
  // convert to greyscale
  const bytes = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const g = imageData.data[(row + x) * 4 + 1];
      bytes[row + x] = g;
    }
  }

  return new Image(bytes, width, height);
};

function createGridLines(transform: Transform) {
  const boxSize = PROCESSING_SIZE / 9;
  const gridLines = [];
  for (let l = 1; l < 9; l++) {
    // horizonal line
    gridLines.push({
      p1: transformPoint({ x: 0, y: l * boxSize }, transform),
      p2: transformPoint({ x: PROCESSING_SIZE, y: l * boxSize }, transform),
    });
    // vertical line
    gridLines.push({
      p1: transformPoint({ y: 0, x: l * boxSize }, transform),
      p2: transformPoint({ y: PROCESSING_SIZE, x: l * boxSize }, transform),
    });
  }
  return gridLines;
}
