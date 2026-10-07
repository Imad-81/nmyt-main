import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, getLenis } from '@/lib/smooth'
import { whenRevealed } from '@/components/Reveal'
import { MagneticButton } from '@/components/MagneticButton'

/**
 * Creative Studio hero. No imagery: a slow aurora in the studio's greens and blues, and a
 * headline whose letters are windows onto a brighter pass of the same light.
 * The light leans gently toward the pointer.
 */
export default function CreativeHero() {
  const root = useRef<HTMLElement>(null)

  // pause the colour animation off-screen; lean the aurora toward the pointer
  useEffect(() => {
    const el = root.current!
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-off', !e.isIntersecting))
    io.observe(el)
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      el.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    }
    el.addEventListener('pointermove', move, { passive: true })
    return () => {
      io.disconnect()
      el.removeEventListener('pointermove', move)
    }
  }, [])

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.set(q('.ch-line'), { y: 36, autoAlpha: 0 })
      gsap.set(q('.ch-in'), { autoAlpha: 0, y: 18 })
      gsap.set(q('.ch-aurora'), { autoAlpha: 0 })
      const off = whenRevealed(() => {
        gsap.to(q('.ch-aurora'), { autoAlpha: 1, duration: 2.4, ease: 'power2.out' })
        gsap.to(q('.ch-line'), { y: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.15, clearProps: 'transform' })
        gsap.to(q('.ch-in'), { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.6 })
      })
      gsap.to(q('.ch-copy'), { y: -50, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
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
      <div className="ch-aurora" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="ch-copy wrap">
        <h1 className="display ch-title">
          <span className="ch-line ch-field">Make them</span>
          <span className="ch-line ch-field">look twice.</span>
        </h1>
        <p className="lede ch-lede ch-in">Brand films, product shoots, social, ads and identity. Concept to final grade, made under one roof.</p>
        <div className="ch-ctas ch-in">
          <MagneticButton to="/contact?studio=creative" variant="acid">
            Start a project
          </MagneticButton>
          <MagneticButton onClick={toWork} variant="ghost">
            See the work
          </MagneticButton>
        </div>
      </div>
      <div className="ch-fadeout" aria-hidden />
    </section>
  )
}
