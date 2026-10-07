import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import type { DomeHero } from '@/gl/domeHero'
import { gsap } from '@/lib/smooth'
import { Reveal, whenRevealed } from '@/components/Reveal'
import { MagneticButton } from '@/components/MagneticButton'
import './hero.css'

export default function HomeHero() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const state = useRef({ intro: 0, scroll: 0 })
  const [poster, setPoster] = useState(false)

  // the scene: WebGL when available, a still poster of the real logo when not
  useEffect(() => {
    let dome: DomeHero | null = null
    let gone = false
    // three.js loads beside the page, never in front of it
    import('@/gl/domeHero')
      .then(({ createDomeHero }) => {
        if (gone) return
        dome = createDomeHero(stage.current!, state.current, { onLost: () => setPoster(true) })
        if (!dome) setPoster(true)
      })
      .catch(() => setPoster(true))
    const off = whenRevealed(() => {
      gsap.to(state.current, { intro: 1, duration: 3, ease: 'power2.out', delay: 0.1 })
    })
    return () => {
      gone = true
      off()
      gsap.killTweensOf(state.current)
      dome?.dispose()
      dome = null
    }
  }, [])

  useGSAP(
    () => {
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to(state.current, { scroll: 1, ease: 'none', scrollTrigger: st })
      gsap.to('.hh-copy', { y: -40, autoAlpha: 0, ease: 'none', scrollTrigger: st })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hh" data-theme="master">
      <div ref={stage} className="hh-stage" aria-hidden />
      {poster && (
        <div className="hh-poster" aria-hidden>
          <img src="/brand/nmyt-logo-hq.webp" alt="" draggable={false} />
        </div>
      )}

      <div className="hh-copy wrap">
        <Reveal trigger="intro" delay={0.5} as="h1" className="display hh-title">
          Where code meets cinema.
        </Reveal>
        <Reveal trigger="intro" delay={0.7} className="lede hh-lede">
          A new-generation studio that builds the tech and shoots the story. Websites, systems, films and content, made by one team to one standard.
        </Reveal>
        <Reveal trigger="intro" delay={0.9} className="hh-ctas">
          <MagneticButton to="/contact" variant="light">
            Start a project
          </MagneticButton>
          <MagneticButton to="/work" variant="ghost">
            See the work
          </MagneticButton>
        </Reveal>
      </div>
      <div className="hh-fadeout" />
    </section>
  )
}
