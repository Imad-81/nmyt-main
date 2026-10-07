import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'
import { MonoLabel } from '@/components/ui'
import { SplitReveal, Reveal } from '@/components/Reveal'
import { PROJECTS, STUDIO_META } from '@/data/work'
import { media } from '@/data/media'
import { useMediaQuery } from '@/lib/hooks'

// TODO(NMYT): PROJECTS are sample case studies — the carousel updates itself when real ones land.
const ITEMS = PROJECTS.filter((p) => p.studio === 'creative' || p.studio === 'hybrid')
const pad = (n: number) => String(n).padStart(2, '0')

export default function CreativeWork() {
  const root = useRef<HTMLElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const desktop = useMediaQuery('(min-width: 900px)')
  const [reduce] = useState(prefersReducedMotion)
  const pinned = desktop && !reduce

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.cw-card')
      gsap.fromTo(cards, { autoAlpha: 0, y: reduce ? 20 : 120, rotate: reduce ? 0 : 3 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.4, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })

      const setCount = (p: number) => {
        if (bar.current) bar.current.style.transform = `scaleX(${p})`
        if (count.current) count.current.textContent = pad(Math.min(ITEMS.length, Math.max(1, Math.round(p * (ITEMS.length - 1)) + 1)))
      }

      if (!pinned) {
        // native swipe / scroll-snap: progress follows the scroller
        const v = view.current!
        const onScroll = () => setCount(v.scrollLeft / Math.max(1, v.scrollWidth - v.clientWidth))
        v.addEventListener('scroll', onScroll, { passive: true })
        return () => v.removeEventListener('scroll', onScroll)
      }

      const tr = track.current!
      const dist = () => Math.max(0, tr.scrollWidth - window.innerWidth)
      const skew = { v: 0 }
      const setSkew = gsap.quickSetter(cards, 'skewX', 'deg')
      const tween = gsap.to(tr, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setCount(self.progress)
            const s = gsap.utils.clamp(-7, 7, self.getVelocity() / -320)
            if (Math.abs(s) > Math.abs(skew.v)) {
              skew.v = s
              gsap.to(skew, { v: 0, duration: 0.9, ease: 'power3', overwrite: true, onUpdate: () => setSkew(skew.v) })
            }
          },
        },
      })
      // inner image parallax against the horizontal travel
      cards.forEach((c) => {
        const img = c.querySelector('img')
        if (!img) return
        gsap.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
    },
    { scope: root, dependencies: [pinned], revertOnUpdate: true },
  )

  // mouse drag-to-scroll for the free (non-pinned) scroller
  const drag = useRef({ on: false, x: 0, sl: 0, moved: false })
  const down = (e: React.PointerEvent) => {
    if (pinned || e.pointerType !== 'mouse') return
    drag.current = { on: true, x: e.clientX, sl: view.current!.scrollLeft, moved: false }
  }
  const move = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d.on) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    view.current!.scrollLeft = d.sl - dx
  }
  const up = () => (drag.current.on = false)
  const click = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      drag.current.moved = false
    }
  }

  return (
    <section ref={root} id="cr-work" className={`cw ${pinned ? 'is-pinned' : 'is-free'}`}>
      <div className="cw-bg" aria-hidden />
      <div className="wrap cw-head">
        <MonoLabel index="03" color="var(--acid)">
          Selected work
        </MonoLabel>
        <div className="cw-prog" aria-hidden>
          <span ref={count} className="mono">
            01
          </span>
          <span className="cw-prog-bar">
            <span ref={bar} />
          </span>
          <span className="mono">{pad(ITEMS.length)}</span>
        </div>
      </div>

      <div ref={view} className="cw-view no-scrollbar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onClickCapture={click}>
        <div ref={track} className="cw-track">
          <div className="cw-intro">
            <SplitReveal as="h2" className="display cw-title" type="chars" stagger={0.02}>
              Selected <br />
              <em className="serif">creative</em> work
            </SplitReveal>
            <Reveal className="cw-intro-foot" delay={0.2}>
              <p className="cw-lede">Films, shoots and content systems for brands that wanted to be looked at twice.</p>
              <span className="mono cw-hint">
                {pinned ? 'Scroll' : 'Drag / swipe'} <i aria-hidden>→</i>
              </span>
            </Reveal>
          </div>

          {ITEMS.map((p, i) => (
            <Link key={p.slug} to="/work" className="cw-card" data-cursor="View" draggable={false}>
              <div className="cw-media">
                <img src={media(p.image)} alt={`${p.name} — ${p.client}`} loading="lazy" decoding="async" draggable={false} />
              </div>
              <div className="cw-shade" />
              <div className="cw-scan" />
              <div className="cw-top">
                <span className="cw-pill cw-pill--studio">
                  <i style={{ background: STUDIO_META[p.studio].color }} />
                  {STUDIO_META[p.studio].label}
                </span>
                <span className="cw-pill">{p.year}</span>
              </div>
              <div className="cw-bot">
                <span className="mono cw-idx">
                  {pad(i + 1)} / {pad(ITEMS.length)}
                </span>
                <h3 className="display cw-name">{p.name}</h3>
                <p className="cw-client">{p.client}</p>
                <div className="cw-row">
                  <div className="cw-tags">
                    {p.services.map((s) => (
                      <span key={s} className="cw-pill cw-pill--sm">
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className="cw-view-chip">
                    View
                    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                      <path d="M3 13L13 3M13 3H5M13 3v8" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <Link to="/work" className="cw-end" data-cursor-hover draggable={false}>
            <span className="mono">{'// ALL_WORK'}</span>
            <span className="display cw-end-t">
              See
              <br />
              everything
            </span>
            <span className="cw-end-arrow" aria-hidden>
              <svg viewBox="0 0 16 16" width="28" height="28">
                <path d="M3 13L13 3M13 3H5M13 3v8" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
