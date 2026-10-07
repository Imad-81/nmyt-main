import { useEffect, useRef } from 'react'
import { MagneticButton } from '@/components/MagneticButton'
import { Reveal } from '@/components/Reveal'
import Footer from '@/components/Footer'
import './work/work.css'

const WORDS = ['Work', 'in', 'progress']

/**
 * /work. There is no client work to publish yet, so the page says so, properly:
 * one screen, the words breathing between light and bold, over a field of slow rings
 * that follow the pointer.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvas.current!
    const el = root.current!
    const g = c.getContext('2d')!
    let w = 1
    let h = 1
    let raf = 0
    let on = true
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
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
      const r = el.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = (e.clientY - r.top) / r.height
    }
    el.addEventListener('pointermove', move, { passive: true })

    const t0 = performance.now()
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (!on || document.hidden) return
      const t = (now - t0) / 1000
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, w, h)
      // rings in progress: each one is drawn only part of the way round, and keeps going
      const cx = w * (0.5 + (mouse.x - 0.5) * 0.12)
      const cy = h * (0.52 + (mouse.y - 0.5) * 0.12)
      const R = Math.hypot(w, h) * 0.62
      const N = 26
      g.lineCap = 'round'
      for (let i = 0; i < N; i++) {
        const f = i / (N - 1)
        const r = 40 + f * f * R
        const speed = (i % 2 ? -1 : 1) * (0.1 + (1 - f) * 0.22)
        const start = t * speed + i * 1.7
        const sweep = Math.PI * (0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.35 + i * 0.9)))
        const hue = i % 3
        g.strokeStyle = hue === 0 ? `rgba(22,180,255,${0.1 + 0.3 * (1 - f)})` : hue === 1 ? `rgba(0,224,138,${0.08 + 0.26 * (1 - f)})` : `rgba(207,239,255,${0.05 + 0.16 * (1 - f)})`
        g.lineWidth = 1 + (1 - f) * 1.2
        g.beginPath()
        g.ellipse(cx, cy, r, r * 0.86, 0, start, start + sweep)
        g.stroke()
        // the working end of each ring
        const ex = cx + Math.cos(start + sweep) * r
        const ey = cy + Math.sin(start + sweep) * r * 0.86
        g.fillStyle = hue === 1 ? 'rgba(124,255,58,.9)' : 'rgba(207,239,255,.9)'
        g.beginPath()
        g.arc(ex, ey, 1.4 + (1 - f) * 1.4, 0, Math.PI * 2)
        g.fill()
      }
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      el.removeEventListener('pointermove', move)
    }
  }, [])

  let n = 0
  return (
    <>
    <section ref={root} className="wip">
      <canvas ref={canvas} className="wip-canvas" aria-hidden />
      <div className="wip-shade" aria-hidden />
      <div className="wip-inner wrap">
        <h1 className="wip-title" aria-label="Work in progress">
          {WORDS.map((word) => (
            <span key={word} className="wip-word" aria-hidden>
              {word.split('').map((ch) => (
                <span key={n} className="wip-ch" style={{ animationDelay: `${(n++ * 0.11).toFixed(2)}s` }}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <Reveal trigger="intro" delay={0.5} className="wip-foot">
          <p className="wip-note">We are finishing our first projects. They will be shown here once they are out in the world, with the people we made them for.</p>
          <MagneticButton to="/contact" variant="light">
            Start a project
          </MagneticButton>
        </Reveal>
      </div>
    </section>
    <Footer />
    </>
  )
}
