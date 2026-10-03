import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, startScroll, stopScroll } from '@/lib/smooth'
import './loader.css'

const LOGO = '/brand/nmyt-logo.webp'

/**
 * First-visit intro: the NMYT mark "shines through its colours" — royal, sky, acid —
 * inside the exact logo silhouette, then the real metallic mark resolves with a light
 * sweep, and the curtain wipes up to reveal the site.
 */
export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    stopScroll()
    const el = root.current!
    const q = gsap.utils.selector(el)
    const reduce = prefersReducedMotion()

    const assets = Promise.all([
      document.fonts?.ready,
      new Promise((r) => {
        const i = new Image()
        i.onload = i.onerror = r
        i.src = LOGO
      }),
    ])

    const counter = { v: 0 }
    const tl = gsap.timeline({ paused: true })
    tl.set(q('.ld-stage'), { autoAlpha: 1 })
      .fromTo(q('.ld-line'), { scaleX: 0 }, { scaleX: 1, duration: 2.6, ease: 'power2.inOut' }, 0)
      .to(counter, {
        v: 100,
        duration: 2.6,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
        },
      }, 0)
      // 1 — silhouette fills with moving colour light
      .fromTo(q('.ld-spectrum'), { autoAlpha: 0, scale: 0.94, filter: 'blur(18px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' }, 0.15)
      .fromTo(q('.ld-spectrum-fill'), { xPercent: -50 }, { xPercent: 0, duration: 2.4, ease: 'none' }, 0.15)
      .fromTo(q('.ld-halo'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, 0.3)
      // 2 — the real metal logo resolves, a specular sweep crosses it
      .fromTo(q('.ld-metal'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 1.35)
      .to(q('.ld-spectrum'), { autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, 1.55)
      .fromTo(q('.ld-sheen'), { xPercent: -120 }, { xPercent: 120, duration: 1.1, ease: 'power2.inOut' }, 1.5)
      .fromTo(q('.ld-meta'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out' }, 0.2)
      .addLabel('hold', 2.7)
      // 3 — exit
      .to(q('.ld-logo'), { scale: 0.86, autoAlpha: 0, filter: 'blur(10px)', duration: 0.7, ease: 'power3.in' }, 'hold')
      .to(q('.ld-meta, .ld-line-wrap'), { autoAlpha: 0, duration: 0.35 }, 'hold')
      .to(q('.ld-halo'), { scale: 2.4, autoAlpha: 0, duration: 1, ease: 'power2.in' }, 'hold')
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut' }, 'hold+=0.45')
      .add(() => {
        window.dispatchEvent(new CustomEvent('nmyt:revealed'))
      }, 'hold+=0.75')

    let done = false
    const finish = () => {
      if (done) return
      done = true
      startScroll()
      onDone()
    }
    tl.eventCallback('onComplete', finish)

    assets.then(() => {
      // reduced motion: same intro, a touch quicker (no large movement involved)
      if (reduce) tl.timeScale(1.25)
      tl.play()
    })
    // safety net
    const t = window.setTimeout(() => tl.progress() === 0 && tl.play(), 3500)
    return () => {
      window.clearTimeout(t)
      tl.kill()
    }
  }, [onDone])

  return (
    <div ref={root} className="ld" style={{ clipPath: 'inset(0% 0% 0% 0%)' }} aria-hidden>
      <div className="ld-stage">
        <div className="ld-halo" />
        <div className="ld-logo">
          <div className="ld-spectrum" style={{ maskImage: `url(${LOGO})`, WebkitMaskImage: `url(${LOGO})` }}>
            <div className="ld-spectrum-fill" />
          </div>
          <img className="ld-metal" src={LOGO} alt="" draggable={false} />
          <div className="ld-sheen-mask" style={{ maskImage: `url(${LOGO})`, WebkitMaskImage: `url(${LOGO})` }}>
            <div className="ld-sheen" />
          </div>
        </div>
      </div>

      <div className="ld-foot wrap">
        <div className="ld-meta mono">
          <span ref={count} className="ld-count">000</span>
        </div>
        <div className="ld-meta mono ld-mid">Tech Studio <i>·</i> Creative Studio <i>·</i> Originals</div>
        <div className="ld-meta mono ld-right">NMYT — New Gen Studio</div>
      </div>
      <div className="ld-line-wrap">
        <div className="ld-line" />
      </div>
    </div>
  )
}
