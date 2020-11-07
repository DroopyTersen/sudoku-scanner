import { Point, ConnectedRegion } from "./getLargestConnectedComponent";

/**
 * Finds the nearest point to another point using manhattan distance
 * @param points Array of points
 * @param x x coordinate of point
 * @param y y coordinate of point
 */
function getNearestPoint(points: Point[], x: number, y: number) {
  let closestPoint = points[0];
  let minDistance = Number.MAX_SAFE_INTEGER;
  points.forEach((point) => {
    const dx = Math.abs(point.x - x);
    const dy = Math.abs(point.y - y);
    const distance = dx + dy;
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  });
  return closestPoint;
}

export type CornerPoints = {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
};

/**
 * Locate the corner points of a connected region
 * @param region A connected region
 */
export default function getCornerPoints(region: ConnectedRegion): CornerPoints {
  // get the extents
  const { x: minX, y: minY } = region.bounds.topLeft;
  const { x: maxX, y: maxY } = region.bounds.bottomRight;
  const { points } = region;
  // find the points closest to the topleft, topright, bottomleft, and bottomright
  return {
    topLeft: getNearestPoint(points, minX, minY),
    topRight: getNearestPoint(points, maxX, minY),
    bottomLeft: getNearestPoint(points, minX, maxY),
    bottomRight: getNearestPoint(points, maxX, maxY),
  };
}

export function sanityCheckCorners({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}) {
  function length(p1: Point, p2: Point) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  const topLineLength = length(topLeft, topRight);
  const leftLineLength = length(topLeft, bottomLeft);
  const rightLineLength = length(topRight, bottomRight);
  const bottomLineLength = length(bottomLeft, bottomRight);
  if (
    topLineLength < 0.5 * bottomLineLength ||
    topLineLength > 1.5 * bottomLineLength
  )
    return false;
  if (
    leftLineLength < 0.7 * rightLineLength ||
    leftLineLength > 1.3 * rightLineLength
  )
    return false;
  if (
    leftLineLength < 0.5 * bottomLineLength ||
    leftLineLength > 1.5 * bottomLineLength
  )
    return false;
  return true;
}
