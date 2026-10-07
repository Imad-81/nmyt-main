import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, getLenis, prefersReducedMotion } from '@/lib/smooth'
import { Reveal, whenRevealed } from '@/components/Reveal'
import { MagneticButton } from '@/components/MagneticButton'
import { Scramble } from './fx'

/**
 * The headline block. Rendered twice in the same box: once as colour-filled type on black,
 * once inverted (black type on the colour field) and revealed only inside the moving lens.
 */
function Copy({ ghost = false, onWork, tc }: { ghost?: boolean; onWork?: () => void; tc?: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div className={`ch-copy wrap ${ghost ? 'ch-copy--ghost' : ''}`} aria-hidden={ghost || undefined} inert={ghost || undefined}>
      <div className="ch-tagrow mono ch-in" aria-hidden>
        <span>[ Film ]</span>
        <span>[ Content ]</span>
        <span>[ Brand ]</span>
        <span className="ch-tag--blink">_</span>
      </div>
      {ghost ? (
        <div className="display ch-title">
          <span className="ch-line">Make them</span>
          <span className="ch-line">
            <em className="serif ch-em">look twice.</em>
          </span>
        </div>
      ) : (
        <h1 className="display ch-title ch-title--fill">
          <span className="ch-line ch-field">Make them</span>
          <span className="ch-line ch-field">
            <em className="serif ch-em">look twice.</em>
          </span>
        </h1>
      )}
      <div className="ch-row ch-in">
        <div className="ch-left">
          <p className="lede ch-lede">
            <span className="ch-strong">Brand films, product shoots, social, ads and identity.</span> Concept to final grade, made under one roof and built to stop the scroll.
          </p>
          <div className="ch-ctas">
            <MagneticButton to="/contact?studio=creative" variant="acid">
              Start a project
            </MagneticButton>
            <MagneticButton onClick={onWork} variant="ghost">
              See the work
            </MagneticButton>
          </div>
        </div>
        <div className="ch-meta mono">
          <div className="ch-tc">
            <i /> REC <span ref={tc}>00:00:00:00</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreativeHero() {
  const root = useRef<HTMLElement>(null)
  const tc = useRef<HTMLSpanElement>(null)

  // the inversion lens: follows the pointer; drifts on its own on touch screens
  useEffect(() => {
    const el = root.current!
    const reduce = prefersReducedMotion()
    const cur = { x: 0, y: 0, r: 0 }
    const to = { x: 0, y: 0, r: 0 }
    let on = false
    let inside = false
    let raf = 0
    let w = 1
    let h = 1
    // the headline's box inside the hero: the idle lens stays on the type, off the body copy
    const tb = { cy: 0, h: 1 }
    const measure = () => {
      const r = el.getBoundingClientRect()
      w = r.width
      h = r.height
      const t = el.querySelector('.ch-title')?.getBoundingClientRect()
      if (t) {
        tb.cy = t.top - r.top + t.height * 0.46
        tb.h = t.height
      }
    }
    measure()
    const radius = () => Math.max(110, Math.min(w, h) * 0.2)
    const idleR = () => Math.min(radius(), tb.h * 0.5)
    cur.x = to.x = w * 0.72
    cur.y = to.y = tb.cy
    const apply = () => {
      el.style.setProperty('--lx', `${cur.x.toFixed(1)}px`)
      el.style.setProperty('--ly', `${cur.y.toFixed(1)}px`)
      el.style.setProperty('--lr', `${Math.max(0, cur.r).toFixed(1)}px`)
    }
    if (reduce) {
      cur.r = idleR()
      apply()
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!on) return
      if (!inside) {
        // idle drift across the headline
        const t = (now - t0) / 1000
        to.x = w * (0.5 + 0.34 * Math.sin(t * 0.42))
        to.y = tb.cy + tb.h * 0.1 * Math.sin(t * 0.67 + 1.2)
        to.r = idleR()
      }
      cur.x += (to.x - cur.x) * 0.09
      cur.y += (to.y - cur.y) * 0.09
      cur.r += (to.r - cur.r) * 0.07
      apply()
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      inside = true
      to.x = e.clientX - r.left
      to.y = e.clientY - r.top
      to.r = radius()
    }
    const leave = () => (inside = false)
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave)
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting
      el.classList.toggle('is-off', !on)
    })
    io.observe(el)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const offIntro = whenRevealed(() => {
      raf = requestAnimationFrame(tick)
    })
    return () => {
      offIntro()
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  // live timecode, paused off-screen
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
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()
      gsap.set(q('.ch-line'), { yPercent: reduce ? 0 : 60, autoAlpha: 0 })
      gsap.set(q('.ch-in'), { autoAlpha: 0, y: reduce ? 0 : 18 })
      const off = whenRevealed(() => {
        gsap.to(q('.ch-line'), { yPercent: 0, autoAlpha: 1, duration: reduce ? 0.8 : 1.5, ease: 'expo.out', stagger: 0.1, delay: 0.15, clearProps: 'transform' })
        gsap.to(q('.ch-in'), { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.7 })
      })
      if (!reduce) {
        const trig = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
        gsap.to(q('.ch-copy'), { yPercent: -12, ease: 'none', scrollTrigger: trig })
        gsap.to(q('.ch-top'), { y: -50, autoAlpha: 0, ease: 'none', scrollTrigger: { ...trig, end: '40% top' } })
      }
      return off
    },
    { scope: root },
  )

  const toWork = () => {
    const el = document.getElementById('cr-work')
    if (!el) return
    const l = getLenis()
    if (l) l.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={root} className="ch" data-theme="creative">
      <div className="ch-top wrap">
        <Reveal trigger="intro" className="ch-top-inner" childSelector=".ch-fade" delay={0.4}>
          <div className="ch-fade mono ch-kicker">
            <Scramble text="//CREATIVE_STUDIO" trigger="intro" delay={0.5} className="ch-acid" hover />
            <span className="ch-sub">NMYT / Channel 02</span>
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

      <Copy onWork={toWork} tc={tc} />

      {/* the lens: same block, colours inverted */}
      <div className="ch-inv ch-field" aria-hidden>
        <Copy ghost />
      </div>
      <div className="ch-fadeout" aria-hidden />
    </section>
  )
}
