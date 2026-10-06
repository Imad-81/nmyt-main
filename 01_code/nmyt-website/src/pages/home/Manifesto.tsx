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

interface PillarCardProps {
  pillar: Pillar
  index: number
  isHovered: boolean
  hasHover: boolean
  isMobile: boolean
  onHover: (i: number) => void
  onLeave: () => void
}

function PillarCard({
  pillar,
  index,
  isHovered,
  hasHover,
  isMobile,
  onHover,
  onLeave,
}: PillarCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const watermarkRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (isMobile || window.matchMedia('(hover: none), (pointer: coarse)').matches) return
    const card = cardRef.current
    const inner = innerRef.current
    if (!card || !inner) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const nx = x / rect.width - 0.5
    const ny = y / rect.height - 0.5

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)

    // Smooth physics-based 3D tilt
    gsap.to(inner, {
      rotateY: nx * 8,
      rotateX: -ny * 8,
      transformPerspective: 1000,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    // Parallax on image (counter-movement)
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        x: -nx * 14,
        y: -ny * 14,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    // Parallax on watermark numeral
    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: nx * 10,
        y: ny * 10,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handlePointerLeave = () => {
    onLeave()
    const inner = innerRef.current
    if (inner) {
      gsap.to(inner, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.65,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
    if (watermarkRef.current) {
      gsap.to(watermarkRef.current, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
  }

  const cardState = isHovered ? 'is-active' : hasHover ? 'is-dim' : ''

  return (
    <Link
      ref={cardRef}
      to={pillar.link}
      className={`mf-pillar mf-pillar--${pillar.key} ${cardState}`}
      style={{
        ['--tone' as string]: pillar.tone,
        ['--pillar-glow' as string]: pillar.glow,
      }}
      onPointerEnter={() => onHover(index)}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      data-cursor="Explore"
      aria-label={`${pillar.kicker} — ${pillar.title} ${pillar.em}`}
    >
      <div ref={innerRef} className="mf-pillar-inner">
        {/* Cinema Viewfinder Reticles */}
        <span className="mf-reticle mf-reticle--tl" aria-hidden="true">+</span>
        <span className="mf-reticle mf-reticle--tr" aria-hidden="true">+</span>
        <span className="mf-reticle mf-reticle--bl" aria-hidden="true">+</span>
        <span className="mf-reticle mf-reticle--br" aria-hidden="true">+</span>

        {/* Media Background Layer with Parallax */}
        <div className="mf-pillar-media" aria-hidden="true">
          <div
            ref={bgRef}
            className="mf-pillar-bg"
            style={{ backgroundImage: `url(${media(pillar.image, isMobile ? 'sm' : 'lg')})` }}
          />
          <div className="mf-pillar-tint" />
          <div className="mf-pillar-spotlight" />
          <div className="mf-pillar-shade" />
          <div className="mf-pillar-glow" />
        </div>

        {/* Apple-style Specular Glare */}
        <div className="mf-pillar-glare" aria-hidden="true" />

        {/* Sculptural Ghost Numeral Watermark */}
        <div ref={watermarkRef} className="mf-pillar-watermark display" aria-hidden="true">
          {pillar.index}
        </div>

        {/* Top HUD: Studio Index & Classification */}
        <header className="mf-pillar-head">
          <div className="mf-pillar-kicker mono">
            <span className="mf-dot-beacon">
              <span className="mf-dot-ring" />
              <i className="mf-dot" />
            </span>
            <span className="mf-kicker-text">{pillar.kicker}</span>
          </div>
          <div className="mf-head-meta">
            <span className="mf-code-tag mono">{pillar.code}</span>
            <span className="mf-pill mono">{pillar.badge}</span>
          </div>
        </header>

        {/* Bottom Body: Disciplines & Direct CTA */}
        <div className="mf-pillar-body">
          <div className="mf-title-group">
            <h3 className="display mf-pillar-title">
              <span className="mf-title-line">{pillar.title}</span>
              <em className="serif mf-title-em">{pillar.em}</em>
            </h3>
          </div>

          {/* Structured Deliverables Tags with Staggered Hover Elevation */}
          <div className="mf-pillar-tags mono" aria-label={pillar.meta}>
            {pillar.items.map((item, idx) => (
              <span
                key={item}
                className="mf-pillar-tag"
                style={{ ['--tag-idx' as string]: idx }}
              >
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
      </div>
    </Link>
  )
}

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()
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
          {PILLARS.map((p, i) => (
            <PillarCard
              key={p.key}
              pillar={p}
              index={i}
              isHovered={hoveredPillar === i}
              hasHover={hoveredPillar !== null}
              isMobile={isMobile}
              onHover={setHoveredPillar}
              onLeave={() => setHoveredPillar(null)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

