import logo from '../assets/sword-logo.svg'

// Explore links scroll within the page. Company and Connect links are
// placeholders (#) until real destinations are supplied.
const link = (label: string, href = '#') => ({ label, href })
const COLUMNS = [
  {
    title: 'Explore',
    links: [link('Member stories', '#top'), link('About the project', '#about'), link('About Sword Health', '#sword')],
  },
  { title: 'Company', links: [link('Careers'), link('Newsroom'), link('Privacy'), link('Terms')] },
  { title: 'Connect', links: [link('Contact'), link('LinkedIn'), link('Instagram')] },
]

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer__top">
        <p className="site-footer__statement" data-reveal>
          Every story starts with <em>one small movement</em>.
          <br />
          Come <em>move</em> with us.
        </p>
        <div className="site-footer__cols">
          {COLUMNS.map((col, i) => (
            <nav
              key={col.title}
              aria-label={col.title}
              data-reveal
              style={{ '--d': `${i * 90}ms` } as React.CSSProperties}
            >
              <h2 className="label">{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <img className="site-footer__mark" src={logo} alt="Sword" width={228} height={56} />
      <p className="site-footer__legal label">© {YEAR} Sword Health. All rights reserved.</p>
    </footer>
  )
}
