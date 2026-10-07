import { useEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import ShaderCanvas, { type ShaderFrame } from '@/gl/ShaderCanvas'
import { HERO_FRAG, heroStrandY, heroToScreen } from '@/gl/heroShader'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { SplitReveal, Reveal, whenRevealed } from '@/components/Reveal'
import { useIsMobile } from '@/lib/hooks'
import './hero.css'

// Service tags that ride the light strands — the breadth of NMYT at a glance.
// x is in units of half the viewport width (-1 = left edge, 1 = right edge)
const TAGS: { label: string; fam: 'A' | 'B'; fi: number; x: number }[] = [
  { label: 'Brand films', fam: 'B', fi: 0.96, x: -0.78 },
  { label: 'Product shoots', fam: 'B', fi: 0.06, x: -0.56 },
  { label: 'Social & ads', fam: 'B', fi: 0.7, x: -0.2 },
  { label: 'Websites', fam: 'A', fi: 0.98, x: 0.18 },
  { label: 'Short films', fam: 'B', fi: 0.25, x: 0.42 },
  { label: 'Dashboards', fam: 'A', fi: 0.04, x: 0.62 },
  { label: 'Landing pages', fam: 'A', fi: 0.96, x: 0.8 },
]

export default function HomeHero() {
  const root = useRef<HTMLElement>(null)
  const tagRefs = useRef<(HTMLDivElement | null)[]>([])
  const tc = useRef<HTMLSpanElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const state = useRef({ intro: 0, scroll: 0 })

  const uniforms = useMemo(() => ({ uIntro: { value: 0 }, uScroll: { value: 0 } }), [])

  // intro: light writes in after the loader
  useEffect(() => {
    const reduce = prefersReducedMotion()
    return whenRevealed(() => {
      gsap.to(state.current, { intro: 1, duration: reduce ? 2.2 : 3.2, ease: 'power2.inOut', delay: 0.1 })
      gsap.fromTo('.hh-tag', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, stagger: 0.12, delay: 1.6 })
    })
  }, [])

  // live timecode — launch-overlay detail
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const s = (performance.now() - t0) / 1000
      const f = Math.floor((s % 1) * 24)
      const pad = (n: number) => String(n).padStart(2, '0')
      if (tc.current) tc.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(f)}`
    }
    tick()
    return () => cancelAnimationFrame(raf)
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
    if (isMobile) return
    // place tags on their strands (mirror of shader maths)
    const { w, h } = f.size
    const aspect = w / h
    const ang = 0.16
    const zoom = 1 + state.current.scroll * 0.35
    const mxs = (f.mouse.x * 0.5 * aspect)
    const mys = f.mouse.y * 0.5
    // rotate mouse into q-space (same as shader: Rot(+0.16) · m / zoom)
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    const mqx = (c * mxs - s * mys) / zoom
    const mqy = (s * mxs + c * mys) / zoom
    const t = f.time * 0.16
    const copyTop = copyRef.current && root.current ? copyRef.current.getBoundingClientRect().top - root.current.getBoundingClientRect().top : h * 0.6
    TAGS.forEach((tag, i) => {
      const el = tagRefs.current[i]
      if (!el) return
      // screen-x → q-space x (approx: rotation is small, so solve along the strand's own axis)
      const qx = (tag.x * aspect * 0.5) / Math.cos(ang) / zoom
      const y = heroStrandY(tag.fam, tag.fi, qx, t, mqx, mqy, zoom)
      const { sx, sy } = heroToScreen(qx, y, w, h, zoom)
      el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`
      // keep labels readable: point away from nav / edges, fade over the headline
      const up = sy > h * 0.42
      const left = sx > w * 0.84
      if (el.dataset.up !== String(up)) el.dataset.up = String(up)
      if (el.dataset.left !== String(left)) el.dataset.left = String(left)
      // keep clear of the top HUD band and the headline block
      const labelBottom = up ? sy - 12 : sy + 80
      const labelTop = up ? sy - 80 : sy
      const fade = labelBottom > copyTop - 16 || labelTop < 150 || sy < 150 ? '0' : '1'
      if (el.dataset.vis !== fade) el.dataset.vis = fade
    })
  }

  return (
    <section ref={root} className="hh" data-theme="master">
      <ShaderCanvas fragment={HERO_FRAG} uniforms={uniforms as unknown as Record<string, THREE.IUniform>} onFrame={onFrame} dpr={1.5} follow={0.04} />

      {!isMobile && (
        <div className="hh-tags" aria-hidden>
          {TAGS.map((t, i) => (
            <div key={t.label} ref={(el) => void (tagRefs.current[i] = el)} className={`hh-tag hh-tag--${t.fam}`}>
              <i className="hh-tag-dot" />
              <span className="hh-tag-stem" />
              <span className="hh-tag-label mono">{t.label}</span>
            </div>
          ))}
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
