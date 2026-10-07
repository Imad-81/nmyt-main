import { useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import Footer from '@/components/Footer'
import { Reveal } from '@/components/Reveal'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import TechHero, { TechStatement } from './tech/TechHero'
import TechServices, { TechStrip } from './tech/TechServices'
import TechKit from './tech/TechKit'
import { Steps } from '@/components/Simple'
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
  return (
    <div className="tp">
      <TechHero reduce={reduce} />
      <div className="tp-light">
        {reduce && (
          <section className="th-static">
            <div className="th-bridge" aria-hidden />
            <Reveal>
              <TechStatement />
            </Reveal>
          </section>
        )}
        <TechStrip />
        <TechServices />
        <TechKit reduce={reduce} />
        <Steps
          eyebrow="Process"
          title="From brief to launch."
          lede="Four steps, clear at every stage. You always know what is happening, what is next and what it costs."
          accent="#0a5fe0"
          items={[
            { title: 'Discover', body: 'We learn the business, the audience and the one job this build has to do. You get a clear scope, a timeline and a fixed quote.', tags: ['Kick-off call', 'Scope & sitemap', 'Timeline & quote'] },
            { title: 'Design', body: 'Wireframes first, then high-fidelity design in your brand. You see and click through everything before we build it.', tags: ['Wireframes', 'UI design', 'Clickable prototype'] },
            { title: 'Build', body: 'Clean, fast, responsive code with a CMS where you need one. Tested on real devices, audited for speed and accessibility.', tags: ['Development', 'CMS setup', 'QA on real devices'] },
            { title: 'Launch & care', body: 'We ship, measure and keep improving. Hosting, updates and monthly iteration, so it gets better, not older.', tags: ['Launch', 'Analytics', 'Monthly care'] },
          ]}
        />
        <TechWork reduce={reduce} />
        <Dusk reduce={reduce} />
      </div>
      <Footer accent="tech" />
    </div>
  )
}
