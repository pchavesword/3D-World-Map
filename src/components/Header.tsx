import logo from '../assets/sword-logo.svg'
import type { Theme } from '../useTheme'

export default function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const dark = theme === 'dark'
  return (
    <header className="site-header">
      <a href="#top" className="site-header__logo" aria-label="Sword Health, back to top">
        <img src={logo} alt="" width={228} height={56} />
      </a>
      <nav aria-label="Primary">
        <ul className="site-header__nav label">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
          <li>
            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                {dark ? (
                  <>
                    <circle cx="8" cy="8" r="3" />
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M3.05 12.95l1.4-1.4M11.55 4.45l1.4-1.4" />
                  </>
                ) : (
                  <path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1Z" />
                )}
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
