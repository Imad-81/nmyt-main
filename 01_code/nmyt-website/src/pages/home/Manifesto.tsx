import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { MonoLabel } from '@/components/ui'
import { media, type MediaKey } from '@/data/media'
import { useIsMobile } from '@/lib/hooks'
import './manifesto.css'

interface Pillar {
  key: string
  index: string
  kicker: string
  title: string
  em: string
  meta: string
  items: string[]
  image: MediaKey
  tone: string
  badge: string
  code: string
  glow: string
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
    items: ['Websites', 'Landing pages', 'Dashboards', 'Systems'],
    image: 'techHands',
    tone: 'var(--sky)',
    badge: 'Code & Architecture',
    code: 'SYS.01 // CODE',
    glow: 'var(--glow-tech)',
    link: '/tech',
  },
  {
    key: 'creative',
    index: '02',
    kicker: '02 / Creative Studio',
    title: 'We',
    em: 'shoot.',
    meta: 'Brand films · Product · Social · Ads · Design',
    items: ['Brand films', 'Product', 'Social', 'Ads', 'Design'],
    image: 'creativeCommercial',
    tone: 'var(--acid)',
    badge: 'Cinema & Motion',
    code: 'CAM.02 // RAW',
    glow: 'var(--glow-creative)',
    link: '/creative',
  },
  {
    key: 'originals',
    index: '03',
    kicker: '03 / NMYT Originals',
    title: 'We tell',
    em: 'stories.',
    meta: 'In-house short films · New filmmakers',
    items: ['In-house short films', 'New filmmakers'],
    image: 'heroFilmset',
    tone: 'var(--ice)',
    badge: 'Original Productions',
    code: 'FILM.03 // PROD',
    glow: 'var(--glow-master)',
    link: '/originals',
  },
]

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`)
  }, [])

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
    },
    { scope: root },
  )

  return (
    <section ref={root} className="mf" aria-label="About NMYT and Our Disciplines">
      <div className="wrap">
        {/* Centered Editorial Statement */}
        <header className="mf-header">
          <div className="mf-copy-in w-full text-left">
            <MonoLabel index="01">About NMYT</MonoLabel>
          </div>
          <h2 className="display mf-headline mf-copy-in">
            <span className="mf-headline-main">Two studios. One vision.</span>
            <em className="serif text-grad mf-headline-sub">One standard.</em>
          </h2>

          <div className="mf-statement mf-copy-in">
            <p className="mf-statement-lead">
              A small studio with big standards.
            </p>
            <p className="mf-statement-body">
              A <span className="mf-tag-tech">Tech Studio</span> that builds websites, landing pages and simple systems — and a{' '}
              <span className="mf-tag-creative">Creative Studio</span> that shoots films, products and content.
            </p>
            <div className="mf-statement-foot">
              <span className="mf-foot-dim">Most businesses juggle five vendors to get there.</span>
              <span className="mf-foot-highlight">You get one team, one standard, one story.</span>
            </div>
          </div>
        </header>

        {/* The 3 Pillars Triptych Spread */}
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
                style={{
                  ['--tone' as string]: p.tone,
                  ['--pillar-glow' as string]: p.glow,
                }}
                onMouseEnter={() => setHoveredPillar(i)}
                onMouseLeave={() => setHoveredPillar(null)}
                onMouseMove={handleMouseMove}
                data-cursor="Explore"
                aria-label={`${p.kicker} — ${p.title} ${p.em}`}
              >
                {/* Cinema Viewfinder Reticles */}
                <span className="mf-reticle mf-reticle--tl" aria-hidden="true">+</span>
                <span className="mf-reticle mf-reticle--tr" aria-hidden="true">+</span>
                <span className="mf-reticle mf-reticle--bl" aria-hidden="true">+</span>
                <span className="mf-reticle mf-reticle--br" aria-hidden="true">+</span>

                {/* Media Background Layer */}
                <div className="mf-pillar-media" aria-hidden="true">
                  <div
                    className="mf-pillar-bg"
                    style={{ backgroundImage: `url(${media(p.image, isMobile ? 'sm' : 'lg')})` }}
                  />
                  <div className="mf-pillar-tint" />
                  <div className="mf-pillar-spotlight" />
                  <div className="mf-pillar-shade" />
                  <div className="mf-pillar-glow" />
                </div>

                {/* Sculptural Ghost Numeral Watermark */}
                <div className="mf-pillar-watermark display" aria-hidden="true">
                  {p.index}
                </div>

                {/* Top HUD: Studio Index & Classification */}
                <header className="mf-pillar-head">
                  <div className="mf-pillar-kicker mono">
                    <span className="mf-dot-beacon">
                      <span className="mf-dot-ring" />
                      <i className="mf-dot" />
                    </span>
                    <span className="mf-kicker-text">{p.kicker}</span>
                  </div>
                  <div className="mf-head-meta">
                    <span className="mf-code-tag mono">{p.code}</span>
                    <span className="mf-pill mono">{p.badge}</span>
                  </div>
                </header>

                {/* Bottom Body: Disciplines & Direct CTA */}
                <div className="mf-pillar-body">
                  <div className="mf-title-group">
                    <h3 className="display mf-pillar-title">
                      <span className="mf-title-line">{p.title}</span>
                      <em className="serif mf-title-em">{p.em}</em>
                    </h3>
                  </div>

                  {/* Structured Deliverables Tags */}
                  <div className="mf-pillar-tags mono" aria-label={p.meta}>
                    {p.items.map((item) => (
                      <span key={item} className="mf-pillar-tag">
                        <i className="mf-tag-dot" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>

                  {/* Refined Magnetic Studio Access Button */}
                  <div className="mf-pillar-cta mono">
                    <span className="mf-cta-label">Enter Studio</span>
                    <span className="mf-cta-disc" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                        <path
                          d="M3.5 12.5L12.5 3.5M12.5 3.5H5.5M12.5 3.5v7"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Atmospheric Floor Light Bleed */}
                <div className="mf-pillar-floor-glow" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

