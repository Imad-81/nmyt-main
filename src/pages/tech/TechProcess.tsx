import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/smooth'
import { useMediaQuery } from '@/lib/hooks'
import { SplitReveal, Reveal } from '@/components/Reveal'

const STEPS = [
  {
    n: '01',
    t: 'Discover',
    b: 'We learn the business, the audience and the one job this build has to do. You get a clear scope, a timeline and a fixed quote.',
    l: ['Kick-off call', 'Scope & sitemap', 'Timeline & quote'],
  },
  {
    n: '02',
    t: 'Design',
    b: 'Wireframes first, then high-fidelity design in your brand. You see and click through everything before we build it.',
    l: ['Wireframes', 'UI design', 'Clickable prototype'],
  },
  {
    n: '03',
    t: 'Build',
    b: 'Clean, fast, responsive code with a CMS where you need one. Tested on real devices, audited for speed and accessibility.',
    l: ['Development', 'CMS setup', 'QA on real devices'],
  },
  {
    n: '04',
    t: 'Launch & care',
    b: 'We ship, measure and keep improving. Hosting, updates and monthly iteration, so it gets better, not older.',
    l: ['Launch', 'Analytics', 'Monthly care'],
  },
]

export default function TechProcess({ reduce }: { reduce: boolean }) {
  const root = useRef<HTMLElement>(null)
  const wide = useMediaQuery('(min-width: 1024px)')
  const horizontal = wide && !reduce

  useGSAP(
    () => {
      const el = root.current!
      const steps = gsap.utils.toArray<HTMLElement>('.tpr-step', el)

      if (horizontal) {
        const track = el.querySelector<HTMLElement>('.tpr-track')!
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
        const move = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: { trigger: el, pin: true, start: 'top top', end: () => `+=${dist()}`, scrub: 0.8, invalidateOnRefresh: true },
        })
        gsap.fromTo('.tpr-bar-fill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true } })
        // entrance for what's visible when the section arrives
        gsap.fromTo(
          el.querySelectorAll('.tpr-step .tpr-in'),
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 70%', once: true } },
        )
        steps.forEach((s, i) => {
          // numerals drift against the track — depth without 3D
          gsap.fromTo(s.querySelector('.tpr-num'), { xPercent: 28 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: s, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } })
          const node = el.querySelectorAll('.tpr-node')[i]
          ScrollTrigger.create({ trigger: s, containerAnimation: move, start: 'left 62%', end: 'right 30%', toggleClass: { targets: [s, node], className: 'is-on' } })
        })
        return
      }

      // vertical (mobile / tablet / reduced motion)
      steps.forEach((s) => {
        gsap.fromTo(
          s.querySelectorAll('.tpr-in'),
          { autoAlpha: 0, y: reduce ? 14 : 36 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true } },
        )
        ScrollTrigger.create({ trigger: s, start: 'top 60%', end: 'bottom 40%', toggleClass: { targets: s, className: 'is-on' } })
      })
      if (!reduce) {
        gsap.fromTo('.tpr-vline i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el.querySelector('.tpr-steps'), start: 'top 60%', end: 'bottom 60%', scrub: true } })
      }
    },
    { scope: root, dependencies: [horizontal, reduce], revertOnUpdate: true },
  )

  return (
    <section ref={root} className={`tpr ${horizontal ? 'tpr--h' : 'tpr--v'}`} id="process">
      <div className="tpr-pin">
        <div className="wrap tpr-top">
          <span className="mono tk-label">
            <b>03</b> / Process
          </span>
          <div className="tpr-bar" aria-hidden>
            <span className="tpr-bar-fill" />
            {STEPS.map((s) => (
              <span key={s.n} className="tpr-node">
                <i />
                <em className="mono">{s.t}</em>
              </span>
            ))}
          </div>
          <span className="mono tpr-count">04 steps</span>
        </div>

        <div className="tpr-track">
          <div className="tpr-intro">
            <SplitReveal as="h2" className="display tpr-title">
              From brief
              <br />
              to <em className="serif">launch.</em>
            </SplitReveal>
            <Reveal className="lede tpr-lede" delay={0.15}>
              Four steps, clear at every stage. You always know what’s happening, what’s next and what it costs.
            </Reveal>
            {horizontal && (
              <Reveal className="mono tpr-hint" delay={0.3}>
                Keep scrolling <span aria-hidden>→</span>
              </Reveal>
            )}
          </div>

          <div className="tpr-steps">
            {!horizontal && (
              <span className="tpr-vline" aria-hidden>
                <i />
              </span>
            )}
            {STEPS.map((s) => (
            <article key={s.n} className="tpr-step">
              <span className="tpr-num serif" aria-hidden>
                {s.n}
              </span>
              <div className="tpr-body">
                <div className="mono tpr-k tpr-in">Step {s.n}</div>
                <h3 className="display tpr-t tpr-in">{s.t}</h3>
                <p className="tpr-b tpr-in">{s.b}</p>
                <ul className="tpr-l tpr-in">
                  {s.l.map((x) => (
                    <li key={x} className="mono">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
