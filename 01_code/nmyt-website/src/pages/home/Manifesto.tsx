import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { MonoLabel } from '@/components/ui'
import { media, type MediaKey } from '@/data/media'
import './manifesto.css'

interface Pillar {
  key: string
  index: string
  kicker: string
  title: string
  em: string
  meta: string
  image: MediaKey
  tone: string
  badge: string
  link: string
}

const PILLARS: Pillar[] = [
  {
    key: 'tech',
    index: '01',
    kicker: '01 / Tech Studio',
    title: 'We',
    em: 'build.',
    meta: 'Websites · Landing pages · Dashboards · Systems',
    image: 'techHands',
    tone: 'var(--sky)',
    badge: 'Code & Architecture',
    link: '/tech',
  },
  {
    key: 'creative',
    index: '02',
    kicker: '02 / Creative Studio',
    title: 'We',
    em: 'shoot.',
    meta: 'Brand films · Product · Social · Ads · Design',
    image: 'creativeCommercial',
    tone: 'var(--acid)',
    badge: 'Cinema & Motion',
    link: '/creative',
  },
  {
    key: 'originals',
    index: '03',
    kicker: '03 / NMYT Originals',
    title: 'We tell',
    em: 'stories.',
    meta: 'In-house short films · New filmmakers',
    image: 'heroFilmset',
    tone: 'var(--ice)',
    badge: 'Original Productions',
    link: '/originals',
  },
]

const FACTS = [
  { n: '2', l: 'Studios' },
  { n: '11', l: 'Disciplines' },
  { n: '1', l: 'Team, start to finish' },
  { n: '0', l: 'Templates' },
]

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null)

  useGSAP(
    () => {
      // Centered Intro copy entrance
      gsap.fromTo(
        '.mf-copy-in',
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.mf-header', start: 'top 85%', once: true },
        },
      )

      // Pillars entrance
      gsap.fromTo(
        '.mf-pillar',
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.mf-triptych', start: 'top 82%', once: true },
        },
      )

      // Facts reveal
      gsap.fromTo(
        '.mf-fact',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.mf-facts', start: 'top 92%', once: true },
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="mf section" aria-label="About NMYT and Our Disciplines">
      <div className="wrap">
        {/* Centered Editorial Statement */}
        <header className="mf-header">
          <div className="mf-copy-in flex justify-center">
            <MonoLabel index="01">About NMYT</MonoLabel>
          </div>
          <h2 className="display mf-headline mf-copy-in">
            Two teams. One roof.
            <br />
            <em className="serif text-grad">One standard.</em>
          </h2>
          <p className="mf-text mf-copy-in">
            NMYT is a small studio with big standards. A Tech Studio that builds websites, landing pages and simple
            systems — and a Creative Studio that shoots films, products and content. Most businesses juggle five vendors
            to get there. You get one team, one standard, one story.
          </p>
        </header>

        {/* The 3 Pillars Spread (Moved up directly under the statement) */}
        <div className="mf-triptych" role="region" aria-label="Our Three Pillars">
          {PILLARS.map((p, i) => {
            const isHovered = hoveredPillar === i
            const hasHover = hoveredPillar !== null
            const cardState = isHovered ? 'is-active' : hasHover ? 'is-dim' : ''

            return (
              <Link
                key={p.key}
                to={p.link}
                className={`mf-pillar mf-pillar--${p.key} ${cardState}`}
                style={{ ['--tone' as string]: p.tone }}
                onMouseEnter={() => setHoveredPillar(i)}
                onMouseLeave={() => setHoveredPillar(null)}
                data-cursor="Explore"
                aria-label={`${p.kicker} — ${p.title} ${p.em}`}
              >
                <div
                  className="mf-pillar-bg"
                  style={{ backgroundImage: `url(${media(p.image, 'lg')})` }}
                  aria-hidden="true"
                />
                <div className="mf-pillar-shade" aria-hidden="true" />
                <div className="mf-pillar-glow" aria-hidden="true" />

                {/* Top HUD */}
                <header className="mf-pillar-head">
                  <div className="mf-pillar-kicker mono">
                    <i className="mf-dot" />
                    <span>{p.kicker}</span>
                  </div>
                  <span className="mf-pill mono">{p.badge}</span>
                </header>

                {/* Bottom Body */}
                <div className="mf-pillar-body">
                  <h4 className="display mf-pillar-title">
                    <span className="mf-title-line">{p.title}</span>
                    <em className="serif mf-title-em">{p.em}</em>
                  </h4>
                  <p className="mf-pillar-meta mono">{p.meta}</p>

                  <div className="mf-pillar-cta mono">
                    <span>Enter Studio</span>
                    <span className="mf-arrow" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                        <path d="M3 13L13 3M13 3H5M13 3v8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Stats Strip */}
        <div className="mf-facts">
          {FACTS.map((f) => (
            <div key={f.l} className="mf-fact">
              <span className="display mf-n">{f.n}</span>
              <span className="mono mf-l">{f.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
