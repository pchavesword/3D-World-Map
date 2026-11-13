import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TestimonialCard from './components/TestimonialCard'
import { testimonials } from './data/testimonials'
import { GlobeController } from './globe/GlobeController'
import GlobeControls from './globe/GlobeControls'
import Markers from './globe/Markers'

const GlobeScene = lazy(() => import('./globe/GlobeScene'))

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const controller = useMemo(() => new GlobeController(), [])
  const webgl = useMemo(() => hasWebGL(), [])
  const markerEls = useRef(new Map<string, HTMLElement>())
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState(false)
  const hintTimer = useRef(0)
  const onReady = useCallback(() => setReady(true), [])

  /** Index of the selected story; the card opens once the globe has turned to it. */
  const [active, setActive] = useState<number | null>(null)
  const [cardOpen, setCardOpen] = useState(false)

  const select = useCallback(
    (index: number) => {
      const t = testimonials[index]
      setActive(index)
      controller.hold('card', true)
      controller.flyTo({ lat: t.lat, lon: t.lon, zoom: Math.max(controller.zoomTarget, 1.5) }, 1.4, () =>
        setCardOpen(true),
      )
    },
    [controller],
  )

  const close = useCallback(() => {
    setCardOpen(false)
    setActive(null)
    controller.hold('card', false)
  }, [controller])

  const step = useCallback(
    (dir: number) => {
      if (active === null) return
      select((active + dir + testimonials.length) % testimonials.length)
    },
    [active, select],
  )
  const prev = useCallback(() => step(-1), [step])
  const next = useCallback(() => step(1), [step])

  // Plain scrolling over the globe scrolls the page; tell people how to zoom.
  useEffect(() => {
    const show = () => {
      setHint(true)
      window.clearTimeout(hintTimer.current)
      hintTimer.current = window.setTimeout(() => setHint(false), 1800)
    }
    window.addEventListener('globe:zoomhint', show)
    return () => {
      window.removeEventListener('globe:zoomhint', show)
      window.clearTimeout(hintTimer.current)
    }
  }, [])

  const current = active !== null ? testimonials[active] : null

  return (
    <main>
      <section className="globe-stage" aria-label="Member stories on an interactive globe" data-card={cardOpen}>
        {webgl ? (
          <>
            <div className="globe-stage__view">
              <div className="globe-stage__canvas" data-ready={ready}>
                <Suspense fallback={null}>
                  <GlobeScene controller={controller} onReady={onReady} markers={testimonials} markerEls={markerEls} />
                </Suspense>
              </div>
              <Markers
                testimonials={testimonials}
                activeId={current?.id ?? null}
                controller={controller}
                els={markerEls}
                onSelect={select}
                ready={ready}
              />
            </div>
            <div className="globe-loading label" data-ready={ready} aria-hidden={ready}>
              <span role="status">
                Loading globe
                <span className="globe-loading__bar" />
              </span>
            </div>
            <p className="globe-hint label" data-visible={hint} aria-hidden="true">
              Hold {isMac ? '⌘' : 'Ctrl'} and scroll to zoom
            </p>
            <GlobeControls controller={controller} />
          </>
        ) : (
          <div className="story-list" data-keep-card>
            <p className="story-list__intro">
              The interactive globe needs WebGL, which is not available in this browser. Every story is listed here
              instead.
            </p>
            <ul>
              {testimonials.map((t, i) => (
                <li key={t.id}>
                  <button type="button" onClick={() => select(i)}>
                    <span>{t.city}</span>
                    <span className="label">{t.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {cardOpen && current && active !== null && (
        <TestimonialCard
          testimonial={current}
          index={active}
          total={testimonials.length}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </main>
  )
}
