import { useEffect, useRef } from 'react'
import type { Testimonial } from '../data/testimonials'
import AudioPlayer from './AudioPlayer'
import './card.css'

type Props = {
  testimonial: Testimonial
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

const FOCUSABLE = 'button, [href], input, [tabindex]:not([tabindex="-1"])'

export default function TestimonialCard({ testimonial: t, index, total, onClose, onPrev, onNext }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  // Move focus into the dialog on open, and hand it back on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeBtn.current?.focus({ preventScroll: true })
    return () => previous?.focus?.({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !root.current) return
      const items = [...root.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!root.current.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    // A click (not a drag) anywhere outside the card closes it.
    let down: { x: number; y: number } | null = null
    const outside = (e: PointerEvent) => {
      const target = e.target as Element | null
      return !!target && !root.current?.contains(target) && !target.closest('[data-keep-card]')
    }
    const onDown = (e: PointerEvent) => {
      down = outside(e) ? { x: e.clientX, y: e.clientY } : null
    }
    const onUp = (e: PointerEvent) => {
      if (down && outside(e) && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) onClose()
      down = null
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
    }
  }, [onClose])

  const count = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`

  return (
    <div className="card" ref={root} role="dialog" aria-modal="true" aria-labelledby="card-name">
      <header className="card__head">
        <span className="label">
          {t.placeholder ? 'Placeholder story' : 'Member story'} <span className="card__count">{count}</span>
        </span>
        <button type="button" className="card__icon" ref={closeBtn} onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
          </svg>
        </button>
      </header>

      {/* Keyed so content fades and the audio element resets between stories. */}
      <div className="card__body" key={t.id} data-lenis-prevent>
        <img
          className="card__photo"
          src={t.photo}
          alt={t.placeholder ? '' : `Portrait of ${t.name}`}
          width={800}
          height={1000}
        />
        <div className="card__text">
          <h2 className="card__name" id="card-name">
            {t.name}
          </h2>
          <p className="card__city label">
            {t.city}, {t.country}
          </p>
          <p className="card__bio">{t.bio}</p>
          <blockquote className="card__quote">“{t.quote}”</blockquote>
          <AudioPlayer src={t.audio} label={`Audio testimonial from ${t.name}`} />
        </div>
      </div>

      <footer className="card__foot">
        <button type="button" className="card__nav label" onClick={onPrev} aria-label="Previous story">
          <svg viewBox="0 0 16 12" aria-hidden="true">
            <path d="M15 6H1M6 1L1 6l5 5" />
          </svg>
          Prev
        </button>
        <button type="button" className="card__nav label" onClick={onNext} aria-label="Next story">
          Next
          <svg viewBox="0 0 16 12" aria-hidden="true">
            <path d="M1 6h14M10 1l5 5-5 5" />
          </svg>
        </button>
      </footer>
    </div>
  )
}
