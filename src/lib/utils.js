export function cubicBezier(p0, p1, p2, p3) {
  return (t) =>
    p0 * (1 - t) ** 3 +
    3 * p1 * t * (1 - t) ** 2 +
    3 * p2 * t ** 2 * (1 - t) +
    p3 * t ** 3;
}
