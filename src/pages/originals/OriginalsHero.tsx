import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { SplitReveal, Reveal, whenRevealed } from '@/components/Reveal'
import Motion, { CLIPS } from '@/components/Motion'

// with the dolly clip in place, the title waits for the camera to settle
const HOLD = CLIPS.originalsStage ? 2.6 : 0

export default function OriginalsHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current!
      const q = gsap.utils.selector(el)
      const reduce = prefersReducedMotion()

      const off = whenRevealed(contextSafe!(() => {
        el.classList.add('is-open')
        const tl = gsap.timeline({ delay: 0.15 })
        if (reduce) {
          tl.fromTo(q('.oh-push'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0)
        } else {
          // slow dolly push-in
          tl.fromTo(q('.oh-push'), { scale: 1.24 }, { scale: 1.06, duration: 12, ease: 'power2.out' }, 0)
          tl.fromTo(q('.oh-push'), { autoAlpha: 0.2 }, { autoAlpha: 1, duration: 1.6, ease: 'power1.out' }, 0)
          // anamorphic sweep as the gate opens
          tl.fromTo(q('.oh-flare--sweep'), { xPercent: -70, autoAlpha: 0 }, { xPercent: 70, autoAlpha: 1, duration: 2.6, ease: 'power2.inOut' }, 0.5)
          tl.to(q('.oh-flare--sweep'), { autoAlpha: 0, duration: 0.8 }, 2.4)
        }
      }))

      if (!reduce) {
        gsap.to(q('.oh-par'), { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to(q('.oh-copy'), { yPercent: -16, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom 20%', scrub: true } })
        gsap.to(q('.oh-fadeblack'), { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: el, start: '30% top', end: 'bottom top', scrub: true } })
      }
      return off
    },
    { scope: root },
  )

  return (
    <section ref={root} className="oh" aria-label="NMYT Originals">
      <div className="oh-frame">
        <div className="oh-par">
          <div className="oh-weave">
            <div className="oh-push">
              <Motion k="originalsStage" once priority position="62% 50%" className="oh-img" alt="A lone figure walks toward a tall blue cloth in a dark soundstage as a beam of light falls across it" />
            </div>
          </div>
        </div>
        <div className="oh-grade" />
        <div className="oh-flare oh-flare--a" aria-hidden />
        <div className="oh-flare oh-flare--b" aria-hidden />
        <div className="oh-flare oh-flare--sweep" aria-hidden />
        <div className="oh-grain" aria-hidden />
        <div className="oh-vignette" />
      </div>

      <div className="oh-copy wrap">
        <h1 className="display oh-title">
          <SplitReveal as="span" className="oh-line" trigger="intro" delay={HOLD + 0.7}>
            NMYT
          </SplitReveal>
          <SplitReveal as="span" className="oh-line" trigger="intro" delay={HOLD + 0.82}>
            <em className="serif oh-em">Originals</em>
          </SplitReveal>
        </h1>
        <Reveal trigger="intro" delay={HOLD + 1.4} className="lede oh-lede">
          Short films, made in-house. And a way in for the filmmakers who make them with us: a real set, a credit, and a door to paid work on our productions.
        </Reveal>
      </div>

      {/* letterbox — opens to 2.39:1 once the loader lifts */}
      <div className="oh-bar oh-bar--top" aria-hidden />
      <div className="oh-bar oh-bar--bot" aria-hidden />
      <div className="oh-fadeblack" aria-hidden />
    </section>
  )
}
