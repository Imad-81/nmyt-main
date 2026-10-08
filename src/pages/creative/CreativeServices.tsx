import { Head } from '@/components/Simple'
import { Reveal } from '@/components/Reveal'
import { CREATIVE_SERVICES } from '@/data/site'

/**
 * Six disciplines as open type. The studio's green runs through one name at a time on its own
 * clock, and through whichever one the pointer is on.
 */
export default function CreativeServices() {
  return (
    <section className="sv section">
      <div className="wrap">
        <Head
          eyebrow="Services"
          title={
            <>
              Six ways to <em className="sv-em">be seen.</em>
            </>
          }
          lede="Every discipline under one roof, so the film, the feed and the identity all look like the same brand."
        />
        <Reveal className="sv-grid" childSelector=".sv-it" stagger={0.07} y={30}>
          {CREATIVE_SERVICES.map((s, i) => (
            <article key={s.n} className="sv-it" style={{ ['--i' as string]: i }}>
              <h3 className="display sv-t">
                <span className="sv-t-in">{s.title}</span>
              </h3>
              <p className="sv-b">{s.body}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
