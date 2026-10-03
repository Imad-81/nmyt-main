import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { media } from '@/data/media'
import { MagneticButton } from '@/components/MagneticButton'
import { MonoLabel } from '@/components/ui'
import { SplitReveal, Reveal } from '@/components/Reveal'

/** Full-bleed letterboxed still: bars open with scroll, anamorphic streak, slate text. */
export default function OriginalsTeaser() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'center center', scrub: reduce ? true : 1 } })
      tl.fromTo('.ot-bar--t', { height: '50%' }, { height: '12%', ease: 'power2.inOut' }, 0)
        .fromTo('.ot-bar--b', { height: '50%' }, { height: '12%', ease: 'power2.inOut' }, 0)
        .fromTo('.ot-img', { scale: 1.35 }, { scale: 1.08, ease: 'power2.out' }, 0)
        .fromTo('.ot-flare', { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, ease: 'power2.out' }, 0.3)
      if (!reduce)
        gsap.to('.ot-img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="ot" aria-label="NMYT Originals">
      <style>{`
        .ot{position:relative;height:120vh;min-height:720px;overflow:hidden;background:#000}
        .ot-img{position:absolute;inset:-6% 0;background-size:cover;background-position:center 40%;filter:saturate(1.1) contrast(1.08)}
        .ot-shade{position:absolute;inset:0;background:radial-gradient(90% 70% at 30% 60%,transparent 30%,rgba(0,0,0,.75) 100%),linear-gradient(90deg,rgba(0,0,0,.7),transparent 60%)}
        .ot-bar{position:absolute;left:0;right:0;background:#000;z-index:3}
        .ot-bar--t{top:0}.ot-bar--b{bottom:0}
        .ot-flare{position:absolute;left:-10%;right:-10%;top:41%;height:2px;z-index:2;background:linear-gradient(90deg,transparent,rgba(22,180,255,.0) 10%,rgba(120,200,255,.9) 48%,#fff 50%,rgba(120,200,255,.9) 52%,transparent 90%);filter:blur(1px);box-shadow:0 0 30px 6px rgba(22,120,255,.55);mix-blend-mode:screen;transform-origin:50% 50%}
        .ot-copy{position:absolute;z-index:4;left:0;right:0;bottom:17%}
        .ot-title{margin:18px 0 0;font-size:clamp(64px,11vw,210px)}
        .ot-title em{color:var(--ice);font-size:1.02em}
        .ot-row{display:flex;justify-content:space-between;align-items:flex-end;gap:28px;margin-top:28px;flex-wrap:wrap}
        @media (max-width:767px){.ot-copy{bottom:14%}}
      `}</style>
      <div className="ot-img" style={{ backgroundImage: `url(${media('originalsDirector')})` }} />
      <div className="ot-shade" />
      <div className="ot-flare" />
      <div className="ot-bar ot-bar--t" />
      <div className="ot-bar ot-bar--b" />
      <div className="ot-copy wrap">
        <MonoLabel index="04" color="var(--emerald)">
          NMYT Originals
        </MonoLabel>
        <SplitReveal as="h2" className="display ot-title">
          We make <em className="serif">our own</em> films.
        </SplitReveal>
        <div className="ot-row">
          <Reveal className="lede max-w-[46ch]">
            In-house short films — and a real way in for young filmmakers. We produce their work, put it out, and bring them onto paid NMYT shoots so their portfolio grows with us.
          </Reveal>
          <Reveal delay={0.15}>
            <MagneticButton to="/originals" variant="ghost">
              Explore Originals
            </MagneticButton>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
