export function isNearFinaleTarget(
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  pieceWidth: number,
): boolean {
  const snapDistance = Math.min(pieceWidth * 0.52, 62);
  return Math.hypot(x - targetX, y - targetY) <= snapDistance;
}
