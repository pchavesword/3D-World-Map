/** Wraps a longitude difference to [-180, 180] so tweens take the short way round. */
export function shortestLonDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180
}
