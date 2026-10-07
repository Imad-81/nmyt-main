import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import Img from '@/components/Img'
import { media } from '@/data/media'
import { STUDIO_META, type Project } from '@/data/work'

export type Sized = { p: Project; i: number; visible: boolean; size: 'lg' | 'sm' | 'full' }

/* ------------------------------------------------------------------ */
/* Grid view — rounded media cards, alternating 7/5 columns            */
/* ------------------------------------------------------------------ */
export function WorkGrid({ items }: { items: Sized[] }) {
  return (
    <div className="wk-grid">
      {items.map(({ p, i, visible, size }) => {
        const meta = STUDIO_META[p.studio]
        return (
          <article key={p.slug} data-flip-id={p.slug} className={`wk-item wk-cell wk-cell--${size} ${visible ? '' : 'is-out'}`} data-cursor="View" aria-hidden={!visible}>
            <div className="wk-media">
              <div className="wk-zoom">
                <Img src={media(p.image)} alt={`${p.name} — ${p.client}`} className="wk-img" parallax={12} wipe="up" />
              </div>
              <div className="wk-shade" />
              <div className="wk-pills">
                {p.services.map((s) => (
                  <span key={s} className="pill wk-pill">
                    {s}
                  </span>
                ))}
              </div>
              <span className="pill wk-pill wk-studio">
                <i style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />
                {meta.label}
              </span>
              <span className="wk-idx mono">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="wk-cap">
              <h3 className="wk-name">
                <span>{p.name}</span>
                <span className="wk-client">{p.client}</span>
              </h3>
              <span className="mono wk-year">{p.year}</span>
            </div>
            <p className="wk-summary">{p.summary}</p>
          </article>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* List view — rows with a floating preview that follows the cursor    */
/* ------------------------------------------------------------------ */
export function WorkList({ items }: { items: Sized[] }) {
  const root = useRef<HTMLDivElement>(null)
  const prev = useRef<HTMLDivElement>(null)
  const api = useRef<{ x?: gsap.QuickToFunc; y?: gsap.QuickToFunc; active: number }>({ active: -1 })

  useGSAP(
    () => {
      const el = prev.current!
      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.6 })
      api.current.x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
      api.current.y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })
    },
    { scope: root },
  )

  const show = (idx: number, e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = prev.current!
    if (api.current.active === -1) {
      gsap.set(el, { x: e.clientX, y: e.clientY })
      gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out' })
    }
    api.current.active = idx
    el.querySelectorAll<HTMLElement>('.wk-prev-img').forEach((img) => {
      const on = Number(img.dataset.i) === idx
      gsap.to(img, { clipPath: on ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.out', overwrite: true, zIndex: on ? 2 : 1 })
    })
    gsap.to(el.querySelector('.wk-prev-label'), { autoAlpha: 1, duration: 0.3 })
    const lab = el.querySelector('.wk-prev-label span')
    if (lab) lab.textContent = items.find((it) => it.i === idx)?.p.name ?? ''
  }
  const hide = () => {
    api.current.active = -1
    gsap.to(prev.current, { autoAlpha: 0, scale: 0.6, duration: 0.5, ease: 'expo.out' })
  }
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    api.current.x?.(e.clientX)
    api.current.y?.(e.clientY)
  }

  return (
    <div ref={root} className="wk-list" onPointerMove={move} onPointerLeave={hide}>
      <div className="wk-row wk-row--head mono" aria-hidden>
        <span>No.</span>
        <span>Project</span>
        <span className="wk-col-client">Client</span>
        <span className="wk-col-svc">Services</span>
        <span className="wk-col-studio">Studio</span>
        <span className="wk-col-year">Year</span>
      </div>
      {items.map(({ p, i, visible }) => {
        const meta = STUDIO_META[p.studio]
        return (
          <div
            key={p.slug}
            data-flip-id={p.slug}
            className={`wk-item wk-row ${visible ? '' : 'is-out'}`}
            data-cursor="View"
            aria-hidden={!visible}
            onPointerEnter={(e) => show(i, e)}
            style={{ ['--c' as string]: meta.color }}
          >
            <span className="mono wk-row-idx">{String(i + 1).padStart(2, '0')}</span>
            <span className="display wk-row-name">
              <span className="wk-row-name-in">{p.name}</span>
            </span>
            <span className="wk-row-client wk-col-client">{p.client}</span>
            <span className="mono wk-row-svc wk-col-svc">{p.services.join(' · ')}</span>
            <span className="mono wk-row-studio wk-col-studio">
              <i style={{ background: meta.color }} />
              {meta.label}
            </span>
            <span className="mono wk-row-year wk-col-year">{p.year}</span>
          </div>
        )
      })}

      <div ref={prev} className="wk-prev" aria-hidden>
        {items.map(({ p, i }) => (
          <div key={p.slug} className="wk-prev-img" data-i={i} style={{ clipPath: 'inset(0% 0% 100% 0%)' }}>
            <img src={media(p.image, 'sm')} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
        <div className="wk-prev-label mono">
          <span />
        </div>
      </div>
    </div>
  )
}
