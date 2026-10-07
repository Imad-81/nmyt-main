import { useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import Footer from '@/components/Footer'
import { Reveal } from '@/components/Reveal'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import TechHero, { TechStatement } from './tech/TechHero'
import TechServices, { TechStrip } from './tech/TechServices'
import TechKit from './tech/TechKit'
import TechProcess from './tech/TechProcess'
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
        <TechProcess reduce={reduce} />
        <TechWork reduce={reduce} />
        <Dusk reduce={reduce} />
      </div>
      <Footer accent="tech" />
    </div>
  )
}
