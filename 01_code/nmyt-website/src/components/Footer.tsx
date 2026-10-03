import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, getLenis } from '@/lib/smooth'
import { SITE } from '@/data/site'
import { MARK_PATH, MARK_VIEWBOX } from '@/gl/markPath'
import { MagneticButton } from './MagneticButton'
import { SplitReveal } from './Reveal'
import './footer.css'

export default function Footer({ accent = 'master' }: { accent?: 'master' | 'tech' | 'creative' }) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const path = ref.current!.querySelector<SVGPathElement>('.ft-mark-line')!
      const len = path.getTotalLength()
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 70%', end: 'bottom bottom', scrub: 1 },
      })
      gsap.fromTo('.ft-mark-fill', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'center 60%', end: 'bottom bottom', scrub: 1 } })
    },
    { scope: ref },
  )
  const year = new Date().getFullYear()
  return (
    <footer ref={ref} className={`ft ft--${accent}`}>
      <div className="ft-glow" />
      <div className="wrap relative">
        <div className="ft-cta">
          <div className="mono ft-kicker">
            <span>[ Next ]</span> Have something worth making?
          </div>
          <SplitReveal as="h2" className="display ft-title">
            Let’s make it <em className="serif">move.</em>
          </SplitReveal>
          <div className="ft-cta-row">
            <p className="lede max-w-[34ch]">Tell us what you’re building. We’ll come back with a plan, a timeline and an honest quote.</p>
            <div className="flex flex-wrap gap-3">
              <MagneticButton to="/contact" variant={accent === 'creative' ? 'acid' : accent === 'tech' ? 'sky' : 'light'}>
                Start a project
              </MagneticButton>
              <MagneticButton href={`mailto:${SITE.email}`} variant="ghost">
                {SITE.email}
              </MagneticButton>
            </div>
          </div>
        </div>

        <div className="ft-grid">
          <div>
            <div className="mono ft-h">Studios</div>
            <Link to="/tech">Tech Studio</Link>
            <Link to="/creative">Creative Studio</Link>
            <Link to="/originals">NMYT Originals</Link>
          </div>
          <div>
            <div className="mono ft-h">Explore</div>
            <Link to="/work">Work</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/">Home</Link>
          </div>
          <div>
            <div className="mono ft-h">Social</div>
            {SITE.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
          <div>
            <div className="mono ft-h">Say hello</div>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            {SITE.phone && <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>}
            {SITE.location && <span className="ft-muted">{SITE.location}</span>}
          </div>
        </div>
      </div>

      <div className="ft-mark-wrap">
        <svg className="ft-mark" viewBox={`0 0 ${MARK_VIEWBOX[0]} ${MARK_VIEWBOX[1]}`} preserveAspectRatio="xMidYMax meet" aria-hidden>
          <defs>
            <linearGradient id="ftg" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#1638ff" />
              <stop offset=".5" stopColor="#16b4ff" />
              <stop offset="1" stopColor="#7cff3a" />
            </linearGradient>
            <linearGradient id="ftf" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1638ff" stopOpacity=".22" />
              <stop offset="1" stopColor="#1638ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="ft-mark-fill" d={MARK_PATH} fill="url(#ftf)" fillRule="evenodd" />
          <path className="ft-mark-line" d={MARK_PATH} fill="none" stroke="url(#ftg)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="wrap ft-bar mono">
        <span>© {year} NMYT. All rights reserved.</span>
        <span className="ft-bar-mid">Tech Studio · Creative Studio · Originals</span>
        <button onClick={() => (getLenis() ? getLenis()!.scrollTo(0, { duration: 2.2 }) : window.scrollTo({ top: 0, behavior: 'smooth' }))} className="ft-top" data-cursor-hover>
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
