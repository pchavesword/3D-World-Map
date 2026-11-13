import logo from '../assets/sword-logo.svg'

export default function Header() {
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
        </ul>
      </nav>
    </header>
  )
}
