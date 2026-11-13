import type { Testimonial } from '../data/testimonials'
import type { GlobeController } from './GlobeController'
import type { MarkerElements } from './GlobeScene'

type Props = {
  testimonials: Testimonial[]
  activeId: string | null
  controller: GlobeController
  els: MarkerElements
  onSelect: (index: number) => void
  ready: boolean
}

/**
 * City markers as real buttons layered over the canvas, positioned every frame
 * by the scene. Being DOM, they keep a constant size on screen (so dense areas
 * separate as you zoom) and are reachable by keyboard.
 */
export default function Markers({ testimonials, activeId, controller, els, onSelect, ready }: Props) {
  return (
    <div className="markers" data-keep-card data-ready={ready}>
      {testimonials.map((t, i) => (
        <button
          key={t.id}
          type="button"
          className="marker"
          data-active={t.id === activeId}
          data-hidden="true"
          aria-label={`${t.city}, ${t.country}: open story`}
          ref={(el) => {
            if (el) els.current.set(t.id, el)
            else els.current.delete(t.id)
          }}
          onClick={() => onSelect(i)}
          onPointerEnter={() => controller.hold('hover', true)}
          onPointerLeave={() => controller.hold('hover', false)}
          onFocus={(e) => {
            // Keyboard users may tab to a city on the far side: bring it round.
            if (e.currentTarget.matches(':focus-visible')) {
              controller.hold('focus', true)
              controller.flyTo({ lat: t.lat, lon: t.lon }, 1.2)
            }
          }}
          onBlur={() => controller.hold('focus', false)}
        >
          <span className="marker__ring" />
          <span className="marker__dot" />
          <span className="marker__tip label">{t.city}</span>
        </button>
      ))}
    </div>
  )
}
