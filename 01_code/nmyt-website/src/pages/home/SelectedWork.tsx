import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion, refreshScroll } from '@/lib/smooth'
import { PROJECTS, STUDIO_META } from '@/data/work'
import { media } from '@/data/media'
import { MonoLabel } from '@/components/ui'
import './selected.css'

interface WorkCardProps {
  project: (typeof PROJECTS)[0]
  onHover: (el: HTMLElement, studio: string) => void
  onLeave: () => void
}

function WorkCard({ project, onHover, onLeave }: WorkCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return
    const el = mediaRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5

    const rx = -y * 12
    const ry = x * 12
    const px = ((e.clientX - r.left) / r.width) * 100
    const py = ((e.clientY - r.top) / r.height) * 100

    gsap.to(el, {
      rotateX: rx,
      rotateY: ry,
      transformPerspective: 950,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    if (glareRef.current) {
      glareRef.current.style.setProperty('--mx', `${px.toFixed(1)}%`)
      glareRef.current.style.setProperty('--my', `${py.toFixed(1)}%`)
    }
  }

  const onPointerEnter = () => {
    if (cardRef.current) {
      onHover(cardRef.current, project.studio)
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '1'
    }
  }

  const onPointerLeave = () => {
    onLeave()
    if (mediaRef.current) {
      gsap.to(mediaRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.65,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0'
    }
  }

  return (
    <Link
      ref={cardRef}
      to="/work"
      className="sw-card"
      data-cursor="View Case ↗"
      aria-label={`View ${project.name} case study`}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div ref={mediaRef} className="sw-media">
        <div
          className="sw-img"
          style={{ backgroundImage: `url(${media(project.image, 'lg')})` }}
          aria-hidden="true"
        />
        <div className="sw-shade" aria-hidden="true" />
        <div ref={glareRef} className="sw-glare" aria-hidden="true" />

        <div className="sw-top">
          <span className="sw-pill mono">
            <i style={{ background: STUDIO_META[project.studio].color }} />
            {STUDIO_META[project.studio].label}
          </span>
          <span className="sw-pill mono">{project.year}</span>
        </div>

        <div className="sw-bottom">
          <div className="sw-services">
            {project.services.map((s) => (
              <span key={s} className="sw-pill sw-pill--glass mono">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sw-meta">
        <div className="flex items-center justify-between gap-2">
          <h3 className="sw-name">{project.name}</h3>
          <span className="sw-arrow" aria-hidden="true">↗</span>
        </div>
        <span className="sw-client">{project.client}</span>
      </div>
    </Link>
  )
}

export default function SelectedWork() {
  const root = useRef<HTMLElement>(null)
  const [aura, setAura] = useState<{ x: number; y: number; active: boolean; tone: string }>({
    x: 0,
    y: 0,
    active: false,
    tone: 'var(--sky)',
  })

  const handleCardHover = (cardEl: HTMLElement, studio: string) => {
    if (!root.current) return
    const rootRect = root.current.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()
    const x = cardRect.left + cardRect.width / 2 - rootRect.left
    const y = cardRect.top + cardRect.height / 2 - rootRect.top
    const tone = STUDIO_META[studio as keyof typeof STUDIO_META]?.color || 'var(--sky)'

    setAura({
      x,
      y,
      active: true,
      tone,
    })
  }

  const handleCardLeave = () => {
    setAura((prev) => ({ ...prev, active: false }))
  }

  useGSAP(
    () => {
      // Entrance reveal
      gsap.fromTo(
        '.sw-intro-anim',
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
        },
      )

      gsap.fromTo(
        '.sw-card',
        { autoAlpha: 0, y: 44 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.sw-grid', start: 'top 84%', once: true },
        },
      )

      // Multi-plane organic scroll drift (living depth without scroll hijacking)
      if (!prefersReducedMotion() && window.innerWidth > 900) {
        const cards = gsap.utils.toArray<HTMLElement>('.sw-card', root.current)
        const driftOffsets = [-24, 20, -32, 18, -26, 28]

        cards.forEach((card, i) => {
          const drift = driftOffsets[i % driftOffsets.length]
          gsap.fromTo(
            card,
            { y: -drift },
            {
              y: drift,
              ease: 'none',
              scrollTrigger: {
                trigger: root.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.3,
              },
            },
          )

          // Inner image counter-travel parallax
          const img = card.querySelector('.sw-img')
          if (img) {
            gsap.fromTo(
              img,
              { yPercent: -7 },
              {
                yPercent: 7,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              },
            )
          }
        })
      }

      refreshScroll()
    },
    { scope: root },
  )

  const topCards = PROJECTS.slice(0, 2)
  const bottomCards = PROJECTS.slice(2, 6)

  return (
    <section ref={root} className="sw" aria-label="Selected work">
      {/* Dynamic ambient backdrop aura that glides to hovered card */}
      <div
        className={`sw-aura ${aura.active ? 'is-active' : ''}`}
        style={{
          left: `${aura.x}px`,
          top: `${aura.y}px`,
          ['--aura-tone' as string]: aura.tone,
        }}
        aria-hidden="true"
      />

      <div className="wrap relative z-10">
        <div className="sw-grid">
          {/* Top Left: Title block spanning 2 columns on desktop */}
          <div className="sw-intro">
            <div className="sw-intro-anim flex items-center gap-3">
              <MonoLabel index="02">Selected work</MonoLabel>
              <span className="sw-count-badge mono">06 Projects</span>
            </div>
            <h2 className="display sw-title sw-intro-anim">
              Work that
              <br />
              <em className="serif text-grad">moves</em> people.
            </h2>
            <p className="sw-lede sw-intro-anim">
              Films, sites and systems for brands that care how they show up. Built with code, captured on camera.
            </p>
            <div className="sw-intro-anim mt-2">
              <Link to="/work" className="sw-all-link mono" data-cursor="All Work">
                <span>View all projects</span>
                <span className="sw-all-arrow">→</span>
              </Link>
            </div>
          </div>

          {/* Top Right: 2 cards completing row 1 */}
          {topCards.map((p) => (
            <WorkCard
              key={p.slug}
              project={p}
              onHover={handleCardHover}
              onLeave={handleCardLeave}
            />
          ))}

          {/* Row 2: 4 cards spanning full width */}
          {bottomCards.map((p) => (
            <WorkCard
              key={p.slug}
              project={p}
              onHover={handleCardHover}
              onLeave={handleCardLeave}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
