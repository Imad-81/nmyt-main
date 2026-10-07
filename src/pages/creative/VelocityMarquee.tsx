import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/smooth'

const WORDS = ['Brand films', 'Product shoots', 'Social', 'Ads', 'Brand design', 'Cinematics']

function Words({ variant }: { variant: 'a' | 'b' }) {
  return (
    <div className="vm-set">
      {WORDS.map((w, i) => (
        <span key={w} className="vm-item">
          <span className={(i + (variant === 'b' ? 1 : 0)) % 2 ? 'vm-out' : 'vm-fill'}>{w}</span>
          <span className="vm-dot" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </div>
  )
}

/** Scroll-velocity marquee: speeds up, skews and flips direction with the scroll. */
export default function VelocityMarquee() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const tracks = gsap.utils.toArray<HTMLElement>('.vm-track')
      if (prefersReducedMotion()) {
        tracks.forEach((t, i) => (t.style.transform = `translate3d(${i ? -18 : -6}%,0,0)`))
        return
      }
      const state = tracks.map(() => ({ x: 0, w: 1 }))
      const measure = () => tracks.forEach((t, i) => (state[i].w = (t.firstElementChild as HTMLElement).offsetWidth || 1))
      measure()
      const ro = new ResizeObserver(measure)
      tracks.forEach((t) => ro.observe(t))

      let active = false
      let vel = 0
      let boost = 0
      let skew = 0
      let dir = 1
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (s) => (active = s.isActive),
        onUpdate: (s) => {
          vel = s.getVelocity()
          if (Math.abs(vel) > 40) dir = vel < 0 ? -1 : 1
        },
      })

      const tick = (_t: number, dtMs: number) => {
        if (!active) return
        const dt = Math.min(dtMs, 50) / 1000
        vel *= 0.9
        boost += (Math.min(Math.abs(vel) / 450, 8) - boost) * 0.1
        skew += (gsap.utils.clamp(-14, 14, -vel / 160) - skew) * 0.12
        tracks.forEach((t, i) => {
          const s = state[i]
          const sign = i % 2 ? -1 : 1
          s.x -= (70 + 70 * boost) * dt * dir * sign
          s.x = gsap.utils.wrap(-s.w, 0, s.x)
          t.style.transform = `translate3d(${s.x.toFixed(2)}px,0,0) skewX(${(skew * (i % 2 ? -0.6 : 1)).toFixed(2)}deg)`
        })
      }
      gsap.ticker.add(tick)
      return () => {
        gsap.ticker.remove(tick)
        ro.disconnect()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="vm" aria-label="Brand films, product shoots, social, ads, brand design, cinematics">
      <div className="vm-row vm-row--a display" aria-hidden>
        <div className="vm-track">
          <Words variant="a" />
          <Words variant="a" />
        </div>
      </div>
      <div className="vm-tape" aria-hidden>
        <div className="vm-row vm-row--b display">
          <div className="vm-track">
            <Words variant="b" />
            <Words variant="b" />
            <Words variant="b" />
          </div>
        </div>
      </div>
      <div className="wrap vm-meta mono" aria-hidden>
        <span>{'// OUTPUT'}</span>
        <span>16:9 · 9:16 · 1:1 · 4:5</span>
        <span>CH_02 / END OF REEL_</span>
      </div>
    </section>
  )
}
