import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { RibbonForm } from '@/gl/ribbonForm'
import { gsap, getLenis } from '@/lib/smooth'
import { whenRevealed } from '@/lib/reveal'
import { MagneticButton } from '@/components/MagneticButton'

/**
 * Creative Studio hero. A white studio wall and one object on it: a knotted ribbon of
 * liquid chrome in the studio's blue and green, turning slowly and leaning toward the
 * pointer. Scrolling pulls the object to the centre, lets it grow, and the dark of the
 * page below floods out from behind it, so the hero hands over to the next section
 * without a hard edge.
 */
export default function CreativeHero() {
  const wrap = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const state = useRef({ intro: 0, scroll: 0 })

  useEffect(() => {
    let form: RibbonForm | null = null
    let gone = false
    const stateObj = state.current
    import('@/gl/ribbonForm')
      .then(({ createRibbonForm }) => {
        if (gone) return
        form = createRibbonForm(stage.current!, stateObj)
      })
      .catch(() => {})
    const off = whenRevealed(() => gsap.to(stateObj, { intro: 1, duration: 2.6, ease: 'power2.out', delay: 0.1 }))
    return () => {
      gone = true
      off()
      gsap.killTweensOf(stateObj)
      form?.dispose()
      document.documentElement.dataset.navtone = ''
    }
  }, [])

  useGSAP(
    () => {
      const q = gsap.utils.selector(wrap)
      gsap.set(q('.ch-line'), { y: 30, autoAlpha: 0 })
      gsap.set(q('.ch-in'), { autoAlpha: 0, y: 16 })
      const off = whenRevealed(() => {
        gsap.to(q('.ch-line'), { y: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.2 })
        gsap.to(q('.ch-in'), { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.7 })
      })
      // hand-over to the dark page below
      const root = document.documentElement
      root.dataset.navtone = 'ink'
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          // the nav is ink on the white wall, white once the dark has taken over
          onUpdate: (self) => {
            const tone = self.progress < 0.62 ? 'ink' : ''
            if (root.dataset.navtone !== tone) root.dataset.navtone = tone
          },
          onLeave: () => (root.dataset.navtone = ''),
          onEnterBack: () => (root.dataset.navtone = 'ink'),
        },
      })
      // 0 to .3: the words leave. .22 to .8: the dark opens from behind the object.
      // .82 to 1: the whole stage dissolves onto the next section, which is already underneath.
      tl.to(state.current, { scroll: 1, duration: 1 }, 0)
        .to(q('.ch-copy'), { y: -70, autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0)
        .fromTo(q('.ch-flood'), { '--fr': '0%' }, { '--fr': '160%', duration: 0.58, ease: 'power2.in' }, 0.22)
        .to(q('.ch'), { autoAlpha: 0, duration: 0.18, ease: 'power1.inOut' }, 0.82)
      return off
    },
    { scope: wrap },
  )

  const toWork = () => {
    const el = document.getElementById('cr-work')
    if (!el) return
    const l = getLenis()
    if (l) l.scrollTo(el, { duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={wrap} className="chw">
      <section className="ch" data-theme="creative">
        <div className="ch-halo" aria-hidden />
        <div className="ch-shadow" aria-hidden />
        <div className="ch-flood" aria-hidden />
        <div ref={stage} className="ch-stage" aria-hidden />
        <div className="ch-copy wrap">
          <p className="ch-kicker ch-in">Creative Studio</p>
          <h1 className="ch-title">
            <span className="ch-line">
              <span className="ch-fill">we make them</span>
            </span>
            <span className="ch-line">
              <span className="ch-fill">look</span> <em>twice.</em>
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
      </section>
    </div>
  )
}
