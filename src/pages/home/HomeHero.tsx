import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { createDomeHero, type DomeHero } from '@/gl/domeHero'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { SplitReveal, Reveal, whenRevealed } from '@/components/Reveal'
import './hero.css'

export default function HomeHero() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tc = useRef<HTMLSpanElement>(null)
  const state = useRef({ intro: 0, scroll: 0 })
  const [poster, setPoster] = useState(false)

  // the dome: WebGL when available, a still poster of the real logo when not
  useEffect(() => {
    const reduce = prefersReducedMotion()
    let dome: DomeHero | null = createDomeHero(stage.current!, state.current, { reduce, onLost: () => setPoster(true) })
    if (!dome) setPoster(true)
    const off = whenRevealed(() => {
      gsap.to(state.current, { intro: 1, duration: reduce ? 1.6 : 3.4, ease: 'power2.out', delay: 0.1 })
    })
    return () => {
      off()
      gsap.killTweensOf(state.current)
      dome?.dispose()
      dome = null
    }
  }, [])

  // live timecode — launch-overlay detail (sleeps off-screen)
  useEffect(() => {
    let on = true
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting))
    io.observe(root.current!)
    const t0 = performance.now()
    const pad = (n: number) => String(n).padStart(2, '0')
    const id = window.setInterval(() => {
      if (!on || !tc.current) return
      const s = (performance.now() - t0) / 1000
      tc.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * 24))}`
    }, 1000 / 24)
    return () => {
      window.clearInterval(id)
      io.disconnect()
    }
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to(state.current, { scroll: 1, ease: 'none', scrollTrigger: st })
      gsap.to('.hh-copy', { yPercent: -14, autoAlpha: 0, ease: 'none', scrollTrigger: st })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hh" data-theme="master">
      <div ref={stage} className="hh-stage" aria-hidden />
      {poster && (
        <div className="hh-poster" aria-hidden>
          <i />
          <i />
          <i />
          <img src="/brand/nmyt-logo-hq.webp" alt="" draggable={false} />
        </div>
      )}

      <div className="hh-top wrap">
        <Reveal trigger="intro" className="hh-top-inner" childSelector=".hh-fade" delay={0.5}>
          <div className="hh-fade mono hh-kicker">
            <span className="hh-bracket">[</span> New gen digital studio <span className="hh-bracket">]</span>
          </div>
          <ul className="hh-fade hh-index mono">
            <li>
              <b>01</b> Tech Studio
            </li>
            <li>
              <b className="is-g">02</b> Creative Studio
            </li>
            <li>
              <b className="is-w">03</b> NMYT Originals
            </li>
          </ul>
        </Reveal>
      </div>

      <div className="hh-copy wrap">
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
          <Reveal trigger="intro" delay={1.3} className="hh-meta mono" childSelector=".hh-m">
            <span className="hh-m hh-tc">
              <i /> REC <span ref={tc}>00:00:00:00</span>
            </span>
            <span className="hh-m hh-scroll">
              Scroll <em />
            </span>
          </Reveal>
        </div>
      </div>
      <div className="hh-fadeout" />
    </section>
  )
}
