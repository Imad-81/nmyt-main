import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { media, type MediaKey } from '@/data/media'
import { Brackets } from '@/components/ui'
import './reel.css'

const CHAPTERS: { key: MediaKey; kicker: string; title: string; em: string; meta: string; tone: string }[] = [
  { key: 'techHands', kicker: '01 / Tech Studio', title: 'We', em: 'build.', meta: 'Websites · Landing pages · Dashboards · Systems', tone: 'var(--sky)' },
  { key: 'creativeCommercial', kicker: '02 / Creative Studio', title: 'We', em: 'shoot.', meta: 'Brand films · Product · Social · Ads · Design', tone: 'var(--acid)' },
  { key: 'heroFilmset', kicker: '03 / NMYT Originals', title: 'We tell', em: 'stories.', meta: 'In-house short films · New filmmakers', tone: 'var(--ice)' },
]

/**
 * Sticky "camera frame" that expands to full-bleed while the story steps through
 * the three sides of NMYT. SpaceX-launch HUD overlays (brackets, timecode, specs).
 */
export default function Reel() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      const frame = '.rl-frame'
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: reduce ? true : 0.8, invalidateOnRefresh: true },
      })
      // 0 → 0.28: frame opens to full-bleed
      // aperture: a centred 16:9 window opening to full-bleed (clip-path — no layout work)
      const startClip = () => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const w = vw * (vw < 768 ? 0.88 : 0.44)
        const h = w * 0.5625
        return `inset(${(vh - h) / 2}px ${(vw - w) / 2}px ${(vh - h) / 2}px ${(vw - w) / 2}px round 28px)`
      }
      tl.fromTo(frame, { clipPath: startClip }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.28, ease: 'power2.inOut', immediateRender: true }, 0)
        .fromTo('.rl-side', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0.02)
        .fromTo('.rl-hud', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.2)

      gsap.set('.rl-t', { yPercent: 110 })
      gsap.set('.rl-k, .rl-m', { autoAlpha: 0 })
      // images crossfade on the scrubbed timeline
      CHAPTERS.forEach((_, i) => {
        const at = 0.22 + i * 0.26
        const img = `.rl-img-${i}`
        if (i > 0) tl.fromTo(img, { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1.02, duration: 0.12 }, at - 0.04)
        else tl.fromTo(img, { scale: 1.25 }, { scale: 1.02, duration: 0.3 }, 0)
      })
      // captions are state-driven (own timing, never half-scrubbed)
      let active = -1
      const show = (i: number) => {
        if (i === active) return
        const prev = active
        active = i
        if (prev >= 0) {
          const pc = `.rl-cap-${prev}`
          gsap.to(`${pc} .rl-t`, { yPercent: i > prev ? -110 : 110, duration: 0.6, stagger: 0.05, ease: 'power3.in', overwrite: true })
          gsap.to(`${pc} .rl-k, ${pc} .rl-m`, { autoAlpha: 0, duration: 0.3, overwrite: true })
        }
        if (i >= 0) {
          const c = `.rl-cap-${i}`
          gsap.fromTo(`${c} .rl-t`, { yPercent: i > prev ? 110 : -110 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'expo.out', delay: prev >= 0 ? 0.25 : 0, overwrite: true })
          gsap.fromTo(`${c} .rl-k, ${c} .rl-m`, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.35, overwrite: true })
        }
      }
      tl.to('.rl-progress i', { scaleX: 1, duration: 1 }, 0)

      // live timecode driven by scroll
      const tc = root.current!.querySelector('.rl-tc')!
      tl.eventCallback('onUpdate', () => {
        const p = tl.progress()
        show(p < 0.17 ? -1 : p < 0.46 ? 0 : p < 0.72 ? 1 : 2)
        const f = Math.floor(p * 24 * 42)
        const pad = (v: number) => String(v).padStart(2, '0')
        tc.textContent = `00:00:${pad(Math.floor(f / 24))}:${pad(f % 24)}`
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="rl" aria-label="What NMYT does">
      <div className="rl-sticky">
        <div className="rl-side rl-side--l mono">
          <span className="text-[var(--sky)]">[ Reel ]</span>
          <span>Build · Shoot · Tell</span>
        </div>
        <div className="rl-side rl-side--r mono">
          <span>Keep scrolling</span>
          <span className="text-[var(--fg)]">↓</span>
        </div>

        <div className="rl-frame">
          {CHAPTERS.map((c, i) => (
            <div key={c.key} className={`rl-img rl-img-${i}`} style={{ backgroundImage: `url(${media(c.key)})`, zIndex: i }} />
          ))}
          <div className="rl-grade" />
          <div className="rl-hud">
            <Brackets color="rgba(255,255,255,.55)" size={22} inset={28} />
            <div className="rl-hud-tl mono">
              <i /> REC <span className="rl-tc">00:00:00:00</span>
            </div>
            <div className="rl-hud-tr mono">CAM A · 24 FPS · 180° · 4K DCI</div>
            <div className="rl-hud-bl mono">NMYT / Reel</div>
            <div className="rl-cross" />
            <div className="rl-progress">
              <i />
            </div>
          </div>
          <div className="rl-caps">
            {CHAPTERS.map((c, i) => (
              <div key={c.key} className={`rl-cap rl-cap-${i}`} style={{ ['--tone' as string]: c.tone }}>
                <div className="rl-k mono">{c.kicker}</div>
                <h3 className="display rl-title">
                  <span className="mask-line">
                    <span className="rl-t">{c.title}</span>
                  </span>
                  <span className="mask-line">
                    <span className="rl-t serif rl-em">{c.em}</span>
                  </span>
                </h3>
                <div className="rl-m mono">{c.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
