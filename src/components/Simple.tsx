import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Reveal, SplitReveal } from './Reveal'
import { STUDIO_META, type Project } from '@/data/work'
import { media, type MediaKey } from '@/data/media'
import '@/styles/simple.css'

/**
 * Calm, vertical building blocks. Everything here scrolls down the page at the reader's
 * pace: no pinning, no sideways scrubbing, nothing that holds the scroll hostage.
 */

export function Head({ eyebrow, title, lede, center = false }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; center?: boolean }) {
  return (
    <div className={`sx-head ${center ? 'sx-head--center' : ''}`}>
      {eyebrow && (
        <Reveal className="eyebrow sx-eyebrow" y={16}>
          {eyebrow}
        </Reveal>
      )}
      <SplitReveal as="h2" className="display h-section">
        {title}
      </SplitReveal>
      {lede && (
        <Reveal className="lede sx-lede" delay={0.1} y={20}>
          {lede}
        </Reveal>
      )}
    </div>
  )
}

/** A numbered sequence laid out as open columns (no cards, no rules). */
export function Steps({
  eyebrow,
  title,
  lede,
  items,
  accent = 'var(--sky)',
  id,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  items: { n?: string; title: string; body: string; tags?: string[] }[]
  accent?: string
  id?: string
  children?: ReactNode
}) {
  return (
    <section className="sx section" id={id} style={{ ['--sx-accent' as string]: accent }}>
      <div className="wrap">
        <Head eyebrow={eyebrow} title={title} lede={lede} />
        <Reveal className={`sx-steps sx-steps--${Math.min(items.length, 5)}`} childSelector=".sx-step" stagger={0.08} y={28}>
          {items.map((s, i) => (
            <article key={s.title} className="sx-step">
              <span className="sx-step-n">{s.n ?? String(i + 1).padStart(2, '0')}</span>
              <h3 className="sx-step-t">{s.title}</h3>
              <p className="sx-step-b">{s.body}</p>
              {s.tags && <p className="sx-step-tags">{s.tags.join('  ·  ')}</p>}
            </article>
          ))}
        </Reveal>
        {children}
      </div>
    </section>
  )
}

/** Projects in a plain two-column grid that reads top to bottom. */
export function WorkGrid({ eyebrow, title, lede, items, id, note }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; items: Project[]; id?: string; note?: string }) {
  return (
    <section className="sx section" id={id}>
      <div className="wrap">
        <Head eyebrow={eyebrow} title={title} lede={lede} />
        <div className="sx-work">
          {items.map((p) => (
            <Reveal key={p.slug} className="sx-card-wrap" y={36}>
              <Link to="/work" className="sx-card">
                <div className="sx-card-media">
                  <img src={media(p.image, 'sm')} srcSet={`${media(p.image, 'sm')} 900w, ${media(p.image)} 2000w`} sizes="(max-width: 767px) 100vw, 50vw" alt={`${p.name}, ${p.client}`} loading="lazy" decoding="async" />
                </div>
                <div className="sx-card-meta">
                  <h3 className="sx-card-t">{p.name}</h3>
                  <p className="sx-card-s">
                    {p.client} <span aria-hidden>·</span> {STUDIO_META[p.studio].label}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        {note && <p className="sx-note">{note}</p>}
      </div>
    </section>
  )
}

/** Three large tiles: what the studio does, shown plainly. */
export function Pillars({ items }: { items: { img: MediaKey; title: string; body: string; to: string; tone: string }[] }) {
  return (
    <section className="sx section sx-pillars-sec" aria-label="What NMYT does">
      <div className="wrap">
        <div className="sx-pillars">
          {items.map((p) => (
            <Reveal key={p.title} className="sx-pillar-wrap" y={36}>
              <Link to={p.to} className="sx-pillar" style={{ ['--tone' as string]: p.tone }}>
                <img src={media(p.img, 'sm')} srcSet={`${media(p.img, 'sm')} 900w, ${media(p.img)} 2000w`} sizes="(max-width: 899px) 100vw, 33vw" alt="" loading="lazy" decoding="async" />
                <div className="sx-pillar-copy">
                  <h3 className="display sx-pillar-t">{p.title}</h3>
                  <p className="sx-pillar-b">{p.body}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/** A single line of words sliding sideways at a steady pace. Pure CSS. */
export function SlideMarquee({ words, accent = 'var(--fg)' }: { words: string[]; accent?: string }) {
  const row = (hidden: boolean) => (
    <div className="sx-mq-set" aria-hidden={hidden || undefined}>
      {words.map((w) => (
        <span key={w} className="sx-mq-item">
          {w}
        </span>
      ))}
    </div>
  )
  return (
    <section className="sx-mq display" style={{ color: accent }} aria-label={words.join(', ')}>
      <div className="sx-mq-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  )
}
