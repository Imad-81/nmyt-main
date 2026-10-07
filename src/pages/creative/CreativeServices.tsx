import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/smooth'
import { SectionHead } from '@/components/ui'
import { CREATIVE_SERVICES } from '@/data/site'
import { media, type MediaKey } from '@/data/media'
import { useMediaQuery } from '@/lib/hooks'

const IMG: MediaKey[] = ['creativeCommercial', 'creativeProduct', 'creativeSocial', 'creativePortrait', 'creativeBrand', 'originalsMonitor']
const TAG = ['FILM', 'STILLS + MOTION', 'ALWAYS-ON', 'PAID', 'IDENTITY', 'MOTION']

export default function CreativeServices() {
  const root = useRef<HTMLElement>(null)
  const prev = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  const hover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const mv = useRef<{ x?: (v: number) => void; y?: (v: number) => void; r?: (v: number) => void; lx: number; ly: number; on: boolean }>({ lx: 0, ly: 0, on: false })

  const enter = (e: React.PointerEvent) => {
    if (!hover || e.pointerType !== 'mouse') return
    if (!mv.current.on) gsap.set(prev.current, { x: e.clientX, y: e.clientY })
    mv.current.lx = e.clientX
    mv.current.ly = e.clientY
    show(true)
  }
  const show = (on: boolean) => {
    if (!hover) return
    mv.current.on = on
    gsap.to(prev.current, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.6, duration: on ? 0.6 : 0.4, ease: on ? 'expo.out' : 'power3.in', overwrite: 'auto' })
    if (!on) setActive(-1)
  }

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      const rows = gsap.utils.toArray<HTMLElement>('.sv-row')
      rows.forEach((row) => {
        gsap.fromTo(row.querySelector('.sv-rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: row, start: 'top 92%', once: true } })
        gsap.fromTo(
          row.querySelectorAll('.sv-in'),
          { yPercent: reduce ? 0 : 110, autoAlpha: reduce ? 0 : 1 },
          { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: row, start: 'top 90%', once: true } },
        )
      })
      if (!hover) {
        // touch: the acid fill wipes in as each row crosses the middle of the screen
        rows.forEach((row) => {
          gsap.to(row, { scrollTrigger: { trigger: row, start: 'top 58%', end: 'bottom 42%', toggleClass: 'is-on' } })
        })
        return
      }
      const p = prev.current!
      gsap.set(p, { xPercent: -50, yPercent: -50 })
      mv.current.x = gsap.quickTo(p, 'x', { duration: reduce ? 0.2 : 0.7, ease: 'power3' })
      mv.current.y = gsap.quickTo(p, 'y', { duration: reduce ? 0.2 : 0.7, ease: 'power3' })
      mv.current.r = gsap.quickTo(p, 'rotation', { duration: 0.9, ease: 'power3' })
      // the list scrolls under a resting pointer — keep the preview honest
      ScrollTrigger.create({
        trigger: '.sv-list',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: () => {
          const m = mv.current
          if (!m.on) return
          const hit = document.elementFromPoint(m.lx, m.ly)
          const row = hit?.closest<HTMLElement>('.sv-row[data-i]')
          if (!hit?.closest('.sv-list')) show(false)
          else if (row) setActive(Number(row.dataset.i))
        },
      })
    },
    { scope: root, dependencies: [hover], revertOnUpdate: true },
  )

  const onMove = (e: React.PointerEvent) => {
    if (!hover) return
    const m = mv.current
    m.x?.(e.clientX)
    m.y?.(e.clientY)
    if (!prefersReducedMotion()) m.r?.(gsap.utils.clamp(-10, 10, (e.clientX - m.lx) * 0.5))
    m.lx = e.clientX
    m.ly = e.clientY
  }
  return (
    <section ref={root} className="sv section">
      <div className="wrap">
        <SectionHead
          index="02"
          label="Services"
          accent="var(--acid)"
          title={
            <>
              Six ways to <em className="serif sv-em">be seen.</em>
            </>
          }
          lede="Every discipline under one roof, so the film, the feed and the identity all look like the same brand."
          aside={<span className="mono sv-count">[ 06 ]</span>}
        />

        <ul className={`sv-list ${active >= 0 ? 'has-active' : ''}`} onPointerMove={onMove} onPointerEnter={enter} onPointerLeave={() => show(false)}>
          {CREATIVE_SERVICES.map((s, i) => (
            <li key={s.n} data-i={i} className={`sv-row ${active === i ? 'is-active' : ''}`} onPointerEnter={() => setActive(i)} data-cursor-hover>
              <div className="sv-rule" />
              <div className="sv-grid">
                <span className="mono sv-n">
                  <span className="sv-mask">
                    <span className="sv-in">{s.n}</span>
                  </span>
                </span>
                <h3 className="display sv-title">
                  <span className="sv-mask">
                    <span className="sv-in sv-t">
                      <span className="sv-t-base">{s.title}</span>
                      <span className="sv-t-fill" aria-hidden>
                        {s.title}
                      </span>
                    </span>
                  </span>
                </h3>
                <div className="sv-side">
                  <span className="mono sv-tag">{`// ${TAG[i]}`}</span>
                  <p className="sv-body">{s.body}</p>
                </div>
                <span className="sv-arrow" aria-hidden>
                  <svg viewBox="0 0 16 16" width="18" height="18">
                    <path d="M3 13L13 3M13 3H5M13 3v8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                {!hover && (
                  <div className="sv-thumb">
                    <img src={media(IMG[i], 'sm')} alt="" loading="lazy" decoding="async" />
                  </div>
                )}
              </div>
            </li>
          ))}
          <li className="sv-row sv-row--end" aria-hidden>
            <div className="sv-rule" />
          </li>
        </ul>
      </div>

      {hover && (
        <div ref={prev} className="sv-prev" aria-hidden>
          <div className="sv-prev-in">
            {IMG.map((k, i) => (
              <div key={k} className={`sv-prev-img ${active === i ? 'is-on' : ''}`}>
                <img src={media(k, 'sm')} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
            <div className="sv-prev-scan" />
            <span className="mono sv-prev-l">{active >= 0 ? `${CREATIVE_SERVICES[active].n} / ${TAG[active]}` : ''}</span>
          </div>
        </div>
      )}
    </section>
  )
}
