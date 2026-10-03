import { useRef, useState, useCallback } from 'react'
import ParticleMorph from '@/gl/ParticleMorph'

export const STAGES = [
  { k: 'Tech Studio', v: 'A website, wireframed.', c: 'var(--sky)', target: 0 },
  { k: 'Creative Studio', v: 'A lens, wide open.', c: 'var(--acid)', target: 1 },
  { k: 'NMYT Mark', v: 'One mark. Both crafts.', c: 'var(--fg)', target: 2 },
]

/**
 * Archived Discipline Particle Card & Stage Switcher
 * This component can be dropped into Tech, Creative, About, or any showcase page.
 */
export default function DisciplineParticleCard({ className }: { className?: string }) {
  const progress = useRef(0)
  const [activeStage, setActiveStage] = useState(0)

  const setStage = useCallback((target: number) => {
    progress.current = target
    setActiveStage(target)
  }, [])

  return (
    <div className={`mf-particle-bundle ${className || ''}`}>
      <ol className="mf-stages" role="tablist" aria-label="Discipline preview switcher">
        {STAGES.map((s, i) => (
          <li
            key={s.k}
            role="tab"
            tabIndex={0}
            aria-selected={i === activeStage}
            className={`mf-stage-item ${i === activeStage ? 'is-on' : ''}`}
            style={{ ['--c' as string]: s.c }}
            onMouseEnter={() => setStage(s.target)}
            onClick={() => setStage(s.target)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setStage(s.target)}
          >
            <span className="mono mf-si">0{i + 1}</span>
            <span className="mf-sk">{s.k}</span>
            <span className="mf-sv serif">{s.v}</span>
          </li>
        ))}
      </ol>

      <div className="mf-stage" aria-hidden="true">
        <ParticleMorph progress={progress} />
        <div className="mf-stage-cap mono">
          <span className="flex items-center gap-2">
            <i className="mf-stage-dot" style={{ background: STAGES[activeStage].c }} />
            <span>Interactive Discipline Morph</span>
          </span>
          <span>{STAGES[activeStage].k}</span>
        </div>
        <div className="mf-stage-hint mono">
          <span>Interactive 3D / Hover or Drag</span>
        </div>
      </div>
    </div>
  )
}
