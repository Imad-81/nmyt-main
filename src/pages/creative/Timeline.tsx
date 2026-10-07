import { useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, getLenis, prefersReducedMotion, ScrollTrigger } from '@/lib/smooth'
import { MonoLabel, Brackets } from '@/components/ui'
import { SplitReveal } from '@/components/Reveal'
import { media, type MediaKey } from '@/data/media'
import { useMediaQuery } from '@/lib/hooks'

const TOTAL = 60 // seconds on the fake timeline
const FPS = 24

type Clip = { a: number; b: number; name: string; img?: MediaKey }
const V1: Clip[] = [
  { a: 0, b: 0.2, name: 'A001_C004', img: 'creativeCommercial' },
  { a: 0.2, b: 0.41, name: 'A002_C011', img: 'workFashion' },
  { a: 0.41, b: 0.6, name: 'B001_C002', img: 'creativeProduct' },
  { a: 0.6, b: 0.81, name: 'A003_C007', img: 'workRestaurant' },
  { a: 0.81, b: 1, name: 'B002_C005', img: 'creativeSocial' },
]
const V2: Clip[] = [
  { a: 0.04, b: 0.16, name: 'TITLE_IN' },
  { a: 0.46, b: 0.56, name: 'LOWER_3RD' },
  { a: 0.87, b: 0.99, name: 'END_CARD' },
]
const A1: Clip[] = [
  { a: 0.02, b: 0.36, name: 'VO_01' },
  { a: 0.44, b: 0.78, name: 'VO_02' },
]
const A2: Clip[] = [{ a: 0, b: 1, name: 'MUSIC_BED_V3' }]

const STAGES = [
  { k: 'Concept', at: 0, body: 'Idea, script and boards. The feeling is decided before the camera comes out.' },
  { k: 'Shoot', at: 0.18, body: 'Studio or location, directed by the same team that will cut it.' },
  { k: 'Edit', at: 0.42, body: 'Story first. Cut for the screen it lives on — 16:9, 9:16, 1:1.' },
  { k: 'Grade', at: 0.64, body: 'Colour that makes every frame look like the same brand.' },
  { k: 'Sound', at: 0.84, body: 'Music, mix and design. Half of what the audience feels.' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const tcode = (p: number) => {
  const f = Math.round(p * TOTAL * FPS)
  const s = Math.floor(f / FPS)
  return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f % FPS)}`
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** deterministic waveform path (0..100 x 0..20) */
function wave(seed: number, n = 90) {
  let d = 'M0 10'
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100
    const h = 1.5 + 8 * Math.abs(Math.sin(i * 0.61 + seed) * Math.sin(i * 0.17 + seed * 2.3)) * (0.55 + 0.45 * Math.sin(i * 0.05 + seed))
    d += ` L${x.toFixed(2)} ${(10 - h).toFixed(2)} L${x.toFixed(2)} ${(10 + h).toFixed(2)}`
  }
  return d
}

function Lane({ label, clips, kind }: { label: string; clips: Clip[]; kind: 'v1' | 'v2' | 'a1' | 'a2' }) {
  const waves = useMemo(() => clips.map((_, i) => wave(i * 3.7 + (kind === 'a2' ? 11 : 2))), [clips, kind])
  return (
    <div className={`tl-lane tl-lane--${kind}`}>
      <span className="mono tl-lab">{label}</span>
      <div className="tl-lane-body">
        {clips.map((c, i) => (
          <div key={c.name} className="tl-clip" style={{ left: `${c.a * 100}%`, width: `${(c.b - c.a) * 100}%` }}>
            {(kind === 'a1' || kind === 'a2') && (
              <svg className="tl-wave" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden>
                <path d={waves[i]} />
              </svg>
            )}
            {kind === 'v1' && c.img && <img src={media(c.img, 'sm')} alt="" loading="lazy" decoding="async" className="tl-clip-thumb" />}
            <span className="tl-clip-name">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Timeline() {
  const root = useRef<HTMLElement>(null)
  const nle = useRef<HTMLDivElement>(null)
  const lanes = useRef<HTMLDivElement>(null)
  const tcEl = useRef<HTMLSpanElement>(null)
  const tcEl2 = useRef<HTMLSpanElement>(null)
  const grade = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const [clip, setClip] = useState(3)
  const [stage, setStage] = useState(3)
  const cur = useRef({ clip: 3, stage: 3 })
  const prog = useRef({ p: 0.72 })
  const trig = useRef<ScrollTrigger | null>(null)
  const seekTw = useRef<gsap.core.Tween | null>(null)
  const canPin = useMediaQuery('(min-width: 1024px) and (min-height: 760px)')
  const [reduce] = useState(prefersReducedMotion)
  const pinned = canPin && !reduce

  const apply = (p: number) => {
    nle.current?.style.setProperty('--p', p.toFixed(4))
    nle.current?.setAttribute('aria-valuenow', String(Math.round(p * 100)))
    const tc = tcode(p)
    if (tcEl.current) tcEl.current.textContent = tc
    if (tcEl2.current) tcEl2.current.textContent = tc
    const ci = Math.max(0, V1.findIndex((c) => p >= c.a && p <= c.b))
    let si = 0
    STAGES.forEach((s, i) => p >= s.at && (si = i))
    if (ci !== cur.current.clip) setClip((cur.current.clip = ci))
    if (si !== cur.current.stage) setStage((cur.current.stage = si))
    // LOG → graded as the playhead crosses the grade stage
    const g = smooth(0.64, 0.8, p)
    grade.current?.style.setProperty('--g', g.toFixed(3))
    // storyboard overlay during concept
    if (board.current) board.current.style.opacity = String(1 - smooth(0.12, 0.19, p))
  }

  useGSAP(
    () => {
      apply(prog.current.p)
      gsap.fromTo('.tl-monitor, .tl-stages, .tl-nle', { autoAlpha: 0, y: reduce ? 12 : 60 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
      if (reduce) return
      prog.current.p = 0
      apply(0)
      const tween = gsap.to(prog.current, {
        p: 1,
        ease: 'none',
        onUpdate: () => apply(prog.current.p),
        scrollTrigger: pinned
          ? { trigger: root.current, start: 'top top', end: '+=240%', pin: true, scrub: 0.6, anticipatePin: 1 }
          : { trigger: root.current, start: 'top 55%', end: 'bottom 70%', scrub: 0.6 },
      })
      trig.current = tween.scrollTrigger ?? null
      return () => {
        trig.current = null
      }
    },
    { scope: root, dependencies: [pinned], revertOnUpdate: true },
  )

  // scrub by dragging / clicking the timeline, or with arrow keys
  const seek = (p: number) => {
    p = Math.min(1, Math.max(0, p))
    const st = trig.current
    const lenis = getLenis()
    if (st && pinned) {
      const y = st.start + p * (st.end - st.start)
      if (lenis) lenis.scrollTo(y, { duration: 0.5 })
      else window.scrollTo(0, y)
      return
    }
    seekTw.current?.kill()
    seekTw.current = gsap.to(prog.current, { p, duration: reduce ? 0 : 0.45, ease: 'power3.out', onUpdate: () => apply(prog.current.p) })
  }
  const fromEvent = (e: React.PointerEvent) => {
    const r = lanes.current!.getBoundingClientRect()
    return (e.clientX - r.left) / r.width
  }
  const dragging = useRef(false)
  const onDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    seek(fromEvent(e))
  }
  const onMove = (e: React.PointerEvent) => dragging.current && seek(fromEvent(e))
  const onUp = () => (dragging.current = false)
  const onKey = (e: React.KeyboardEvent) => {
    const cur = prog.current.p
    if (e.key === 'ArrowRight') seek(cur + 0.02)
    else if (e.key === 'ArrowLeft') seek(cur - 0.02)
    else return
    e.preventDefault()
  }

  const ticks = Array.from({ length: 6 }, (_, i) => i * 10)

  return (
    <section ref={root} className={`tl ${pinned ? 'is-pinned' : ''}`}>
      <div className="wrap tl-inner">
        <div className="tl-head">
          <div className="tl-head-row">
            <MonoLabel index="04" color="var(--acid)">
              Pipeline
            </MonoLabel>
            <div className="hairline flex-1" />
            <span className="mono tl-head-tc">
              TC <span ref={tcEl2}>00:00:00:00</span>
            </span>
          </div>
          <SplitReveal as="h2" className="display tl-title" type="words" stagger={0.06}>
            Shot, cut, <em className="serif">graded</em> in-house.
          </SplitReveal>
        </div>

        <div className="tl-grid">
          <div className="tl-monitor">
            <div ref={grade} className="tl-frames">
              {V1.map((c, i) => (
                <div key={c.name} className={`tl-frame ${clip === i ? 'is-on' : ''}`}>
                  {c.img && <img src={media(c.img)} alt="" loading="lazy" decoding="async" />}
                </div>
              ))}
              <div className="tl-grade-tint" />
            </div>
            <div ref={board} className="tl-board" aria-hidden>
              <div className="tl-board-grid" />
              <div className="mono tl-board-txt">
                <span>SC_01 — OPEN ON PRODUCT.</span>
                <span>SLOW PUSH-IN. HARD LIGHT, DEEP SHADOW.</span>
                <span>CUT ON THE BEAT.</span>
              </div>
            </div>
            <div className="tl-safe" aria-hidden />
            <Brackets color="rgba(124,255,58,.7)" size={18} inset={14} />
            <div className="tl-hud mono" aria-hidden>
              <span className="tl-hud-tl">
                <i className="tl-rec" /> PGM — {V1[clip].name}
              </span>
              <span className="tl-hud-tr">
                <b className={stage >= 3 ? '' : 'is-on'}>LOG</b>
                <b className={stage >= 3 ? 'is-on' : ''}>REC.709</b>
              </span>
              <span className="tl-hud-bl">
                {STAGES[stage].k.toUpperCase()} / 0{stage + 1}
              </span>
              <span className="tl-hud-br">
                <span ref={tcEl}>00:00:00:00</span>
              </span>
            </div>
          </div>

          <ol className="tl-stages">
            {STAGES.map((s, i) => (
              <li key={s.k} className={i === stage ? 'is-on' : i < stage ? 'is-past' : ''}>
                <span className="mono tl-st-n">0{i + 1}</span>
                <div>
                  <span className="display tl-st-k">{s.k}</span>
                  <p className="tl-st-b">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div
          ref={nle}
          className="tl-nle"
          role="slider"
          tabIndex={0}
          aria-label="Timeline playhead"
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={onKey}
          data-cursor="Scrub"
          style={{ ['--p' as string]: '0.72' }}
        >
          <div className="tl-ruler">
            <span className="mono tl-lab">TC</span>
            <div className="tl-ruler-body">
              {ticks.map((t) => (
                <span key={t} className="mono tl-tick" style={{ left: `${(t / TOTAL) * 100}%` }}>
                  00:{pad(Math.floor(t / 60))}:{pad(t % 60)}
                </span>
              ))}
              {STAGES.map((s, i) => (
                <span key={s.k} className={`mono tl-marker ${i === stage ? 'is-on' : ''}`} style={{ left: `${s.at * 100}%` }}>
                  <b>0{i + 1}</b>
                  <span className="tl-marker-k">{s.k}</span>
                </span>
              ))}
            </div>
          </div>
          <div className={`tl-lanes-wrap ${stage === 4 ? 'is-sound' : ''}`} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <Lane label="V2" clips={V2} kind="v2" />
            <Lane label="V1" clips={V1} kind="v1" />
            <Lane label="A1" clips={A1} kind="a1" />
            <Lane label="A2" clips={A2} kind="a2" />
            <div ref={lanes} className="tl-lanes-measure" aria-hidden />
            <div className="tl-playhead" aria-hidden>
              <i />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
