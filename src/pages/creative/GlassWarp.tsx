import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import ShaderCanvas, { type ShaderFrame } from '@/gl/ShaderCanvas'
import { WARP_FRAG } from '@/gl/creativeShader'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { MonoLabel } from '@/components/ui'
import { Reveal } from '@/components/Reveal'
import { CREATIVE_SERVICES } from '@/data/site'
import { useIsMobile } from '@/lib/hooks'
import { Scramble } from './fx'

type U = Record<string, THREE.IUniform>

/** Paint the giant type into a canvas the warp shader samples from. */
async function paintType(narrow: boolean) {
  try {
    await document.fonts.load('900 200px "Archivo Variable"')
  } catch {
    /* fall back to whatever is available */
  }
  const W = narrow ? 1200 : 2400
  const H = narrow ? 1900 : 1450
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if ('fontStretch' in ctx) ctx.fontStretch = 'condensed'
  const rows = narrow ? ['NMYT', 'NMYT', 'NMYT', 'NMYT'] : ['CREATIVE', 'CREATIVE', 'CREATIVE']
  const rowH = H / rows.length
  const font = (s: number) => `900 ${s}px "Archivo Variable", "Arial Narrow", sans-serif`
  let size = rowH * 1.18
  ctx.font = font(size)
  const mw = ctx.measureText(rows[0]).width
  size = Math.min(size, (size * W * 0.96) / mw)
  ctx.font = font(size)
  rows.forEach((r, i) => {
    const dx = i % 2 ? W * 0.035 : -W * 0.02
    ctx.fillText(r, W / 2 + dx, rowH * (i + 0.5) + size * 0.03)
  })
  return c
}

export default function GlassWarp() {
  const root = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()
  const vel = useRef({ x: 0, y: 0, v: 0 })
  const reduce = useMemo(() => prefersReducedMotion(), [])
  const u = useMemo(
    () => ({
      uText: { value: null as THREE.Texture | null },
      uTextAspect: { value: 1.6 },
      uReady: { value: 0 },
      uVel: { value: 0 },
      uCalm: { value: reduce ? 1 : 0 },
    }),
    [reduce],
  )

  useEffect(() => {
    let alive = true
    let tex: THREE.CanvasTexture | null = null
    paintType(isMobile).then((c) => {
      if (!alive) return
      tex = new THREE.CanvasTexture(c)
      tex.minFilter = THREE.LinearFilter
      tex.generateMipmaps = false
      const prev = u.uText.value
      u.uText.value = tex
      u.uTextAspect.value = c.width / c.height
      prev?.dispose()
      gsap.fromTo(u.uReady, { value: 0 }, { value: 1, duration: 1.6, ease: 'power2.out' })
    })
    return () => {
      alive = false
      if (tex && u.uText.value === tex) u.uText.value = null
      tex?.dispose()
    }
  }, [isMobile, u])

  const onFrame = (f: ShaderFrame) => {
    // slow the clock right down for reduced motion
    if (reduce) f.uniforms.uTime.value -= f.dt * 0.85
    const v = vel.current
    const dx = f.mouse.x - v.x
    const dy = f.mouse.y - v.y
    v.x = f.mouse.x
    v.y = f.mouse.y
    const speed = Math.min(1, (Math.hypot(dx, dy) / Math.max(f.dt, 0.001)) * 0.35)
    v.v += (speed - v.v) * 0.06
    f.uniforms.uVel.value = reduce ? 0 : v.v
  }

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.gw-card')
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: reduce ? 16 : 90, filter: reduce ? 'none' : 'blur(16px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out', stagger: 0.14, scrollTrigger: { trigger: root.current, start: 'top 65%', once: true }, clearProps: 'filter' },
      )
      if (reduce) return
      // depth: cards drift at different rates
      cards.forEach((c) => {
        const d = Number(c.dataset.depth ?? 0)
        gsap.fromTo(c.querySelector('.gw-float'), { yPercent: d * 18 }, { yPercent: -d * 18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      // hairlines inside cards draw in
      gsap.fromTo('.gw-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut', stagger: 0.08, scrollTrigger: { trigger: root.current, start: 'top 55%', once: true } })
    },
    { scope: root },
  )

  // pointer tilt
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = root.current!.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    gsap.to(root.current!.querySelectorAll('.gw-tilt'), { rotateY: nx * 8, rotateX: -ny * 8, duration: 1, ease: 'power3.out', overwrite: 'auto' })
  }
  const onLeave = () => gsap.to(root.current!.querySelectorAll('.gw-tilt'), { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'power3.out', overwrite: 'auto' })

  return (
    <section ref={root} className="gw" onPointerMove={onMove} onPointerLeave={onLeave}>
      <ShaderCanvas fragment={WARP_FRAG} uniforms={u as unknown as U} onFrame={onFrame} dpr={1.25} follow={0.07} />
      <div className="gw-shade" aria-hidden />

      <div className="wrap gw-inner">
        <Reveal className="gw-head">
          <MonoLabel index="01" color="var(--acid)">
            The studio
          </MonoLabel>
          <div className="hairline flex-1" />
          <span className="mono gw-head-r">NMYT/CREATIVE</span>
        </Reveal>

        <div className="gw-stage">
          <Link to="/contact" className="gw-card gw-bar" data-depth="0.6" data-cursor-hover>
            <div className="gw-float">
              <div className="gw-tilt gw-glass gw-bar-in">
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
                  <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M13 13l5 5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span className="gw-bar-txt">
                  brief@nmyt:~$ <b>start_project</b>
                  <i className="gw-caret" />
                </span>
                <span className="gw-bar-go" aria-hidden>
                  →
                </span>
              </div>
            </div>
          </Link>

          <div className="gw-card gw-a" data-depth="1">
            <div className="gw-float">
              <div className="gw-tilt gw-glass">
                <Scramble as="div" className="mono gw-t" text="NMYT CREATIVE" />
                <div className="gw-rule" />
                <Scramble as="div" className="mono gw-t gw-dim" text="DISCIPLINES" delay={0.15} />
                <ul className="gw-list">
                  {CREATIVE_SERVICES.map((s) => (
                    <li key={s.n}>
                      <span className="gw-check" aria-hidden>
                        ✓
                      </span>
                      {s.title}
                    </li>
                  ))}
                </ul>
                <div className="gw-rule" />
                <Scramble as="div" className="mono gw-t gw-dim" text="STATUS" delay={0.3} />
                <div className="gw-status">
                  <i className="gw-live" aria-hidden />
                  Open for new projects
                </div>
                <div className="gw-rule" />
                <div className="mono gw-foot">CH_02 // ONLINE</div>
              </div>
            </div>
          </div>

          <div className="gw-card gw-b" data-depth="-0.8">
            <div className="gw-float">
              <div className="gw-tilt gw-glass">
                <Scramble as="div" className="mono gw-t" text="SYSTEM INFORMATION" delay={0.2} />
                <div className="gw-rule" />
                <dl className="gw-dl mono">
                  <div>
                    <dt>Mode</dt>
                    <dd>In-house</dd>
                  </div>
                  <div>
                    <dt>Pipeline</dt>
                    <dd>Idea → Grade</dd>
                  </div>
                  <div>
                    <dt>Output</dt>
                    <dd>Film · Stills</dd>
                  </div>
                  <div>
                    <dt>Formats</dt>
                    <dd>16:9 · 9:16 · 1:1</dd>
                  </div>
                </dl>
                <div className="gw-rule" />
                <div className="mono gw-t gw-acid">
                  Made by hand,
                  <br />
                  not by template
                </div>
              </div>
            </div>
          </div>

          <Reveal className="gw-copy" delay={0.2}>
            <p className="gw-state display">
              One team.
              <br />
              <em className="serif">Idea to final grade.</em>
            </p>
            <p className="gw-sub">Fewer hand-offs, one visual language, so the film, the feed and the identity all look like the same brand.</p>
          </Reveal>
        </div>

        <div className="gw-bottom mono" aria-hidden>
          Film • Stills • Social • Ads • Identity • Motion
        </div>
      </div>
    </section>
  )
}
