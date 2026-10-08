import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { Link } from 'react-router-dom'
import { gsap } from '@/lib/smooth'
import { TECH_SERVICES, CREATIVE_SERVICES } from '@/data/site'
import { Head } from '@/components/Simple'
import './studios.css'

/** Tech: three layers of a build (system, code, interface) floating apart and assembling. */
function TechVisual() {
  return (
    <div className="sc-iso" aria-hidden>
      <div className="sc-iso-stack">
        <div className="sc-pl sc-pl--1" />
        <div className="sc-pl sc-pl--2">
          <i style={{ width: '62%' }} />
          <i style={{ width: '84%' }} />
          <i style={{ width: '46%' }} />
          <i style={{ width: '72%' }} />
          <i style={{ width: '38%' }} />
        </div>
        <div className="sc-pl sc-pl--3">
          <b className="sc-ui sc-ui--nav" />
          <b className="sc-ui sc-ui--hero" />
          <b className="sc-ui sc-ui--img" />
          <b className="sc-ui sc-ui--a" />
          <b className="sc-ui sc-ui--b" />
          <b className="sc-ui sc-ui--c" />
        </div>
      </div>
    </div>
  )
}

const BLADES = 7

/** Creative: a lens. The iris breathes, the rings turn, light moves in the glass. */
function CreativeVisual() {
  return (
    <div className="sc-lens" aria-hidden>
      <svg viewBox="-160 -160 320 320">
        <defs>
          <radialGradient id="sc-glass" cx="38%" cy="34%" r="80%">
            <stop offset="0" stopColor="#eaffd0" />
            <stop offset="0.22" stopColor="#8dff4a" />
            <stop offset="0.55" stopColor="#00d38a" />
            <stop offset="0.85" stopColor="#0b5fb0" />
            <stop offset="1" stopColor="#06143a" />
          </radialGradient>
          <linearGradient id="sc-blade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0e2a1c" />
            <stop offset="1" stopColor="#030806" />
          </linearGradient>
          <radialGradient id="sc-shine">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="sc-bore">
            <circle r="104" />
          </clipPath>
        </defs>
        <circle className="sc-ring sc-ring--a" r="150" />
        <circle className="sc-ring sc-ring--b" r="132" />
        <circle r="112" fill="#04090a" />
        <g clipPath="url(#sc-bore)">
          <circle className="sc-glass" r="104" fill="url(#sc-glass)" />
          <ellipse className="sc-glint" cx="-34" cy="-40" rx="62" ry="30" />
          <g className="sc-iris">
            {Array.from({ length: BLADES }, (_, k) => (
              <g key={k} transform={`rotate(${(k * 360) / BLADES})`}>
                <g className="sc-blade">
                  <rect x="0" y="-130" width="150" height="260" fill="url(#sc-blade)" />
                  <rect x="0" y="-130" width="1.4" height="260" fill="#9dff66" opacity="0.55" />
                </g>
              </g>
            ))}
          </g>
        </g>
        <circle className="sc-lip" r="104" />
      </svg>
    </div>
  )
}

const SIDES = [
  {
    key: 'tech',
    to: '/tech',
    name: 'Tech',
    line: 'Landing pages, websites and simple systems. Fast, clean and built to be used.',
    list: TECH_SERVICES,
    Visual: TechVisual,
  },
  {
    key: 'creative',
    to: '/creative',
    name: 'Creative',
    line: 'Brand films, product shoots, social and ads. Made to be felt, not scrolled past.',
    list: CREATIVE_SERVICES,
    Visual: CreativeVisual,
  },
] as const

/**
 * The two studios as a pair of cards. Each carries one moving picture of what it does; the
 * card leans toward the pointer and a light follows it across the surface.
 */
export default function Studios() {
  const root = useRef<HTMLElement>(null)

  // the pictures only run while the section is on screen
  useEffect(() => {
    const el = root.current!
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-live', e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The cards rise in. They stay painted (just transparent) while they wait, so the browser has
  // them ready before they arrive and the scroll never stalls on them.
  useGSAP(
    () => {
      gsap.fromTo('.sc-wrap', { opacity: 0.001, y: 48 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.14, ease: 'expo.out', scrollTrigger: { trigger: '.sc-row', start: 'top 90%', once: true } })
    },
    { scope: root },
  )

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    if (e.pointerType === 'mouse') gsap.to(el, { rotateY: (x - 0.5) * 7, rotateX: -(y - 0.5) * 6, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
  }
  const onLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 1.1, ease: 'power3.out', overwrite: 'auto' })
  }

  return (
    <section ref={root} className="section st" id="studios">
      <div className="wrap">
        <Head
          eyebrow="Two studios"
          title={
            <>
              Pick your <em className="text-grad">side.</em>
              <br />
              Or take both.
            </>
          }
        />
        <div className="sc-row">
          {SIDES.map(({ key, to, name, line, list, Visual }) => (
            <div key={key} className="sc-wrap">
              <Link to={to} className={`sc sc--${key}`} onPointerMove={onMove} onPointerLeave={onLeave} aria-label={`${name} Studio`}>
                <span className="sc-light" aria-hidden />
                <div className="sc-vis">
                  <Visual />
                </div>
                <div className="sc-copy">
                  <h3 className="display sc-name">{name} studio</h3>
                  <p className="sc-line">{line}</p>
                  <ul className="sc-list">
                    {list.map((x) => (
                      <li key={x.n}>{x.title}</li>
                    ))}
                  </ul>
                </div>
                <span className="sc-go" aria-hidden>
                  <svg viewBox="0 0 24 24">
                    <path d="M6 18L18 6M18 6H8.5M18 6v9.5" />
                  </svg>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
