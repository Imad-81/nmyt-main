import { useEffect, useRef } from 'react'
import { gsap, startScroll, stopScroll } from '@/lib/smooth'
import './loader.css'

const MASK = '/brand/nmyt-mask-hq.webp'

/**
 * Intro: the white NMYT mark forms from left to right, drawn by a pass of its own light
 * (royal, sky, green), settles to pure white, then the curtain lifts.
 * The silhouette is the full-resolution logo cut-out, so the edges stay crisp at any size.
 */
export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    stopScroll()
    const el = root.current!
    const q = gsap.utils.selector(el)

    const assets = Promise.all([
      document.fonts?.ready,
      new Promise((r) => {
        const i = new Image()
        i.onload = i.onerror = r
        i.src = MASK
      }),
    ])

    const tl = gsap.timeline({ paused: true })
    tl.set(q('.ld-mark'), { autoAlpha: 1 })
      // the mark forms
      .fromTo(q('.ld-white'), { xPercent: -101 }, { xPercent: 0, duration: 1.5, ease: 'power2.inOut' }, 0.1)
      .fromTo(q('.ld-light'), { xPercent: -130 }, { xPercent: 130, duration: 1.7, ease: 'power2.inOut' }, 0)
      .fromTo(q('.ld-halo'), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0.2)
      .addLabel('hold', 1.95)
      // exit
      .to(q('.ld-mark'), { scale: 0.94, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, 'hold')
      .to(q('.ld-halo'), { autoAlpha: 0, duration: 0.5 }, 'hold')
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, 'hold+=0.3')
      .add(() => {
        window.dispatchEvent(new CustomEvent('nmyt:revealed'))
      }, 'hold+=0.55')

    let done = false
    tl.eventCallback('onComplete', () => {
      if (done) return
      done = true
      startScroll()
      onDone()
    })

    assets.then(() => tl.play())
    // safety net
    const t = window.setTimeout(() => tl.progress() === 0 && tl.play(), 3000)
    return () => {
      window.clearTimeout(t)
      tl.kill()
    }
  }, [onDone])

  return (
    <div ref={root} className="ld" style={{ clipPath: 'inset(0% 0% 0% 0%)' }} aria-hidden>
      <div className="ld-halo" />
      <div className="ld-mark">
        <div className="ld-white" />
        <div className="ld-light" />
      </div>
    </div>
  )
}
