import { useEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import ShaderCanvas, { type ShaderFrame } from '@/gl/ShaderCanvas'
import { CREATIVE_FRAG, PORTRAIT_FRAG } from '@/gl/creativeShader'
import { gsap, getLenis, prefersReducedMotion } from '@/lib/smooth'
import { SplitReveal, Reveal, whenRevealed } from '@/components/Reveal'
import { MagneticButton } from '@/components/MagneticButton'
import { Brackets } from '@/components/ui'
import { media } from '@/data/media'
import { useIsMobile } from '@/lib/hooks'
import { Scramble } from './fx'
import { glitchBurst } from './glitch'

type U = Record<string, THREE.IUniform>

function TitleCopy() {
  return (
    <>
      <span className="ch-line">Make them</span>
      <span className="ch-line">
        <em className="serif ch-em">look twice.</em>
      </span>
    </>
  )
}

export default function CreativeHero() {
  const root = useRef<HTMLElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const tc = useRef<HTMLSpanElement>(null)
  const isMobile = useIsMobile()
  const st = useRef({ intro: 0, scroll: 0, glitch: 0, reveal: 0, hover: 0, busy: false })
  const burst = useRef<gsap.core.Timeline | null>(null)

  const heroU = useMemo(() => ({ uIntro: { value: 0 }, uScroll: { value: 0 }, uGlitch: { value: 0 } }), [])
  const portU = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uHasTex: { value: 0 },
      uImgAspect: { value: 2 / 3 },
      uReveal: { value: 0 },
      uGlitch: { value: 0 },
      uHover: { value: 0 },
    }),
    [],
  )

  // portrait texture (falls back to a procedural silhouette if the file isn't there yet)
  useEffect(() => {
    let alive = true
    let tex: THREE.Texture | null = null
    new THREE.TextureLoader().load(
      media('creativePortrait', isMobile ? 'sm' : 'lg'),
      (t) => {
        if (!alive) return t.dispose()
        tex = t
        t.minFilter = THREE.LinearFilter
        t.generateMipmaps = false
        const img = t.image as HTMLImageElement
        portU.uTex.value = t
        portU.uImgAspect.value = img.width / img.height
        portU.uHasTex.value = 1
      },
      undefined,
      () => {},
    )
    return () => {
      alive = false
      tex?.dispose()
    }
  }, [isMobile, portU])

  const glitch = (strength = 1) => {
    if (prefersReducedMotion() || !title.current) return
    if (burst.current?.isActive()) return
    const layers = Array.from(title.current.querySelectorAll('.gl-layer'))
    const base = title.current.querySelector('.gl-base')
    burst.current = glitchBurst(base, layers, strength, (v) => (st.current.glitch = v))
  }

  // intro sequence + idle glitch pulses
  useEffect(() => {
    const reduce = prefersReducedMotion()
    const s = st.current
    const tags = root.current!.querySelectorAll('.ch-tag')
    if (!reduce) gsap.set(tags, { autoAlpha: 0, y: 14 })
    const off = whenRevealed(() => {
      gsap.to(s, { intro: 1, duration: reduce ? 1.6 : 3, ease: 'power2.inOut', delay: 0.05 })
      gsap.to(s, { reveal: 1, duration: reduce ? 0.8 : 1.9, ease: 'power2.inOut', delay: 0.5 })
      if (reduce) return
      gsap.to(tags, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out', delay: 1.1 })
      gsap.delayedCall(1.25, () => glitch(0.6))
      // no idle glitch loop — the glitch is an accent (intro + hover), not a constant
    })
    return () => {
      off()
      burst.current?.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // live timecode, paused off-screen
  useEffect(() => {
    const el = root.current!
    let on = true
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting))
    io.observe(el)
    const t0 = performance.now()
    let raf = 0
    const pad = (n: number) => String(n).padStart(2, '0')
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!on || !tc.current) return
      const sec = (performance.now() - t0) / 1000
      tc.current.textContent = `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(Math.floor(sec) % 60)}:${pad(Math.floor((sec % 1) * 24))}`
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const trig = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to(st.current, { scroll: 1, ease: 'none', scrollTrigger: trig })
      gsap.to('.ch-copy', { yPercent: -16, autoAlpha: 0, ease: 'none', scrollTrigger: trig })
      gsap.to('.ch-port', { yPercent: 12, scale: 1.06, ease: 'none', scrollTrigger: trig })
      gsap.to('.ch-top', { y: -60, autoAlpha: 0, ease: 'none', scrollTrigger: { ...trig, end: '40% top' } })
    },
    { scope: root },
  )

  const onHero = (f: ShaderFrame) => {
    const u = f.uniforms
    u.uIntro.value = st.current.intro
    u.uScroll.value = st.current.scroll
    u.uGlitch.value = st.current.glitch
  }
  const onPort = (f: ShaderFrame) => {
    const u = f.uniforms
    const inside = Math.abs(f.mouse.x) < 1 && Math.abs(f.mouse.y) < 1 ? 1 : 0
    st.current.hover += (inside - st.current.hover) * 0.08
    u.uHover.value = st.current.hover
    u.uReveal.value = st.current.reveal
    u.uGlitch.value = st.current.glitch
  }

  const toWork = () => {
    const el = document.getElementById('cr-work')
    if (!el) return
    const l = getLenis()
    if (l) l.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={root} className="ch" data-theme="creative">
      <ShaderCanvas fragment={CREATIVE_FRAG} uniforms={heroU as unknown as U} onFrame={onHero} dpr={1.5} follow={0.05} />

      <div className="ch-port" aria-hidden>
        <ShaderCanvas fragment={PORTRAIT_FRAG} uniforms={portU as unknown as U} onFrame={onPort} dpr={1.5} follow={0.12} transparent />
        <div className="ch-port-hud">
          <Brackets color="rgba(124,255,58,.55)" size={16} />
          <span className="mono ch-port-l1">
            <i className="ch-dots">
              <b />
              <b />
            </i>
            SYS_02
          </span>
          <span className="mono ch-port-l2">CAM_A — 2:3 — HALFTONE</span>
        </div>
      </div>

      <div className="ch-top wrap">
        <Reveal trigger="intro" className="ch-top-inner" childSelector=".ch-fade" delay={0.4}>
          <div className="ch-fade mono ch-kicker">
            <Scramble text="//CREATIVE_STUDIO" trigger="intro" delay={0.5} className="ch-acid" hover />
            <span className="ch-sub">NMYT — Channel 02</span>
          </div>
          <ul className="ch-fade mono ch-sys">
            <li>
              <b>Signal</b> Live
            </li>
            <li>
              <b>Mode</b> Creative
            </li>
            <li>
              <b>Out</b> 16:9 · 9:16 · 1:1
            </li>
          </ul>
        </Reveal>
      </div>

      <div className="ch-copy wrap">
        <div className="ch-tagrow mono" aria-hidden>
          <span className="ch-tag">[ Film ]</span>
          <span className="ch-tag">[ Content ]</span>
          <span className="ch-tag">[ Brand ]</span>
          <span className="ch-tag ch-tag--blink">_</span>
        </div>
        <h1 ref={title} className="display ch-title" onPointerEnter={() => glitch(0.8)} aria-label="Make them look twice.">
          <span className="gl-base" aria-hidden>
            <SplitReveal as="span" className="ch-line" type="chars" trigger="intro" delay={0.2} stagger={0.028} duration={1.3}>
              Make them
            </SplitReveal>
            <SplitReveal as="span" className="ch-line" type="chars" trigger="intro" delay={0.42} stagger={0.028} duration={1.3}>
              <em className="serif ch-em">look twice.</em>
            </SplitReveal>
          </span>
          <span className="gl-layer gl-layer--a" aria-hidden>
            <TitleCopy />
          </span>
          <span className="gl-layer gl-layer--b" aria-hidden>
            <TitleCopy />
          </span>
        </h1>

        <div className="ch-row">
          <Reveal trigger="intro" delay={1} className="ch-left">
            <p className="lede ch-lede">
              <span className="ch-hl">Brand films, product shoots, social, ads and identity.</span> Concept to final grade, made under one roof — built to stop the scroll.
            </p>
            <div className="ch-ctas">
              <MagneticButton to="/contact" variant="acid">
                Start a project
              </MagneticButton>
              <MagneticButton onClick={toWork} variant="ghost">
                See the work
              </MagneticButton>
            </div>
          </Reveal>
          <Reveal trigger="intro" delay={1.2} className="ch-meta mono" childSelector=".ch-m">
            <div className="ch-m ch-box">
              <span>Every frame</span>
              <span>on purpose.</span>
              <em>CH_02_</em>
            </div>
            <div className="ch-m ch-tc">
              <i /> REC <span ref={tc}>00:00:00:00</span>
            </div>
          </Reveal>
        </div>
      </div>
      <div className="ch-scan" aria-hidden />
      <div className="ch-fadeout" aria-hidden />
    </section>
  )
}
