import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { gsap, getLenis, scrollToTop } from '@/lib/smooth'
import { MagneticButton } from './MagneticButton'
import { SITE } from '@/data/site'
import './nav.css'

export const NAV_LINKS = [
  { to: '/', label: 'Home', tag: '00' },
  { to: '/tech', label: 'Tech Studio', tag: '01' },
  { to: '/creative', label: 'Creative Studio', tag: '02' },
  { to: '/originals', label: 'Originals', tag: '03' },
  { to: '/work', label: 'Work', tag: '04' },
  { to: '/contact', label: 'Contact', tag: '05' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const loc = useLocation()

  useEffect(() => setOpen(false), [loc.pathname])

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (y < 120) {
        setHidden(false)
        last = y
      } else if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = menu.current
    if (!el) return
    const q = gsap.utils.selector(el)
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      gsap.set(el, { display: 'flex' })
      gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' })
      gsap.fromTo(q('.mm-link'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out', delay: 0.35 })
      gsap.fromTo(q('.mm-meta'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.7 })
    } else {
      lenis?.start()
      gsap.to(el, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.6,
        ease: 'expo.inOut',
        onComplete: () => {
          gsap.set(el, { display: 'none' })
        },
      })
    }
  }, [open])

  return (
    <>
      <header className={`nv ${hidden && !open ? 'nv--hidden' : ''} ${scrolled ? 'nv--scrolled' : ''}`}>
        <div className="nv-inner">
          <Link to="/" className="nv-logo" aria-label="NMYT home" data-cursor-hover>
            <img src="/brand/nmyt-logo-h34.png" srcSet="/brand/nmyt-logo-h34.png 1x, /brand/nmyt-logo-h43.png 1.25x, /brand/nmyt-logo-h51.png 1.5x, /brand/nmyt-logo-h68.png 2x" alt="NMYT" width={92} height={34} />
          </Link>

          <nav className="nv-links glass" aria-label="Primary">
            {NAV_LINKS.filter((l) => l.to !== '/contact').map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => {
                  if (l.to === '/' && loc.pathname === '/') {
                    scrollToTop(false)
                  }
                }}
                className={({ isActive }) => `nv-link ${isActive ? 'is-active' : ''}`}
              >
                <span className="nv-link-roll" data-text={l.label}>
                  {l.label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="nv-right">
            <MagneticButton to="/contact" variant="light" small>
              Start a project
            </MagneticButton>
            <button className={`nv-burger ${open ? 'is-open' : ''}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div ref={menu} className="mm" style={{ display: 'none' }}>
        <div className="mm-glow" />
        <nav className="mm-nav wrap">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="mm-row">
              <span className="mono mm-tag">{l.tag}</span>
              <span className="mask-line">
                <span className="mm-link display">{l.label}</span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="mm-meta wrap mono">
          <span>{SITE.email}</span>
          <span>{SITE.socials.map((s) => s.label).join(' · ')}</span>
        </div>
      </div>
    </>
  )
}
