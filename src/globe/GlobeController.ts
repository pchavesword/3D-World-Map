import gsap from 'gsap'
import { shortestLonDelta } from './angles'

export type GlobeView = { lon: number; lat: number; zoom: number }

export const DEFAULT_VIEW: GlobeView = { lon: -98, lat: 30, zoom: 1 }
export const US_VIEW: GlobeView = { lon: -97, lat: 38.5, zoom: 2.1 }

export const ZOOM_MIN = 0.8
export const ZOOM_MAX = 2.8
const LAT_LIMIT = 70
const AUTO_SPEED = 3.5 // degrees of longitude per second

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Plain mutable state for the globe's orientation and zoom. The scene reads it
 * every frame; UI and pointer handlers write to it. Kept outside React so
 * dragging never triggers renders.
 */
export class GlobeController {
  /** Centre of the view: the lat/lon facing the camera, and a zoom multiplier. */
  view: GlobeView = { ...DEFAULT_VIEW }
  zoomTarget = DEFAULT_VIEW.zoom
  /** Inertia, degrees per second. */
  velLon = 0
  velLat = 0
  dragging = false
  /** Reasons to hold auto-rotation (open card, keyboard focus on a marker). */
  private holds = new Set<string>()
  private autoBlend = 0
  private tween: gsap.core.Tween | null = null

  hold(reason: string, on: boolean) {
    if (on) this.holds.add(reason)
    else this.holds.delete(reason)
  }

  private killTween() {
    this.tween?.kill()
    this.tween = null
  }

  startDrag() {
    this.killTween()
    this.dragging = true
    this.velLon = 0
    this.velLat = 0
  }

  dragBy(dLon: number, dLat: number, dt: number) {
    this.view.lon += dLon
    this.view.lat = clamp(this.view.lat + dLat, -LAT_LIMIT, LAT_LIMIT)
    if (dt > 0) {
      // Smoothed velocity, so the release speed is not one noisy sample.
      const k = 0.35
      this.velLon += (dLon / dt - this.velLon) * k
      this.velLat += (dLat / dt - this.velLat) * k
    }
  }

  endDrag(msSinceLastMove: number) {
    this.dragging = false
    if (msSinceLastMove > 80 || prefersReducedMotion()) {
      this.velLon = 0
      this.velLat = 0
    }
  }

  zoomBy(factor: number) {
    this.killTween()
    this.zoomTarget = clamp(this.zoomTarget * factor, ZOOM_MIN, ZOOM_MAX)
  }

  flyTo(target: Partial<GlobeView>, duration = 1.8, onArrive?: () => void) {
    this.killTween()
    this.velLon = 0
    this.velLat = 0
    const to = {
      lon: this.view.lon + shortestLonDelta(this.view.lon, target.lon ?? this.view.lon),
      lat: clamp(target.lat ?? this.view.lat, -LAT_LIMIT, LAT_LIMIT),
      zoom: clamp(target.zoom ?? this.zoomTarget, ZOOM_MIN, ZOOM_MAX),
    }
    this.zoomTarget = to.zoom
    if (prefersReducedMotion()) {
      Object.assign(this.view, to)
      onArrive?.()
      return
    }
    this.tween = gsap.to(this.view, {
      ...to,
      duration,
      ease: 'power3.inOut',
      onComplete: () => {
        this.tween = null
        onArrive?.()
      },
    })
  }

  /** Advance inertia, zoom easing and auto-rotation. Called once per frame. */
  update(dt: number) {
    const v = this.view
    if (!this.dragging && !this.tween) {
      if (Math.abs(this.velLon) + Math.abs(this.velLat) > 0.05) {
        v.lon += this.velLon * dt
        v.lat = clamp(v.lat + this.velLat * dt, -LAT_LIMIT, LAT_LIMIT)
        const decay = Math.exp(-dt * 2.6)
        this.velLon *= decay
        this.velLat *= decay
      }
      v.zoom += (this.zoomTarget - v.zoom) * (1 - Math.exp(-dt * 7))
    }

    const idle =
      !this.dragging &&
      !this.tween &&
      this.holds.size === 0 &&
      Math.abs(this.velLon) + Math.abs(this.velLat) <= 0.05 &&
      !prefersReducedMotion()
    // Ease auto-rotation in and out rather than snapping.
    this.autoBlend += ((idle ? 1 : 0) - this.autoBlend) * (1 - Math.exp(-dt * (idle ? 1.2 : 8)))
    if (this.autoBlend > 0.001) v.lon -= AUTO_SPEED * this.autoBlend * dt
  }
}
