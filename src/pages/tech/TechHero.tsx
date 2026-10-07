import { useEffect, useMemo, useRef } from 'react'
import type { IUniform } from 'three'
import { useGSAP } from '@gsap/react'
import ShaderCanvas, { type ShaderFrame } from '@/gl/ShaderCanvas'
import { TECH_FRAG } from '@/gl/techShader'
import { gsap } from '@/lib/smooth'
import { SplitReveal, Reveal, whenRevealed } from '@/components/Reveal'
import { Brackets } from '@/components/ui'

/** The statement the light resolves into. Lives inside the sticky hero (scrubbed) or as its own section (reduced motion). */
export function TechStatement() {
  return (
    <div className="th-state wrap">
      <div className="mono th-state-k th-af">
        <span>[</span> The studio <span>]</span>
      </div>
      <h2 className="display th-state-t">
        <span className="mask-line">
          <span className="th-sl">Fast. Clear.</span>
        </span>
        <span className="mask-line">
          <span className="th-sl">
            <em className="serif">Yours.</em>
          </span>
        </span>
      </h2>
      <p className="lede th-state-l th-af">We design, build and look after the web side of your business, so it loads fast, reads clearly and does its job.</p>
    </div>
  )
}

export default function TechHero({ reduce }: { reduce: boolean }) {
  const root = useRef<HTMLElement>(null)
  const state = useRef({ intro: 0, scroll: 0 })
  const drawn = useRef(0)
  const uniforms = useMemo<Record<string, IUniform>>(() => ({ uIntro: { value: 0 }, uScroll: { value: 0 } }), [])

  // horizon rises into frame once the loader is gone
  useEffect(() => {
    let tw: gsap.core.Tween | undefined
    const off = whenRevealed(() => {
      tw = gsap.to(state.current, { intro: 1, duration: reduce ? 1.8 : 3.4, ease: 'power3.out', delay: 0.05 })
    })
    return () => {
      off()
      tw?.kill()
    }
  }, [reduce])

  useGSAP(
    () => {
      if (reduce) return
      // explicit start states — late tweens in a scrubbed timeline don't pre-render
      gsap.set('.th-sl', { yPercent: 118 })
      gsap.set('.th-af', { autoAlpha: 0, y: 24 })
      gsap.set('.th-paper', { autoAlpha: 0 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      })
      tl.to(state.current, { scroll: 1, duration: 1 }, 0)
        .to('.th-copy', { yPercent: -22, autoAlpha: 0, duration: 0.28, ease: 'power1.in' }, 0.02)
        .to('.th-hud', { autoAlpha: 0, duration: 0.2 }, 0.06)
        .fromTo('.th-sl', { yPercent: 118 }, { yPercent: 0, duration: 0.14, stagger: 0.035, ease: 'power3.out' }, 0.74)
        .fromTo('.th-af', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.03, ease: 'power2.out' }, 0.8)
        .to('.th-paper', { autoAlpha: 1, duration: 0.06 }, 0.86)
    },
    { scope: root, dependencies: [reduce] },
  )

  const onFrame = (f: ShaderFrame) => {
    const sc = state.current.scroll
    f.uniforms.uIntro.value = state.current.intro
    f.uniforms.uScroll.value = sc
    // once the frame is pure paper there is nothing left to animate: stop drawing
    const idle = sc >= 0.995 && drawn.current >= 0.995
    drawn.current = sc
    return !idle
  }

  return (
    <section ref={root} className={`th ${reduce ? 'th--static' : ''}`} aria-label="Tech Studio">
      <div className="th-stick">
        <div className="th-fallback" aria-hidden />
        <ShaderCanvas fragment={TECH_FRAG} uniforms={uniforms} onFrame={onFrame} dpr={1.25} follow={0.05} />
        <div className="th-paper" aria-hidden />

        <div className="th-frame th-hud" aria-hidden>
          <Brackets color="rgba(207,239,255,.32)" size={16} />
        </div>

        <div className="th-top wrap th-hud">
          <Reveal trigger="intro" className="th-top-in" childSelector=".th-fade" delay={0.5}>
            <div className="th-fade mono th-kicker">
              <span className="th-br">[</span> 01 / Tech Studio <span className="th-br">]</span>
            </div>
            <ul className="th-fade th-index mono">
              <li>Landing pages</li>
              <li>Websites</li>
              <li>Dashboards &amp; systems</li>
            </ul>
          </Reveal>
        </div>

        <div className="th-copy wrap">
          <h1 className="display th-title">
            <SplitReveal as="span" className="th-line" type="chars" trigger="intro" delay={0.2} stagger={0.03} duration={1.4}>
              Built to
            </SplitReveal>
            <SplitReveal as="span" className="th-line" type="chars" trigger="intro" delay={0.45} stagger={0.035} duration={1.5}>
              <em className="serif th-em">perform.</em>
            </SplitReveal>
          </h1>
          <Reveal trigger="intro" delay={1.05} className="lede th-lede">
            Landing pages, websites and simple dashboards &amp; systems for brands, founders and independent businesses.
          </Reveal>
        </div>

        <div className="th-foot wrap th-hud">
          <Reveal trigger="intro" delay={1.3} className="th-foot-in mono" childSelector=".th-m">
            <span className="th-m th-scroll">
              Scroll <em />
            </span>
            <span className="th-m th-foot-r">Design · Build · Care</span>
          </Reveal>
        </div>

        {!reduce && (
          <div className="th-after">
            <TechStatement />
          </div>
        )}
      </div>
    </section>
  )
}
