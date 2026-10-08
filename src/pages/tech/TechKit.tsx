import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/smooth'
import { Reveal } from '@/components/Reveal'
import { TechHead } from './shared'

/* ------------------------------------------------------------------ */
/* 01 — performance ring, counts to 100 on enter                       */
/* ------------------------------------------------------------------ */
const RING_R = 78
const RING_C = 2 * Math.PI * RING_R

function PerfRing() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = ref.current!
      const arc = el.querySelector<SVGCircleElement>('.pr-arc')!
      const num = el.querySelector<HTMLElement>('.pr-num')!
      const o = { v: 0 }
      const set = () => {
        num.textContent = String(Math.round(o.v))
        arc.style.strokeDashoffset = String(RING_C * (1 - o.v / 100))
      }
      set()
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
      tl.to(o, { v: 100, duration: prefersReducedMotion() ? 1 : 2.4, ease: 'expo.out', onUpdate: set })
        .fromTo('.pr-bar i', { scaleX: 0 }, { scaleX: 1, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, 0.2)
        .fromTo('.pr-row', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'expo.out' }, 0.1)
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="pr">
      <div className="pr-ring">
        <svg viewBox="0 0 200 200">
          <defs>
            <linearGradient id="prg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#16b4ff" />
              <stop offset="1" stopColor="#1638ff" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={RING_R} className="pr-track" />
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1="100" y1="8" x2="100" y2={i % 5 ? 12 : 15} className="pr-tick" transform={`rotate(${i * 6} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r={RING_R} className="pr-arc" stroke="url(#prg)" strokeDasharray={RING_C} strokeDashoffset={RING_C} transform="rotate(-90 100 100)" />
        </svg>
        <div className="pr-center">
          <span className="pr-num serif">0</span>
          <span className="mono pr-lbl">Performance</span>
        </div>
      </div>
      <div className="pr-rows">
        {['Accessibility', 'Best practices', 'SEO'].map((l) => (
          <div key={l} className="pr-row">
            <span className="mono">{l}</span>
            <span className="pr-bar">
              <i />
            </span>
            <svg viewBox="0 0 16 16" className="pr-ok">
              <path d="M3.5 8.5l3 3 6-7" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 02 — a landing page assembling itself, block by block               */
/* ------------------------------------------------------------------ */
function BrowserBuild() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = ref.current!
      const blocks = el.querySelectorAll('.bb-b')
      if (prefersReducedMotion()) {
        gsap.fromTo(blocks, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, stagger: 0.04, scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        return
      }
      const cursor = el.querySelector('.bb-cursor')
      const btn = el.querySelector('.bb-btn')
      const typed = el.querySelector<HTMLElement>('.bb-typed')!
      const url = 'yourbrand.com'
      const ty = { n: 0 }
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true })
      tl.set(blocks, { autoAlpha: 0, y: 16, scale: 0.97 })
        .set(cursor, { autoAlpha: 0, x: 140, y: 90 })
        .set(ty, { n: 0 })
        .to(ty, { n: url.length, duration: 0.9, ease: 'steps(13)', onUpdate: () => void (typed.textContent = url.slice(0, Math.round(ty.n))) })
        .to(blocks, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.09, ease: 'expo.out' }, '+=0.1')
        .to(cursor, { autoAlpha: 1, x: 0, y: 0, duration: 1.1, ease: 'power3.inOut' }, '-=0.3')
        .to(btn, { scale: 0.9, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' })
        .to(btn, { boxShadow: '0 0 0 8px rgba(22,180,255,.18)', duration: 0.3 }, '<')
        .to(btn, { boxShadow: '0 0 0 0px rgba(22,180,255,0)', duration: 0.6 })
        .to({}, { duration: 1.2 })
        .to(blocks, { autoAlpha: 0, y: -8, duration: 0.45, stagger: 0.025, ease: 'power2.in' })
        .to(cursor, { autoAlpha: 0, duration: 0.3 }, '<')
      ScrollTrigger.create({ trigger: el, start: 'top 85%', end: 'bottom 10%', onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="bb">
      <div className="bb-bar">
        <i />
        <i />
        <i />
        <span className="bb-url mono">
          <svg viewBox="0 0 16 16" aria-hidden>
            <path d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7M3.5 7h9v6.5h-9z" />
          </svg>
          <span className="bb-typed">yourbrand.com</span>
          <span className="bb-caret" />
        </span>
      </div>
      <div className="bb-page">
        <div className="bb-nav bb-b">
          <span className="bb-logo" />
          <span className="bb-links">
            <i />
            <i />
            <i />
          </span>
          <span className="bb-pill" />
        </div>
        <div className="bb-hero">
          <div className="bb-copy">
            <span className="bb-h bb-b" style={{ width: '92%' }} />
            <span className="bb-h bb-b" style={{ width: '64%' }} />
            <span className="bb-p bb-b" style={{ width: '80%' }} />
            <span className="bb-p bb-b" style={{ width: '56%' }} />
            <span className="bb-btnwrap bb-b">
              <span className="bb-btn" />
              <svg className="bb-cursor" viewBox="0 0 24 24" aria-hidden>
                <path d="M5 3l14 8-6 1.5L10 19z" />
              </svg>
            </span>
          </div>
          <div className="bb-img bb-b" />
        </div>
        <div className="bb-cards">
          <span className="bb-card bb-b" />
          <span className="bb-card bb-b" />
          <span className="bb-card bb-b" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 03 — a tiny live-feeling dashboard (no real data, no numbers)        */
/* ------------------------------------------------------------------ */
const CW = 320
const CH = 120
const N = 12
const SEED_LINE = [0.22, 0.3, 0.26, 0.42, 0.38, 0.5, 0.46, 0.6, 0.56, 0.7, 0.66, 0.82]
const SEED_BARS = [0.3, 0.44, 0.36, 0.52, 0.4, 0.62, 0.5, 0.58, 0.46, 0.7, 0.6, 0.76]
const px = (i: number) => (i * CW) / (N - 1)
const py = (v: number) => CH - 8 - v * (CH - 28)
const lineD = (d: number[]) => 'M' + d.map((v, i) => `${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' L')
const areaD = (d: number[]) => `${lineD(d)} L${CW} ${CH} L0 ${CH} Z`
const BW = CW / N - 8

function MiniDash() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = ref.current!
      const bars = gsap.utils.toArray<SVGRectElement>('.md-bar', el)
      const line = el.querySelector('.md-line')!
      const area = el.querySelector('.md-area')!
      const dot = el.querySelector('.md-dot')!
      const reduce = prefersReducedMotion()
      const intro = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
      intro
        .fromTo(bars, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', duration: 1.2, stagger: 0.05, ease: 'expo.out' })
        .fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: reduce ? 0.8 : 1.8, ease: 'power2.inOut' }, 0.2)
        .fromTo(area, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.8)
        .fromTo(dot, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(3)' }, 1.6)
        .fromTo('.md-kpi b', { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 1, stagger: 0.1, ease: 'expo.out' }, 0.3)
      if (reduce) return

      // gentle "live" drift — fresh random shape every few seconds while on screen
      let lineData = [...SEED_LINE]
      const update = () => {
        lineData = lineData.map((_, i) => gsap.utils.clamp(0.08, 0.95, 0.18 + (i / (N - 1)) * 0.62 + (Math.random() - 0.5) * 0.2))
        gsap.to(line, { attr: { d: lineD(lineData) }, duration: 1.4, ease: 'power3.inOut' })
        gsap.to(area, { attr: { d: areaD(lineData) }, duration: 1.4, ease: 'power3.inOut' })
        gsap.to(dot, { attr: { cy: py(lineData[N - 1]) }, duration: 1.4, ease: 'power3.inOut' })
        bars.forEach((b) => {
          const v = gsap.utils.clamp(0.15, 0.85, 0.25 + Math.random() * 0.55)
          const h = v * (CH - 28)
          gsap.to(b, { attr: { y: CH - h, height: h }, duration: 1.2, ease: 'power3.inOut' })
        })
        gsap.fromTo(el.querySelectorAll('.md-kpi b'), { scaleX: 0.6 }, { scaleX: 1, duration: 1.2, stagger: 0.08, ease: 'expo.out' })
      }
      const ticker = gsap.to({}, { duration: 2.8, repeat: -1, onRepeat: update, paused: true })
      ScrollTrigger.create({ trigger: el, start: 'top 80%', end: 'bottom 10%', onToggle: (s) => (s.isActive ? ticker.play() : ticker.pause()) })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className="md">
      <div className="md-side">
        <span className="md-logo" />
        <i className="is-on" />
        <i />
        <i />
        <i />
      </div>
      <div className="md-main">
        <div className="md-top">
          <span className="mono">Overview</span>
          <span className="md-live mono">
            <i /> Live
          </span>
        </div>
        <div className="md-kpis">
          {['Bookings', 'Enquiries', 'Returning'].map((k) => (
            <div key={k} className="md-kpi">
              <span className="mono">{k}</span>
              <b />
            </div>
          ))}
        </div>
        <svg className="md-chart" viewBox={`0 0 ${CW} ${CH}`} aria-hidden>
          <defs>
            <linearGradient id="mda" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#16b4ff" stopOpacity=".32" />
              <stop offset="1" stopColor="#16b4ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={CW} y1={CH * g} y2={CH * g} className="md-grid" />
          ))}
          {SEED_BARS.map((v, i) => {
            const h = v * (CH - 28)
            return <rect key={i} className="md-bar" x={(i * CW) / N + 4} y={CH - h} width={BW} height={h} rx="2" />
          })}
          <path className="md-area" d={areaD(SEED_LINE)} fill="url(#mda)" />
          <path className="md-line" d={lineD(SEED_LINE)} pathLength={1} />
          <circle className="md-dot" cx={CW - 3} cy={py(SEED_LINE[N - 1])} r="4" />
        </svg>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 04 — what ships with every build                                     */
/* ------------------------------------------------------------------ */
const INCLUDED = ['Mobile-first, responsive layouts', 'A CMS you can edit yourself', 'SEO foundations and metadata', 'Analytics from day one', 'Accessibility checks', 'Hosting, backups and updates']

function Checklist() {
  const ref = useRef<HTMLUListElement>(null)
  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true } })
      tl.fromTo('.ck-li', { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out' }).fromTo(
        '.ck-tick',
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        0.25,
      )
    },
    { scope: ref },
  )
  return (
    <ul ref={ref} className="ck">
      {INCLUDED.map((t) => (
        <li key={t} className="ck-li">
          <svg viewBox="0 0 20 20" className="ck-ic" aria-hidden>
            <circle cx="10" cy="10" r="10" />
            <path className="ck-tick" d="M5.8 10.4l2.8 2.8 5.6-6.2" pathLength={1} />
          </svg>
          <span className="ck-t">{t}</span>
        </li>
      ))}
    </ul>
  )
}

const KIT = [
  { title: 'Fast by default.', body: 'Every build is audited for speed, accessibility and SEO before it goes live.', vis: <PerfRing /> },
  { title: 'Designed and built end to end.', body: 'From first wireframe to live site. One team, no hand-offs.', vis: <BrowserBuild /> },
  { title: 'Tools your team will actually use.', body: 'Dashboards, booking flows and admin panels that replace spreadsheets and busywork.', vis: <MiniDash /> },
]

/* ------------------------------------------------------------------ */
export default function TechKit({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (reduce) return
      gsap.utils.toArray<HTMLElement>('.tk-orb', ref.current).forEach((o, i) => {
        gsap.fromTo(o, { yPercent: -20 + i * 10 }, { yPercent: 30 - i * 25, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    },
    { scope: ref, dependencies: [reduce] },
  )
  return (
    <section ref={ref} className="tk tk-section">
      <div className="tk-orbs" aria-hidden>
        <i className="tk-orb tk-orb--1" />
        <i className="tk-orb tk-orb--2" />
        <i className="tk-orb tk-orb--3" />
      </div>
      <div className="wrap relative">
        <TechHead
          label="What you get"
          title={
            <>
              Built
              <br />
              <em className="serif">properly.</em>
            </>
          }
          lede="No mystery deliverables. Every project ships fast, clean and yours to run. Here is what that looks like."
        />
        <Reveal className="tq-grid" childSelector=".tq" stagger={0.1} y={40} start="top 85%">
          {KIT.map((k) => (
            <article key={k.title} className="tq">
              <div className="tq-vis">{k.vis}</div>
              <h3 className="tq-t">{k.title}</h3>
              <p className="tq-b">{k.body}</p>
            </article>
          ))}
        </Reveal>
        <div className="tq-inc">
          <Reveal as="h3" className="tq-t" y={20}>
            In every build.
          </Reveal>
          <Checklist />
        </div>
        <p className="tq-note">Interface sketches, shown as examples.</p>
      </div>
    </section>
  )
}
