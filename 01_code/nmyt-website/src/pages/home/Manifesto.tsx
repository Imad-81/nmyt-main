import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import ParticleMorph from '@/gl/ParticleMorph'
import { MonoLabel } from '@/components/ui'
import { media, type MediaKey } from '@/data/media'
import './manifesto.css'

const STAGES = [
  { k: 'Tech Studio', v: 'A website, wireframed.', c: 'var(--sky)', target: 0 },
  { k: 'Creative Studio', v: 'A lens, wide open.', c: 'var(--acid)', target: 1 },
  { k: 'NMYT Mark', v: 'One mark. Both crafts.', c: 'var(--fg)', target: 2 },
]

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
  stageTarget: number
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
    stageTarget: 0,
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
    stageTarget: 1,
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
    stageTarget: 2,
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
  const progress = useRef(0)
  const [activeStage, setActiveStage] = useState(0)
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null)

  const setStage = useCallback((target: number) => {
    progress.current = target
    setActiveStage(target)
  }, [])

  useGSAP(
    () => {
      // Intro copy entrance
      gsap.fromTo(
        '.mf-copy-in',
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.mf-grid', start: 'top 82%', once: true },
        },
      )

      // 3D stage box entrance
      gsap.fromTo(
        '.mf-stage',
        { autoAlpha: 0, scale: 0.94 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.mf-grid', start: 'top 80%', once: true },
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

  const handlePillarEnter = (idx: number, stageTarget: number) => {
    setHoveredPillar(idx)
    setStage(stageTarget)
  }

  const handlePillarLeave = () => {
    setHoveredPillar(null)
  }

  return (
    <section ref={root} className="mf section" aria-label="About NMYT and What We Do">
      <div className="wrap">
        {/* Top Editorial Row: Statement + 3D Discipline Morph */}
        <div className="mf-grid">
          <div className="mf-copy">
            <div className="mf-copy-in">
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

            <ol className="mf-stages mf-copy-in" role="tablist" aria-label="Discipline preview switcher">
              {STAGES.map((s, i) => (
                <li
                  key={s.k}
                  role="tab"
                  tabIndex={0}
                  aria-selected={i === activeStage}
                  className={`mf-stage-item ${i === activeStage ? 'is-on' : ''}`}
                  style={{ ['--c' as string]: s.c }}
                  onMouseEnter={() => setStage(s.target)}
                  onClick={() => setStage(s.target)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStage(s.target)}
                >
                  <span className="mono mf-si">0{i + 1}</span>
                  <span className="mf-sk">{s.k}</span>
                  <span className="mf-sv serif">{s.v}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mf-stage" aria-hidden="true">
            <ParticleMorph progress={progress} />
            <div className="mf-stage-cap mono">
              <span className="flex items-center gap-2">
                <i className="mf-stage-dot" style={{ background: STAGES[activeStage].c }} />
                <span>Interactive Discipline Morph</span>
              </span>
              <span>{STAGES[activeStage].k}</span>
            </div>
            <div className="mf-stage-hint mono">
              <span>Interactive 3D / Hover or Drag</span>
            </div>
          </div>
        </div>

        {/* The 3 Pillars Spread: We build. We shoot. We tell stories. */}
        <div className="mf-pillars-header">
          <div className="mf-pillars-title-wrap">
            <span className="mono text-[var(--fg-3)]">Disciplines in Action</span>
            <h3 className="display mf-pillars-title">
              What we <em className="serif text-grad">do.</em>
            </h3>
          </div>
          <p className="mono mf-pillars-note">Click or hover to explore</p>
        </div>

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
                onMouseEnter={() => handlePillarEnter(i, p.stageTarget)}
                onMouseLeave={handlePillarLeave}
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
