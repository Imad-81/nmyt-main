import { Link } from 'react-router-dom'
import { getLenis } from '@/lib/smooth'
import { SITE } from '@/data/site'
import { MagneticButton } from './MagneticButton'
import { SplitReveal } from './Reveal'
import './footer.css'

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer({ accent = 'master' }: { accent?: 'master' | 'tech' | 'creative' }) {
  const year = CURRENT_YEAR
  return (
    <footer className={`ft ft--${accent}`}>
      <div className="ft-glow" />
      <div className="wrap relative">
        <div className="ft-cta">
          <div className="eyebrow ft-kicker">Have something worth making?</div>
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
            <Link to="/about">About</Link>
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

      {/* the white NMYT mark, with the logo's own gradient passing through it every 3 seconds */}
      <div className="ft-mark-wrap" role="img" aria-label="NMYT">
        <div className="ft-mark-glow" aria-hidden />
        <div className="ft-mark" aria-hidden />
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
