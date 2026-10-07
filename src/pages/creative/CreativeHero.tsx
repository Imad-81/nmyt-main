import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, getLenis } from '@/lib/smooth'
import { whenRevealed } from '@/components/Reveal'
import { MagneticButton } from '@/components/MagneticButton'

/**
 * Creative Studio hero. A white studio wall and one drawn object: a form made of thin ink
 * lines that never quite settles, with a single green stroke running through it.
 * It turns with the pointer. The headline sits quietly beside it.
 */
export default function CreativeHero() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  // the nav switches to ink while the white hero is under it
  useEffect(() => {
    const el = root.current!
    const io = new IntersectionObserver(([e]) => (document.documentElement.dataset.navtone = e.intersectionRatio > 0.12 ? 'ink' : ''), { threshold: [0, 0.12, 0.3] })
    io.observe(el)
    return () => {
      io.disconnect()
      document.documentElement.dataset.navtone = ''
    }
  }, [])

  useEffect(() => {
    const c = canvas.current!
    const el = root.current!
    const g = c.getContext('2d')!
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const LINES = mobile ? 90 : 150
    const PTS = mobile ? 70 : 96
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75)
    let w = 1
    let h = 1
    let raf = 0
    let on = true
    const st = { intro: 0 }
    const m = { x: 0, y: 0, tx: 0, ty: 0 }

    // each line is a tilted ring on a sphere, with its own wobble
    const rings = Array.from({ length: LINES }, (_, i) => ({
      tilt: Math.random() * Math.PI,
      turn: Math.random() * Math.PI * 2,
      rad: 0.72 + Math.random() * 0.3,
      amp: 0.04 + Math.random() * 0.16,
      freq: 2 + Math.floor(Math.random() * 5),
      phase: Math.random() * Math.PI * 2,
      speed: (Math.random() - 0.5) * 0.5,
      green: i % 37 === 5,
      alpha: 0.1 + Math.random() * 0.34,
    }))

    const resize = () => {
      const r = el.getBoundingClientRect()
      w = r.width
      h = r.height
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting))
    io.observe(el)
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      m.tx = (e.clientX - r.left) / r.width - 0.5
      m.ty = (e.clientY - r.top) / r.height - 0.5
    }
    el.addEventListener('pointermove', move, { passive: true })
    const off = whenRevealed(() => gsap.to(st, { intro: 1, duration: 2.6, ease: 'power2.out' }))

    const t0 = performance.now()
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (!on || document.hidden) return
      const t = (now - t0) / 1000
      const intro = st.intro
      m.x += (m.tx - m.x) * 0.05
      m.y += (m.ty - m.y) * 0.05
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, w, h)
      const land = w > h * 1.05
      const cx = land ? w * 0.7 : w * 0.5
      const cy = land ? h * 0.5 : h * 0.34
      const S = Math.min(land ? w * 0.27 : w * 0.42, h * (land ? 0.4 : 0.25))
      const ry = t * 0.12 + m.x * 1.3
      const rx = -0.35 + m.y * 0.9
      const cyy = Math.cos(ry)
      const syy = Math.sin(ry)
      const cxx = Math.cos(rx)
      const sxx = Math.sin(rx)
      g.lineJoin = 'round'
      const shown = Math.ceil(LINES * Math.min(1, intro * 1.4))
      for (let i = 0; i < shown; i++) {
        const r = rings[i]
        const ct = Math.cos(r.tilt)
        const sn = Math.sin(r.tilt)
        const cu = Math.cos(r.turn + t * r.speed * 0.3)
        const su = Math.sin(r.turn + t * r.speed * 0.3)
        g.beginPath()
        const drawn = Math.max(0, Math.min(1, intro * 1.6 - (i / LINES) * 0.6))
        const n = Math.max(2, Math.floor(PTS * drawn))
        for (let k = 0; k <= n; k++) {
          const a = (k / PTS) * Math.PI * 2
          const wob = 1 + r.amp * Math.sin(a * r.freq + r.phase + t * (0.5 + r.speed))
          // ring in its own plane, then tilt about X and turn about Z
          const x0 = Math.cos(a) * r.rad * wob
          const y0 = Math.sin(a) * r.rad * wob
          const z0 = r.amp * 0.8 * Math.cos(a * (r.freq - 1) + t * 0.4 + r.phase)
          const y1 = y0 * ct - z0 * sn
          const z1 = y0 * sn + z0 * ct
          const x2 = x0 * cu - y1 * su
          const y2 = x0 * su + y1 * cu
          // scene rotation: Y then X
          const x3 = x2 * cyy + z1 * syy
          const z3 = -x2 * syy + z1 * cyy
          const y4 = y2 * cxx - z3 * sxx
          const z4 = y2 * sxx + z3 * cxx
          const p = 1 / (1 + z4 * 0.28)
          const px = cx + x3 * S * p
          const py = cy + y4 * S * p
          if (k === 0) g.moveTo(px, py)
          else g.lineTo(px, py)
        }
        if (r.green) {
          g.strokeStyle = 'rgba(0, 200, 90, 0.95)'
          g.lineWidth = 1.6
        } else {
          g.strokeStyle = `rgba(8, 12, 20, ${r.alpha})`
          g.lineWidth = 0.7
        }
        g.stroke()
      }
    }
    raf = requestAnimationFrame(draw)
    return () => {
      off()
      gsap.killTweensOf(st)
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      el.removeEventListener('pointermove', move)
    }
  }, [])

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.set(q('.ch-line'), { y: 30, autoAlpha: 0 })
      gsap.set(q('.ch-in'), { autoAlpha: 0, y: 16 })
      const off = whenRevealed(() => {
        gsap.to(q('.ch-line'), { y: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.2 })
        gsap.to(q('.ch-in'), { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.7 })
      })
      return off
    },
    { scope: root },
  )

  const toWork = () => {
    const el = document.getElementById('cr-work')
    if (!el) return
    const l = getLenis()
    if (l) l.scrollTo(el, { duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={root} className="ch" data-theme="creative">
      <canvas ref={canvas} className="ch-canvas" aria-hidden />
      <div className="ch-copy wrap">
        <p className="ch-kicker ch-in">Creative Studio</p>
        <h1 className="ch-title">
          <span className="ch-line">we make them</span>
          <span className="ch-line">
            look <em>twice.</em>
          </span>
        </h1>
        <p className="ch-lede ch-in">Brand films, product shoots, social, ads and identity. Concept to final grade, made under one roof.</p>
        <div className="ch-ctas ch-in">
          <MagneticButton to="/contact?studio=creative" variant="dark">
            Start a project
          </MagneticButton>
          <button type="button" className="ch-link" onClick={toWork}>
            See what we make
          </button>
        </div>
      </div>
      <div className="ch-fadeout" aria-hidden />
    </section>
  )
}
