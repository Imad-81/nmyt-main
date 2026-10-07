import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { TECH_SERVICES, CREATIVE_SERVICES } from '@/data/site'
import { media } from '@/data/media'
import { SectionHead } from '@/components/ui'
import './studios.css'

type Side = 'tech' | 'creative'

const CODE = [
  '<Hero title="Built to perform" />',
  'const lcp = await measure(page)',
  '// 0.9s  ✓  a11y 100  ✓  seo 100',
  'deploy({ edge: true, cache: "smart" })',
  'dashboard.sync(bookings, invoices)',
  'export default function Launch() {}',
]

function TechVisual({ active }: { active: boolean }) {
  const [lines, setLines] = useState<string[]>([])
  useEffect(() => {
    if (!active) return
    let li = 0
    let ci = 0
    let buf: string[] = []
    const id = window.setInterval(() => {
      const cur = CODE[li % CODE.length]
      ci++
      const partial = cur.slice(0, ci)
      const next = [...buf, partial].slice(-5)
      setLines(next)
      if (ci >= cur.length) {
        buf = [...buf, cur].slice(-4)
        li++
        ci = 0
      }
    }, 38)
    return () => window.clearInterval(id)
  }, [active])
  return (
    <div className="sc-vis sc-vis--tech" aria-hidden>
      <div className="sc-browser">
        <div className="sc-browser-bar">
          <i />
          <i />
          <i />
          <span className="mono">nmyt.build / preview</span>
        </div>
        <div className="sc-wire">
          <b className="w1" />
          <b className="w2" />
          <b className="w3" />
          <b className="w4" />
          <b className="w5" />
          <b className="w6" />
        </div>
      </div>
      <pre className="sc-code mono">
        {lines.map((l, i) => (
          <div key={i}>
            <span className="sc-ln">{String(i + 1).padStart(2, '0')}</span> {l}
            {i === lines.length - 1 && <span className="sc-caret" />}
          </div>
        ))}
      </pre>
    </div>
  )
}

function CreativeVisual() {
  return (
    <div className="sc-vis sc-vis--creative" aria-hidden>
      <div className="sc-frame">
        <div className="sc-frame-img" style={{ backgroundImage: `url(${media('creativePortrait', 'sm')})` }} />
        <div className="sc-scan" />
        <div className="sc-frame-hud mono">
          <span>
            <i /> REC
          </span>
          <span>ISO 800 · T2.0 · 5600K</span>
        </div>
        <div className="sc-frame-safe" />
      </div>
      <div className="sc-strip">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ backgroundImage: `url(${media(i % 2 ? 'creativeProduct' : 'creativeCommercial', 'sm')})` }} />
        ))}
      </div>
    </div>
  )
}

export default function Studios() {
  const root = useRef<HTMLElement>(null)
  const [hover, setHover] = useState<Side | null>(null)
  const nav = useNavigate()

  useGSAP(
    () => {
      gsap.fromTo(
        '.sc',
        { y: 120, autoAlpha: 0, rotateX: 12 },
        { y: 0, autoAlpha: 1, rotateX: 0, duration: 1.6, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: '.sc-row', start: 'top 85%', once: true } },
      )
    },
    { scope: root },
  )

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    if (e.pointerType === 'mouse') gsap.to(el, { rotateY: (x - 0.5) * 5, rotateX: -(y - 0.5) * 5, duration: 0.8, ease: 'power3.out' })
  }
  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
    setHover(null)
  }

  const card = (side: Side) => {
    const tech = side === 'tech'
    const list = tech ? TECH_SERVICES : CREATIVE_SERVICES
    const state = hover === side ? 'is-open' : hover ? 'is-dim' : ''
    return (
      <article
        className={`sc sc--${side} ${state}`}
        onPointerEnter={() => setHover(side)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={() => nav(tech ? '/tech' : '/creative')}
       
        role="link"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && nav(tech ? '/tech' : '/creative')}
        aria-label={tech ? 'Tech Studio' : 'Creative Studio'}
      >
        <div className="sc-spot" />
        <div className="sc-glow" />
        <div className="sc-edge" />
        <div className="sc-body">
          <h3 className="display sc-title">
            {tech ? 'Tech' : 'Creative'}
            <br />
            <em className="serif">studio</em>
          </h3>
          <p className="sc-lede">
            {tech
              ? 'Landing pages, websites and simple systems, fast, clean and built to be used.'
              : 'Brand films, product shoots, social and ads, made to be felt, not scrolled past.'}
          </p>
          <ul className="sc-list">
            {list.map((s) => (
              <li key={s.n}>
                <span className="mono">{s.n}</span>
                {s.title}
              </li>
            ))}
          </ul>
        </div>
        {tech ? <TechVisual active={hover === 'tech'} /> : <CreativeVisual />}
        <footer className="sc-foot">
          <span className="mono">Enter the {tech ? 'Tech' : 'Creative'} Studio</span>
          <span className="sc-arrow">
            <svg viewBox="0 0 16 16" width="16" height="16">
              <path d="M3 13L13 3M13 3H5M13 3v8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </footer>
      </article>
    )
  }

  return (
    <section ref={root} className="section st" id="studios">
      <div className="wrap">
        <SectionHead
          index="03"
          label="Two studios"
          title={
            <>
              Pick your <em className="serif text-grad">side.</em>
              <br />
              Or take both.
            </>
          }
          aside={<span className="mono hidden text-[var(--fg-3)] md:inline">Hover to explore</span>}
        />
        <div className="sc-row">
          {card('tech')}
          <div className={`sc-seam ${hover ? 'is-' + hover : ''}`} aria-hidden>
            <img src="/brand/nmyt-logo-h34.png" srcSet="/brand/nmyt-logo-h34.png 1x, /brand/nmyt-logo-h43.png 1.25x, /brand/nmyt-logo-h68.png 2x" alt="" />
          </div>
          {card('creative')}
        </div>
      </div>
    </section>
  )
}
