import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GlobeController } from './globe/GlobeController'
import GlobeControls from './globe/GlobeControls'

const GlobeScene = lazy(() => import('./globe/GlobeScene'))

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export default function App() {
  const controller = useMemo(() => new GlobeController(), [])
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState(false)
  const hintTimer = useRef(0)
  const onReady = useCallback(() => setReady(true), [])

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

  return (
    <main>
      <section className="globe-stage" aria-label="Interactive globe">
        <div className="globe-stage__canvas" data-ready={ready}>
          <Suspense fallback={null}>
            <GlobeScene controller={controller} onReady={onReady} />
          </Suspense>
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
      </section>
    </main>
  )
}
