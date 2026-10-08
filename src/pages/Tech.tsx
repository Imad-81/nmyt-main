import { useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import Footer from '@/components/Footer'
import { Reveal } from '@/components/Reveal'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import TechHero, { TechStatement } from './tech/TechHero'
import TechServices from './tech/TechServices'
import TechKit from './tech/TechKit'
import { Steps } from '@/components/Simple'
import { TechHead } from './tech/shared'
import TechWork from './tech/TechWork'
import './tech/tech.css'

/** Light sets back into the void before the footer — the hero's horizon, in reverse. */
function Dusk({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (reduce) return
      gsap.fromTo('.tp-dusk-planet', { yPercent: 38 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom bottom', scrub: true } })
    },
    { scope: ref, dependencies: [reduce] },
  )
  return (
    <div ref={ref} className="tp-dusk" aria-hidden>
      <div className="tp-dusk-planet" />
    </div>
  )
}

export default function Tech() {
  const reduce = useMemo(() => prefersReducedMotion(), [])
  const light = useRef<HTMLDivElement>(null)

  // One section holds the eye at a time: each rises into focus as it arrives and falls back
  // as the next one takes over. Tied to the scroll, so it is as smooth as the reader's hand.
  useGSAP(
    () => {
      if (reduce) return
      const mm = gsap.matchMedia()
      mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)' }, (ctx) => {
        const wide = ctx.conditions!.wide
        gsap.utils.toArray<HTMLElement>('.tp-light > section').forEach((sec) => {
          const inner = sec.querySelector<HTMLElement>(':scope > .wrap')
          if (!inner || sec.classList.contains('th-static')) return
          gsap.fromTo(
            inner,
            { autoAlpha: 0, y: wide ? 80 : 40, scale: wide ? 0.972 : 1, transformOrigin: '50% 0%' },
            { autoAlpha: 1, y: 0, scale: 1, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 98%', end: 'top 58%', scrub: 0.5 } },
          )
          gsap.fromTo(sec, { autoAlpha: 1 }, { autoAlpha: 0.2, ease: 'power1.in', immediateRender: false, scrollTrigger: { trigger: sec, start: 'bottom 42%', end: 'bottom 4%', scrub: 0.5 } })
        })
      })
    },
    { scope: light, dependencies: [reduce] },
  )

  return (
    <div className="tp">
      <TechHero reduce={reduce} />
      <div ref={light} className="tp-light">
        {reduce && (
          <section className="th-static">
            <div className="th-bridge" aria-hidden />
            <Reveal>
              <TechStatement />
            </Reveal>
          </section>
        )}
        <TechServices />
        <TechKit />
        <Steps
          head={
            <TechHead
              label="Process"
              title={
                <>
                  From brief to <em className="serif">launch.</em>
                </>
              }
              lede="Four steps, clear at every stage. You always know what is happening, what is next and what it costs."
            />
          }
          accent="#0a5fe0"
          items={[
            { title: 'Discover', body: 'We learn the business, the audience and the one job this build has to do. You get a clear scope, a timeline and a fixed quote.', tags: ['Kick-off call', 'Scope & sitemap', 'Timeline & quote'] },
            { title: 'Design', body: 'Wireframes first, then high-fidelity design in your brand. You see and click through everything before we build it.', tags: ['Wireframes', 'UI design', 'Clickable prototype'] },
            { title: 'Build', body: 'Clean, fast, responsive code with a CMS where you need one. Tested on real devices, audited for speed and accessibility.', tags: ['Development', 'CMS setup', 'QA on real devices'] },
            { title: 'Launch & care', body: 'We ship, measure and keep improving. Hosting, updates and monthly iteration, so it gets better, not older.', tags: ['Launch', 'Analytics', 'Monthly care'] },
          ]}
        />
        <TechWork />
        <Dusk reduce={reduce} />
      </div>
      <Footer accent="tech" />
    </div>
  )
}
