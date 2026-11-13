import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import type { GlobeController } from './GlobeController'

const HIT_RADIUS = 1.04
const sphere = new THREE.Sphere(new THREE.Vector3(), HIT_RADIUS)
const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()
const hit = new THREE.Vector3()

/**
 * Drag-to-rotate, pinch and Ctrl/⌘+wheel zoom. Gestures only engage when they
 * start on the globe itself, so the rest of the hero scrolls the page normally.
 */
export function useGlobePointer(controller: GlobeController) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    const el = gl.domElement
    const pointers = new Map<number, { x: number; y: number }>()
    let lastMove = 0
    let pinchDist = 0

    const overGlobe = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect()
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      return raycaster.ray.intersectSphere(sphere, hit) !== null
    }

    /** Degrees of globe rotation per CSS pixel, so the surface tracks the pointer. */
    const degPerPx = () => {
      const cam = camera as THREE.PerspectiveCamera
      const gap = cam.position.z - 1
      const worldPerPx = (2 * gap * Math.tan((cam.fov * Math.PI) / 360)) / el.clientHeight
      return (worldPerPx * 180) / Math.PI
    }

    const spread = () => {
      const [a, b] = [...pointers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (pointers.size === 0 && !overGlobe(e.clientX, e.clientY)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      el.setPointerCapture(e.pointerId)
      if (pointers.size === 1) {
        controller.startDrag()
        lastMove = performance.now()
        el.style.cursor = 'grabbing'
      } else if (pointers.size === 2) {
        pinchDist = spread()
      }
    }

    const onMove = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId)
      if (!p) {
        if (e.pointerType === 'mouse') el.style.cursor = overGlobe(e.clientX, e.clientY) ? 'grab' : ''
        return
      }
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      p.x = e.clientX
      p.y = e.clientY
      const now = performance.now()
      if (pointers.size === 1) {
        const k = degPerPx()
        controller.dragBy(-dx * k, dy * k, (now - lastMove) / 1000)
      } else if (pointers.size === 2) {
        const d = spread()
        if (pinchDist > 0) controller.zoomBy(d / pinchDist)
        pinchDist = d
      }
      lastMove = now
    }

    const onUp = (e: PointerEvent) => {
      if (!pointers.delete(e.pointerId)) return
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      if (pointers.size === 0) {
        controller.endDrag(performance.now() - lastMove)
        el.style.cursor = e.pointerType === 'mouse' && overGlobe(e.clientX, e.clientY) ? 'grab' : ''
      } else {
        // Back to one finger: carry on dragging without a jump.
        controller.startDrag()
        lastMove = performance.now()
      }
    }

    // Claim touches that start on the globe; everything else scrolls the page.
    const onTouchStart = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      if (pointers.size > 0 || overGlobe(t.clientX, t.clientY)) e.preventDefault()
    }
    const onTouchMove = (e: TouchEvent) => {
      if (pointers.size > 0) e.preventDefault()
    }

    const onWheel = (e: WheelEvent) => {
      if (!overGlobe(e.clientX, e.clientY)) return
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
        controller.zoomBy(Math.exp(-delta * 0.01))
      } else {
        el.dispatchEvent(new CustomEvent('globe:zoomhint', { bubbles: true }))
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl, camera, controller])
}
