import Lenis from 'lenis'
import { useEffect } from 'react'
import { prefersReducedMotion } from './globe/GlobeController'

/** Smooth scroll, in-page anchor links and scroll-triggered reveals. */
export function usePage() {
  useEffect(() => {
    const reduced = prefersReducedMotion()

    // Reveal elements as they enter the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          ;(e.target as HTMLElement).dataset.in = 'true'
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      // Hero copy reveals on load, wherever it sits in the viewport.
      if (el.closest('.hero-copy')) requestAnimationFrame(() => (el.dataset.in = 'true'))
      else io.observe(el)
    })

    let lenis: Lenis | null = null
    let raf = 0
    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.09,
        // Leave Ctrl/⌘ + wheel alone: over the globe it zooms.
        virtualScroll: ({ event }) => !(event instanceof WheelEvent && (event.ctrlKey || event.metaKey)),
      })
      const loop = (t: number) => {
        lenis!.raf(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link) return
      const id = link.getAttribute('href')!.slice(1)
      e.preventDefault()
      if (!id) return // placeholder link
      const target = id === 'top' ? document.body : document.getElementById(id)
      if (!target) return
      if (lenis) lenis.scrollTo(id === 'top' ? 0 : target, { duration: 1.6 })
      else window.scrollTo({ top: id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY })
    }
    document.addEventListener('click', onClick)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      lenis?.destroy()
      document.removeEventListener('click', onClick)
    }
  }, [])
}
