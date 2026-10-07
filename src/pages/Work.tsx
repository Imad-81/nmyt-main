import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { Flip } from 'gsap/Flip'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/smooth'
import Footer from '@/components/Footer'
import { Reveal, SplitReveal, whenRevealed } from '@/components/Reveal'
import { MonoLabel } from '@/components/ui'
import { PROJECTS, STUDIO_META, type Studio } from '@/data/work'
import { WorkGrid, WorkList, type Sized } from './work/WorkViews'
import './work/work.css'

gsap.registerPlugin(Flip)

type Filter = 'all' | 'tech' | 'creative' | 'hybrid'
const FILTERS: { k: Filter; label: string; color: string }[] = [
  { k: 'all', label: 'All', color: 'var(--fg)' },
  { k: 'tech', label: 'Tech', color: STUDIO_META.tech.color },
  { k: 'creative', label: 'Creative', color: STUDIO_META.creative.color },
  { k: 'hybrid', label: 'Hybrid', color: STUDIO_META.hybrid.color },
]

// Hybrid work belongs to both studios, so it shows under Tech and Creative too.
const matches = (f: Filter, s: Studio) => f === 'all' || s === f || (s === 'hybrid' && (f === 'tech' || f === 'creative'))

export default function Work() {
  const root = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const flipState = useRef<Flip.FlipState | null>(null)
  const viewChanged = useRef(false)
  const oldH = useRef(0)

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.k, PROJECTS.filter((p) => matches(f.k, p.studio)).length])) as Record<Filter, number>, [])

  // assign alternating sizes based on the visible order
  const items: Sized[] = useMemo(() => {
    const vis = PROJECTS.filter((p) => matches(filter, p.studio))
    return PROJECTS.map((p, i) => {
      const v = vis.indexOf(p)
      if (v < 0) return { p, i, visible: false, size: 'sm' as const }
      const lastOdd = vis.length % 2 === 1 && v === vis.length - 1
      const row = Math.floor(v / 2)
      const first = v % 2 === 0
      const size = lastOdd ? 'full' : (row % 2 === 0) === first ? 'lg' : 'sm'
      return { p, i, visible: true, size }
    })
  }, [filter])

  const choose = (f: Filter) => {
    if (f === filter) return
    const q = gsap.utils.selector(root)
    flipState.current = Flip.getState(q('.wk-item'), { props: 'opacity' })
    oldH.current = (q('.wk-grid, .wk-list')[0] as HTMLElement | undefined)?.offsetHeight ?? 0
    setFilter(f)
  }
  const switchView = (v: 'grid' | 'list') => {
    if (v === view) return
    viewChanged.current = true
    setView(v)
  }

  // animate filter changes with Flip
  useLayoutEffect(() => {
    const state = flipState.current
    if (!state) return
    flipState.current = null
    const reduce = prefersReducedMotion()
    const q = gsap.utils.selector(root)
    const dur = reduce ? 0.4 : 1
    // hold the container height so the page below doesn't jump while items go absolute
    const box = q('.wk-grid, .wk-list')[0] as HTMLElement | undefined
    if (box && oldH.current) gsap.fromTo(box, { height: oldH.current }, { height: box.offsetHeight, duration: dur, ease: 'expo.inOut', clearProps: 'height' })
    Flip.from(state, {
      targets: q('.wk-item'),
      duration: dur,
      ease: 'expo.inOut',
      absolute: true,
      prune: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: reduce ? 1 : 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'expo.out' }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: reduce ? 1 : 0.9, duration: 0.45, ease: 'power2.in' }),
      onComplete: () => ScrollTrigger.refresh(),
    })
  }, [filter])

  // animate view switches
  useLayoutEffect(() => {
    if (!viewChanged.current) return
    viewChanged.current = false
    const q = gsap.utils.selector(root)
    gsap.fromTo(q('.wk-item:not(.is-out)'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out', clearProps: 'transform' })
    ScrollTrigger.refresh()
  }, [view])

  // header count ticker
  useGSAP(
    (_ctx, contextSafe) => {
      const el = root.current!.querySelector('.wk-count b')
      if (!el) return
      const o = { v: 0 }
      return whenRevealed(contextSafe!(() => {
        gsap.to(o, { v: PROJECTS.length, duration: 1.6, delay: 0.6, ease: 'power3.out', onUpdate: () => void (el.textContent = String(Math.round(o.v)).padStart(2, '0')) })
      }))
    },
    { scope: root },
  )

  const visibleCount = counts[filter]

  return (
    <div ref={root} className="wk">
      <section className="wk-hero wrap">
        <Reveal trigger="intro" className="wk-top" childSelector=".wk-fade" delay={0.3}>
          <MonoLabel index="00" className="wk-fade">
            Index
          </MonoLabel>
          <div className="hairline wk-fade flex-1" />
          <span className="mono wk-fade wk-count">
            <b>00</b> Projects
          </span>
        </Reveal>
        <h1 className="display wk-title">
          <SplitReveal as="span" className="wk-line" type="chars" trigger="intro" delay={0.2} stagger={0.03} duration={1.4}>
            Selected
          </SplitReveal>
          <SplitReveal as="span" className="wk-line wk-line--2" type="chars" trigger="intro" delay={0.4} stagger={0.03} duration={1.4}>
            <em className="serif wk-em">work</em>
          </SplitReveal>
        </h1>
        <Reveal trigger="intro" delay={0.9} className="wk-intro">
          <p className="lede">Sites and systems from the Tech Studio. Films, shoots and content from the Creative Studio. Some projects need both.</p>
        </Reveal>
      </section>

      <section className="wrap wk-body">
        <Reveal className="wk-bar" childSelector=".wk-bar > *" stagger={0.1}>
          <div className="wk-filters" role="group" aria-label="Filter projects by studio">
            {FILTERS.map((f) => (
              <button key={f.k} type="button" className={`wk-filter ${filter === f.k ? 'is-on' : ''}`} aria-pressed={filter === f.k} onClick={() => choose(f.k)}>
                {f.k !== 'all' && <i style={{ background: f.color }} />}
                {f.label}
                <sup>{String(counts[f.k]).padStart(2, '0')}</sup>
              </button>
            ))}
          </div>
          <div className="wk-views" role="group" aria-label="Layout">
            <span className="mono wk-showing" aria-live="polite">
              Showing {String(visibleCount).padStart(2, '0')}
            </span>
            <div className="wk-toggle" data-view={view}>
              <span className="wk-toggle-knob" aria-hidden />
              <button type="button" aria-pressed={view === 'grid'} onClick={() => switchView('grid')}>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                  <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9" y="9" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                Grid
              </button>
              <button type="button" aria-pressed={view === 'list'} onClick={() => switchView('list')}>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                  <path d="M1.5 3.5h13M1.5 8h13M1.5 12.5h13" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                List
              </button>
            </div>
          </div>
        </Reveal>

        {view === 'grid' ? <WorkGrid items={items} /> : <WorkList items={items} />}
      </section>

      <Footer />
    </div>
  )
}
