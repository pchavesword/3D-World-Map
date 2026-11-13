// Copy note: the Sword Health section is deliberately qualitative. Every
// statement marked VERIFY below should be checked against approved company
// messaging before launch.

const POINTS = [
  {
    // VERIFY: programmes are completed at home / remotely.
    title: 'Care at home',
    body: 'Programmes are designed to be followed from home, on a schedule that fits around work and family.',
  },
  {
    // VERIFY: each member is paired with a licensed clinician.
    title: 'Led by clinicians',
    body: 'Each member works with a licensed clinician who sets the plan and adjusts it as they progress.',
  },
  {
    // VERIFY: technology gives real-time feedback on movement.
    title: 'Guided by technology',
    body: 'Sword’s technology gives feedback on movement during each session, so exercises are done with confidence.',
  },
  {
    // VERIFY: offered through employers and health plans.
    title: 'Offered as a benefit',
    body: 'Sword is typically made available to people through their employer or health plan.',
  },
]

export function AboutProject() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="section__label label" data-reveal>
        <span className="section__num">01</span>
        <h2 id="about-title">About the project</h2>
      </div>
      <div className="section__body">
        <p className="section__lead" data-reveal>
          Pain is personal, and so is getting better. This globe gathers the voices of Sword members, one city at a
          time.
        </p>
        <div className="section__cols">
          <p data-reveal>
            Each dot marks a place where a member chose to share their experience. Select one to see who they are, read
            a few words about them and listen to their story in their own voice.
          </p>
          <p data-reveal>
            The stories are short on purpose. They are not case studies or clinical results; they are people describing
            what changed in their day-to-day lives.
          </p>
          <p data-reveal>
            The map will keep growing as more members add their voice, starting in the United States and reaching
            outward.
          </p>
        </div>
      </div>
    </section>
  )
}

export function AboutSword() {
  return (
    <section className="section" id="sword" aria-labelledby="sword-title">
      <div className="section__label label" data-reveal>
        <span className="section__num">02</span>
        <h2 id="sword-title">About Sword Health</h2>
      </div>
      <div className="section__body">
        {/* VERIFY: positioning statement. */}
        <p className="section__lead" data-reveal>
          Sword Health is a digital health company with a simple aim: to help people live free of pain,{' '}
          <em>wherever they are</em>.
        </p>
        <ol className="points">
          {POINTS.map((p, i) => (
            <li key={p.title} data-reveal style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
              <span className="label points__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
