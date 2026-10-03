import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { SplitReveal, Reveal } from '@/components/Reveal'
import './hero.css'

export default function HomeHero() {
  const root = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to('.hh-copy', {
        yPercent: -18,
        autoAlpha: 0.0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '50% top', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hh" data-theme="master">
      <div className="hh-top wrap">
        <Reveal trigger="intro" className="hh-top-inner" childSelector=".hh-fade" delay={0.5}>
          <div className="hh-fade mono hh-kicker">
            New-gen digital studio
          </div>
        </Reveal>
      </div>

      <div ref={copyRef} className="hh-copy wrap">
        <h1 className="display hh-title">
          <SplitReveal as="span" className="hh-line" type="chars" trigger="intro" delay={0.25} stagger={0.03} duration={1.4}>
            Where code
          </SplitReveal>
          <SplitReveal as="span" className="hh-line" type="chars" trigger="intro" delay={0.5} stagger={0.03} duration={1.4}>
            <em className="serif hh-em">meets</em> cinema.
          </SplitReveal>
        </h1>
        <div className="hh-row">
          <Reveal trigger="intro" delay={1.1} className="lede hh-lede">
            A new-generation studio that builds the tech and shoots the story — websites, systems, films and content for brands, founders and independents.
          </Reveal>
        </div>
      </div>
    </section>
  )
}
