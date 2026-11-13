import { Vector3 } from 'three'

export const DEG = Math.PI / 180

/** Position on a sphere for a latitude/longitude, matching three's SphereGeometry UVs. */
export function latLonToVector3(lat: number, lon: number, radius = 1, target = new Vector3()) {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

/** Wraps a longitude difference to [-180, 180] so tweens take the short way round. */
export function shortestLonDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180
}
