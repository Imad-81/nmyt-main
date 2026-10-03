import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, refreshScroll } from '@/lib/smooth'
import { PROJECTS, STUDIO_META } from '@/data/work'
import { media } from '@/data/media'
import { MonoLabel } from '@/components/ui'
import './selected.css'

export default function SelectedWork() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
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

      refreshScroll()
    },
    { scope: root },
  )

  const topCards = PROJECTS.slice(0, 2)
  const bottomCards = PROJECTS.slice(2, 6)

  const renderCard = (p: (typeof PROJECTS)[0]) => (
    <Link to="/work" key={p.slug} className="sw-card" data-cursor="View" aria-label={`View ${p.name}`}>
      <div className="sw-media">
        <div
          className="sw-img"
          style={{ backgroundImage: `url(${media(p.image, 'lg')})` }}
          aria-hidden="true"
        />
        <div className="sw-shade" aria-hidden="true" />
        <div className="sw-top">
          <span className="sw-pill mono">
            <i style={{ background: STUDIO_META[p.studio].color }} />
            {STUDIO_META[p.studio].label}
          </span>
          <span className="sw-pill mono">{p.year}</span>
        </div>
        <div className="sw-bottom">
          <div className="sw-services">
            {p.services.map((s) => (
              <span key={s} className="sw-pill sw-pill--glass mono">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="sw-meta">
        <div className="flex items-center justify-between gap-2">
          <h3 className="sw-name">{p.name}</h3>
          <span className="sw-arrow" aria-hidden="true">↗</span>
        </div>
        <span className="sw-client">{p.client}</span>
      </div>
    </Link>
  )

  return (
    <section ref={root} className="sw" aria-label="Selected work">
      <div className="wrap">
        <div className="sw-grid">
          {/* Top Left: Title block spanning 2 columns on desktop */}
          <div className="sw-intro">
            <div className="sw-intro-anim">
              <MonoLabel index="02">Selected work</MonoLabel>
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
          {topCards.map((p) => renderCard(p))}

          {/* Row 2: 4 cards spanning full width */}
          {bottomCards.map((p) => renderCard(p))}
        </div>
      </div>
    </section>
  )
}
