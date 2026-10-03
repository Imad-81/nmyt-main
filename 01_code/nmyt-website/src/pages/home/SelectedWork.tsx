import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { PROJECTS, STUDIO_META } from '@/data/work'
import { media } from '@/data/media'
import { MonoLabel } from '@/components/ui'
import { SplitReveal } from '@/components/Reveal'
import './selected.css'

/** Pinned horizontal gallery of rounded media cards (desktop); native swipe on mobile. */
export default function SelectedWork() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 901px)', () => {
        const t = track.current!
        const dist = () => t.scrollWidth - window.innerWidth + 40
        const tween = gsap.to(t, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: prefersReducedMotion() ? true : 0.9,
            invalidateOnRefresh: true,
          },
        })
        // cards lean with velocity + inner image parallax
        gsap.utils.toArray<HTMLElement>('.sw-card').forEach((card) => {
          const img = card.querySelector('.sw-img')
          gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
        })
        gsap.to('.sw-bar i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: true } })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="sw" aria-label="Selected work">
      <div className="sw-mhead wrap">
        <MonoLabel index="02">Selected work</MonoLabel>
        <h2 className="display sw-title">
          Work that <em className="serif text-grad">moves</em> people.
        </h2>
      </div>
      <div ref={track} className="sw-track">
        <div className="sw-intro">
          <MonoLabel index="02">Selected work</MonoLabel>
          <SplitReveal as="h2" className="display sw-title">
            Work that <em className="serif text-grad">moves</em> people.
          </SplitReveal>
          <p className="lede max-w-[30ch]">Films, sites and systems for brands that care how they show up.</p>
          <div className="sw-bar">
            <i />
          </div>
          <span className="mono sw-note">Sample projects — replace with live case studies</span>
        </div>
        {PROJECTS.map((p, i) => (
          <Link to="/work" key={p.slug} className={`sw-card ${i % 2 ? 'sw-card--low' : ''}`} data-cursor="View">
            <div className="sw-media">
              <div className="sw-img" style={{ backgroundImage: `url(${media(p.image)})` }} />
              <div className="sw-shade" />
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
              <h3 className="sw-name">{p.name}</h3>
              <span className="sw-client">{p.client}</span>
            </div>
          </Link>
        ))}
        <Link to="/work" className="sw-end" data-cursor="All work">
          <span className="display">
            All
            <br />
            <em className="serif">work</em>
          </span>
          <span className="sw-end-arrow">→</span>
        </Link>
      </div>
    </section>
  )
}
