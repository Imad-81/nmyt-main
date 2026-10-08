import { useEffect, useRef, useState, type ReactNode } from 'react'
import { TECH_SERVICES } from '@/data/site'
import { Reveal } from '@/components/Reveal'
import { TechHead } from './shared'

/* Line-art icons. Every stroke uses pathLength=1 so CSS can draw it on (dashoffset 1 → 0). */
const P = ({ d, i }: { d: string; i: number }) => <path className="d" d={d} pathLength={1} style={{ ['--i' as string]: i }} />

const ICONS: Record<string, ReactNode> = {
  // landing page — one page, one job
  '01': (
    <>
      <P i={0} d="M15 8h34a3 3 0 0 1 3 3v42a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z" />
      <P i={1} d="M12 16h40" />
      <P i={2} d="M19 25h24M19 30.5h16" />
      <P i={3} d="M21.5 37h9a2.5 2.5 0 0 1 0 5h-9a2.5 2.5 0 0 1 0-5z" />
      <P i={4} d="M32 46v5M29 48.5l3 3 3-3" />
      <circle className="pulse" cx="26" cy="39.5" r="1.6" />
    </>
  ),
  // websites — stacked windows
  '02': (
    <>
      <P i={0} d="M10 42V15a3 3 0 0 1 3-3h32" />
      <P i={1} d="M19 18h32a3 3 0 0 1 3 3v28a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V21a3 3 0 0 1 3-3z" />
      <P i={2} d="M16 25h38" />
      <P i={3} d="M22 31h14M22 36h24M22 41h18" />
      <circle className="pulse" cx="21" cy="21.5" r="1.2" />
    </>
  ),
  // dashboards — axes, bars, trend
  '03': (
    <>
      <P i={0} d="M10 12v40h44" />
      <P i={1} d="M19 52V41M27 52V35M35 52V39M43 52V28" />
      <P i={2} d="M14 33l8-8 8 4 10-12 10 5" />
      <circle className="pulse" cx="40" cy="17" r="2" />
    </>
  ),
  // UI/UX — the pen tool
  '04': (
    <>
      <P i={0} d="M10 46C22 14 42 14 54 46" />
      <P i={1} d="M10 46L22 15M54 46L42 15" />
      <P i={2} d="M8 44h4v4H8zM52 44h4v4h-4z" />
      <P i={3} d="M30 30v15l4-4 3.5 6.5 2.5-1.3-3.5-6.4h5.5z" />
      <circle className="pulse" cx="22" cy="15" r="2" />
    </>
  ),
  // care — the loop that keeps improving
  '05': (
    <>
      <P i={0} d="M49 22a20 20 0 1 0 3.5 14" />
      <P i={1} d="M50 13v9h-9" />
      <P i={2} d="M19 33h6l3-7 4 14 4-11 2 4h7" />
      <circle className="pulse" cx="32" cy="32" r="2" />
    </>
  ),
}

export default function TechServices() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)

  // the list turns over on its own clock while it is on screen; a pointer or focus holds it
  useEffect(() => {
    if (held) return
    let on = false
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting), { threshold: 0.35 })
    io.observe(root.current!)
    const id = window.setInterval(() => on && setActive((a) => (a + 1) % TECH_SERVICES.length), 4200)
    return () => {
      window.clearInterval(id)
      io.disconnect()
    }
  }, [held])

  return (
    <section ref={root} className="tv tk-section" id="services">
      <div className="wrap">
        <TechHead
          label="Services"
          title={
            <>
              What we <em className="serif">build.</em>
            </>
          }
          lede="Five services, one standard. Take one, or let us run the whole thing: design, code, launch and care."
        />
        <div className="tv-grid">
          <Reveal className="tv-list" childSelector=".tv-it" stagger={0.07} y={26} start="top 85%">
            <div onPointerLeave={() => setHeld(false)}>
              {TECH_SERVICES.map((s, i) => (
                <div key={s.n} className={`tv-it ${active === i ? 'is-active' : ''}`}>
                  <button
                    type="button"
                    className="display tv-t"
                    aria-pressed={active === i}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== 'mouse') return
                      setActive(i)
                      setHeld(true)
                    }}
                    onFocus={() => {
                      setActive(i)
                      setHeld(true)
                    }}
                    onBlur={() => setHeld(false)}
                    onClick={() => setActive(i)}
                  >
                    {s.title}
                  </button>
                  <p className="tv-b tv-b--inline">{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal className="tv-stage" y={26} start="top 85%">
            {TECH_SERVICES.map((s, i) => (
              <div key={s.n} className={`tv-pane ${active === i ? 'is-active' : ''}`} aria-hidden={active !== i}>
                <span className="tv-ic" aria-hidden>
                  <svg viewBox="0 0 64 64">{ICONS[s.n]}</svg>
                </span>
                <p className="tv-b">{s.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
