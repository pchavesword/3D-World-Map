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
