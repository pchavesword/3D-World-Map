import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const initial = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

/** Light/dark theme. index.html sets the starting value before first paint. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', next)
      } catch {
        // Private mode: the choice just lasts for this visit.
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
