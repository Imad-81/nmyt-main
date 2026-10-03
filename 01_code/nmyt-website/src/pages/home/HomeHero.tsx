import { useEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import ShaderCanvas, { type ShaderFrame } from '@/gl/ShaderCanvas'
import { HERO_FRAG } from '@/gl/heroShader'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { SplitReveal, Reveal, whenRevealed } from '@/components/Reveal'
import './hero.css'

export default function HomeHero() {
  const root = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const state = useRef({ intro: 0, scroll: 0 })

  const uniforms = useMemo(() => ({ uIntro: { value: 0 }, uScroll: { value: 0 } }), [])

  // intro: light writes in after the loader
  useEffect(() => {
    const reduce = prefersReducedMotion()
    return whenRevealed(() => {
      gsap.to(state.current, { intro: 1, duration: reduce ? 2.2 : 3.2, ease: 'power2.inOut', delay: 0.1 })
    })
  }, [])

  useGSAP(
    () => {
      gsap.to(state.current, {
        scroll: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hh-copy', {
        yPercent: -18,
        autoAlpha: 0.0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  const onFrame = (f: ShaderFrame) => {
    const u = f.uniforms
    u.uIntro.value = state.current.intro
    u.uScroll.value = state.current.scroll
  }

  return (
    <section ref={root} className="hh" data-theme="master">
      <ShaderCanvas fragment={HERO_FRAG} uniforms={uniforms as unknown as Record<string, THREE.IUniform>} onFrame={onFrame} dpr={1.5} follow={0.04} />

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
      <div className="hh-fadeout" />
    </section>
  )
}
