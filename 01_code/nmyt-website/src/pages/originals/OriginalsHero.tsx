import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { SplitReveal, Reveal, whenRevealed } from '@/components/Reveal'
import { media } from '@/data/media'

const pad = (n: number) => String(n).padStart(2, '0')

/** Live 24fps timecode written straight into a span (no re-renders). */
function useTimecode() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const s = (performance.now() - t0) / 1000
      if (ref.current) ref.current.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * 24))}`
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return ref
}

/** Clapperboard built in HTML/CSS. Hover to call another take. */
function ClapperSlate() {
  const ref = useRef<HTMLDivElement>(null)
  const tc = useTimecode()
  const [take, setTake] = useState(1)
  const busy = useRef(false)
  const date = new Date()
  const dateStr = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(2)}`

  const clap = () => {
    if (busy.current || prefersReducedMotion()) return
    busy.current = true
    const stick = ref.current!.querySelector('.os-stick--top')
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .to(stick, { rotate: -26, duration: 0.45, ease: 'power3.out' })
      .to(stick, { rotate: 0, duration: 0.18, ease: 'power4.in' }, '+=0.15')
      .add(() => setTake((t) => (t % 99) + 1))
      .fromTo(ref.current, { y: 0 }, { y: 3, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' })
  }

  return (
    <div ref={ref} className="os-slate" onPointerEnter={(e) => e.pointerType === 'mouse' && clap()} data-cursor="Action" aria-label="Production slate">
      <div className="os-sticks" aria-hidden>
        <div className="os-stick os-stick--top" />
        <div className="os-stick os-stick--bot" />
      </div>
      <div className="os-board mono">
        <div className="os-row os-prod">
          <span>Prod.</span>
          <b>NMYT Originals</b>
        </div>
        <div className="os-cells">
          <div>
            <span>Roll</span>
            <b>A001</b>
          </div>
          <div>
            <span>Scene</span>
            <b>01</b>
          </div>
          <div>
            <span>Take</span>
            <b className="os-take">{pad(take)}</b>
          </div>
        </div>
        <div className="os-row">
          <span>Director</span>
          <b className="serif os-dir">You, next.</b>
        </div>
        <div className="os-row os-foot">
          <span>
            Date <b>{dateStr}</b>
          </span>
          <span>
            TC <b ref={tc}>00:00:00:00</b>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function OriginalsHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current!
      const q = gsap.utils.selector(el)
      const reduce = prefersReducedMotion()

      gsap.set(q('.os-slate'), { autoAlpha: 0, y: 30 })
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
        tl.to(q('.os-slate'), { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out' }, 1.1)
        if (!reduce) {
          tl.fromTo(q('.os-stick--top'), { rotate: 0 }, { rotate: -26, duration: 0.5, ease: 'power3.out' }, 1.5)
          tl.to(q('.os-stick--top'), { rotate: 0, duration: 0.18, ease: 'power4.in' }, 2.25)
          tl.fromTo(q('.os-slate'), { y: 0 }, { y: 3, duration: 0.06, yoyo: true, repeat: 1 }, 2.43)
        }
      }))

      if (!reduce) {
        gsap.to(q('.oh-par'), { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to(q('.oh-copy, .oh-slate-wrap'), { yPercent: -16, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom 20%', scrub: true } })
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
              <img src={media('originalsWide')} alt="A film set at night, lit for a wide shot" className="oh-img" loading="eager" decoding="async" />
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
        <Reveal trigger="intro" delay={0.9} className="mono oh-kicker">
          <span className="oh-dot" /> In-house short films <span className="oh-sep">/</span> New filmmakers
        </Reveal>
        <h1 className="display oh-title">
          <SplitReveal as="span" className="oh-line" type="chars" trigger="intro" delay={0.7} stagger={0.04} duration={1.5}>
            NMYT
          </SplitReveal>
          <SplitReveal as="span" className="oh-line" type="chars" trigger="intro" delay={0.95} stagger={0.035} duration={1.5}>
            <em className="serif oh-em">Originals</em>
          </SplitReveal>
        </h1>
        <Reveal trigger="intro" delay={1.4} className="lede oh-lede">
          Our own short films — and a way in for the filmmakers who make them with us. Made properly, released under our name, and a door to paid work on our productions.
        </Reveal>
      </div>

      <div className="oh-slate-wrap">
        <ClapperSlate />
      </div>

      {/* letterbox — opens to 2.39:1 once the loader lifts */}
      <div className="oh-bar oh-bar--top" aria-hidden>
        <div className="oh-bar-row mono">
          <span>NMYT / Originals</span>
          <span>2.39 : 1</span>
        </div>
      </div>
      <div className="oh-bar oh-bar--bot">
        <div className="oh-bar-row mono">
          <span className="oh-scroll">
            Scroll <em />
          </span>
        </div>
      </div>
      <div className="oh-fadeblack" aria-hidden />
    </section>
  )
}
