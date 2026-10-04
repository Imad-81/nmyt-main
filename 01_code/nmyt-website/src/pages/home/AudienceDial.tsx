import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger, prefersReducedMotion, refreshScroll } from '@/lib/smooth'
import { AUDIENCES } from '@/data/site'
import { SectionHead } from '@/components/ui'
import MechanicalDial3D from './MechanicalDial3D'
import './audience-dial.css'

interface Archetype {
  id: string
  title: string
  desc: string
  tag: string
  deliverables: string[]
  accent: string
  focalStop: string
}

const ARCHETYPES: Archetype[] = [
  {
    id: '01',
    title: (AUDIENCES[0]?.k || 'Brands').toUpperCase(),
    desc: AUDIENCES[0]?.v || 'that need their look, film and web to finally match.',
    tag: 'ARCHETYPE 01 // BRAND RE-ALIGNMENT',
    deliverables: ['Film & Web Sync', 'Visual Identity System', 'Motion Language'],
    accent: 'var(--sky)',
    focalStop: 'f / 1.4',
  },
  {
    id: '02',
    title: (AUDIENCES[1]?.k || 'Mid-sized firms').toUpperCase(),
    desc: AUDIENCES[1]?.v || 'ready to replace the patchwork of freelancers with one team.',
    tag: 'ARCHETYPE 02 // UNIFIED SQUAD',
    deliverables: ['Unified Core Team', 'Zero Contractor Sprawl', 'Rapid Weekly Sprints'],
    accent: 'var(--ice)',
    focalStop: 'f / 2.8',
  },
  {
    id: '03',
    title: (AUDIENCES[2]?.k || 'Founder-led businesses').toUpperCase(),
    desc: AUDIENCES[2]?.v || 'where every week and every budget has to count.',
    tag: 'ARCHETYPE 03 // CAPITAL EFFICIENCY',
    deliverables: ['High ROI Execution', 'Direct Founder Comms', 'Production Agility'],
    accent: 'var(--acid)',
    focalStop: 'f / 5.6',
  },
  {
    id: '04',
    title: (AUDIENCES[3]?.k || 'Independent providers').toUpperCase(),
    desc: AUDIENCES[3]?.v || 'consultants, clinics, studios and creators building a name.',
    tag: 'ARCHETYPE 04 // HIGH AUTONOMY',
    deliverables: ['Authority Architecture', 'Signature Cinema Grade', 'Custom Web Presence'],
    accent: 'var(--emerald)',
    focalStop: 'f / 11',
  },
]

export default function AudienceDial() {
  const rootRef = useRef<HTMLDivElement>(null)
  const pinTargetRef = useRef<HTMLDivElement>(null)
  const rotorRef = useRef<SVGGElement>(null)
  const stageBoxRef = useRef<HTMLDivElement>(null)
  const degDisplayRef = useRef<HTMLSpanElement>(null)

  const [activeIdx, setActiveIdx] = useState(0)
  const activeIdxRef = useRef(0)
  const rotationDegRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, angle: 0 })

  // Mouse 3D tilt tracking for mechanical depth
  const mouseRef = useRef({ targetX: 0, targetY: 0, curX: 0, curY: 0 })

  useEffect(() => {
    const rootEl = rootRef.current
    const pinEl = pinTargetRef.current
    if (!rootEl || !pinEl) return

    const isReduced = prefersReducedMotion()

    // Smooth ScrollTrigger pinning: scrubs the dial rotation across 240% viewport height
    const st = ScrollTrigger.create({
      id: 'audience-dial-st',
      trigger: rootEl,
      start: 'top top',
      end: '+=240%',
      pin: pinEl,
      pinSpacing: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => {
        if (isDraggingRef.current) return
        const p = self.progress
        // Map 0 -> 1 progress to 0 -> -270 degrees
        const targetDeg = -p * 270
        rotationDegRef.current = targetDeg

        if (rotorRef.current) {
          rotorRef.current.style.transform = `rotate(${targetDeg.toFixed(2)}deg)`
        }
        if (degDisplayRef.current) {
          degDisplayRef.current.textContent = `${Math.abs(targetDeg).toFixed(1)}°`
        }

        // Active index calculation based on proximity to 0, 90, 180, 270 deg
        const rawIdx = p * 3
        const targetIdx = Math.min(3, Math.max(0, Math.round(rawIdx)))
        if (targetIdx !== activeIdxRef.current) {
          activeIdxRef.current = targetIdx
          setActiveIdx(targetIdx)
        }
      },
    })

    // Pointer move listener for 3D perspective tilt
    const handlePointerMove = (e: PointerEvent) => {
      const { innerWidth, innerHeight } = window
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 2
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    // RAF loop for smooth 3D stage tilt
    let animId: number
    const tick = () => {
      const m = mouseRef.current
      m.curX += (m.targetX - m.curX) * 0.08
      m.curY += (m.targetY - m.curY) * 0.08

      if (stageBoxRef.current && !isReduced) {
        const tiltX = -m.curY * 7
        const tiltY = m.curX * 9
        stageBoxRef.current.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    refreshScroll()

    return () => {
      st.kill()
      window.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  // Direct click on sector pill or dial word smoothly scrolls to target sector
  const handleSelectSector = (idx: number) => {
    setActiveIdx(idx)
    activeIdxRef.current = idx
    const targetDeg = -idx * 90
    rotationDegRef.current = targetDeg

    if (rotorRef.current) {
      rotorRef.current.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
      rotorRef.current.style.transform = `rotate(${targetDeg}deg)`
      setTimeout(() => {
        if (rotorRef.current) rotorRef.current.style.transition = 'none'
      }, 700)
    }
    if (degDisplayRef.current) {
      degDisplayRef.current.textContent = `${Math.abs(targetDeg).toFixed(1)}°`
    }

    // Synchronize page scroll position if pinned
    const rootEl = rootRef.current
    if (rootEl) {
      const scrollProgress = idx / 3
      const st = ScrollTrigger.getById('audience-dial-st')
      if (st) {
        const targetScroll = st.start + scrollProgress * (st.end - st.start)
        window.scrollTo({ top: targetScroll, behavior: 'smooth' })
      }
    }
  }

  // Interactive Drag-to-Rotate on Dial
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = true
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    dragStartRef.current = { x: centerX, y: centerY, angle: startAngle - rotationDegRef.current }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMoveDial = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return
    const { x, y, angle } = dragStartRef.current
    const currentAngle = Math.atan2(e.clientY - y, e.clientX - x) * (180 / Math.PI)
    let newRot = currentAngle - angle
    // Clamp rotation between 0 and -270 with slight elasticity
    newRot = Math.min(15, Math.max(-285, newRot))
    rotationDegRef.current = newRot

    if (rotorRef.current) {
      rotorRef.current.style.transform = `rotate(${newRot.toFixed(2)}deg)`
    }
    if (degDisplayRef.current) {
      degDisplayRef.current.textContent = `${Math.abs(newRot).toFixed(1)}°`
    }

    const rawIdx = -newRot / 90
    const clampedIdx = Math.min(3, Math.max(0, Math.round(rawIdx)))
    if (clampedIdx !== activeIdxRef.current) {
      activeIdxRef.current = clampedIdx
      setActiveIdx(clampedIdx)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if pointer capture already released
    }
    // Snap cleanly to nearest 90-degree sector
    const nearestSector = Math.min(3, Math.max(0, Math.round(-rotationDegRef.current / 90)))
    handleSelectSector(nearestSector)
  }

  const activeArchetype = ARCHETYPES[activeIdx]

  return (
    <div ref={rootRef} className="aud-dial-root">
      <div ref={pinTargetRef} className="aud-dial-pin">
        <div className="wrap aud-dial-wrap">
          {/* Header */}
          <div className="aud-dial-head">
            <SectionHead
              index="03"
              label="Built for"
              title={
                <>
                  Who we <em className="serif text-grad">work</em> with.
                </>
              }
            />
          </div>

          {/* Main Stage: 2-Column Responsive Dial Console */}
          <div className="aud-dial-grid">
            {/* Left Column: Live Narrative Display */}
            <div className="aud-narrative-col">
              <div className="aud-narrative-card">
                {/* Meta Header */}
                <div className="aud-card-meta mono">
                  <span className="aud-meta-tag" style={{ color: activeArchetype.accent }}>
                    {activeArchetype.tag}
                  </span>
                  <span className="aud-meta-stop">{activeArchetype.focalStop}</span>
                </div>

                {/* Big Active Title */}
                <h3 className="display aud-card-title">
                  {activeArchetype.title}
                </h3>

                {/* Narrative Description Text */}
                <p className="aud-card-desc">
                  {activeArchetype.desc}
                </p>

                {/* Tactical Impact Pills */}
                <div className="aud-card-deliv mono">
                  {activeArchetype.deliverables.map((item) => (
                    <span key={item} className="aud-deliv-pill">
                      <i style={{ background: activeArchetype.accent }} />
                      {item}
                    </span>
                  ))}
                </div>

                {/* Interactive Archetype Navigation Selector Tabs */}
                <div className="aud-selector-bar">
                  {ARCHETYPES.map((arch, i) => {
                    const isCurrent = activeIdx === i
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        className={`aud-selector-btn mono ${isCurrent ? 'is-active' : ''}`}
                        onClick={() => handleSelectSector(i)}
                      >
                        <span className="aud-btn-num">{arch.id}</span>
                        <span className="aud-btn-label">{arch.title}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Caliper HUD Telemetry */}
                <div className="aud-hud-bar mono" aria-hidden="true">
                  <div className="aud-hud-stat">
                    <span className="aud-hud-lbl">ROTATION</span>
                    <span ref={degDisplayRef} className="aud-hud-val">
                      0.0°
                    </span>
                  </div>
                  <div className="aud-hud-stat">
                    <span className="aud-hud-lbl">CALIPER</span>
                    <span className="aud-hud-val text-[var(--sky)]">APEX // LOCKED</span>
                  </div>
                  <div className="aud-hud-stat hidden sm:block">
                    <span className="aud-hud-lbl">TORQUE</span>
                    <span className="aud-hud-val">SCRUB LINKED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Precision 3D Circular Dial */}
            <div className="aud-dial-col">
              <div ref={stageBoxRef} className="aud-stage-box">
                {/* Real 3D Mechanical Dial rendered via Three.js with integrated 3D text */}
                <MechanicalDial3D rotationDegRef={rotationDegRef} activeIdx={activeIdx} />

                {/* Fixed Optical Reticle at 12 o'clock Apex */}
                <div className="aud-focal-reticle" aria-hidden="true">
                  <div className="aud-reticle-bracket">
                    <span className="aud-reticle-arrow">▼</span>
                    <span className="aud-reticle-laser" />
                  </div>
                  <div className="aud-reticle-hud mono">
                    <i className="aud-reticle-dot" style={{ background: activeArchetype.accent }} />
                    <span>ACTIVE FOCUS</span>
                  </div>
                </div>

                {/* Interactive Drag & Sector Tap Area */}
                <svg
                  className="aud-dial-svg"
                  viewBox="-440 -440 880 880"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMoveDial}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* ROTATING ROTOR: Invisible annular hitboxes for quadrant click navigation */}
                  <g ref={rotorRef} className="aud-dial-rotor">
                    {ARCHETYPES.map((arch, i) => {
                      const sectorAngle = i * 90
                      return (
                        <g
                          key={arch.id}
                          transform={`rotate(${sectorAngle})`}
                          className="aud-dial-quadrant"
                          onClick={() => handleSelectSector(i)}
                        >
                          <path
                            d="M -207.43 -230.37 A 310 310 0 0 1 207.43 -230.37"
                            fill="none"
                            stroke="transparent"
                            strokeWidth="90"
                            style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                          />
                        </g>
                      )
                    })}
                  </g>
                </svg>

                {/* Tactile Scrub Instruction Hint */}
                <div className="aud-dial-hint mono" aria-hidden="true">
                  <span>SCROLL OR DRAG TO ROTATE DIAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
