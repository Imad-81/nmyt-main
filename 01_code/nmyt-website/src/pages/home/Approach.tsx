import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, refreshScroll } from '@/lib/smooth'
import { AUDIENCES } from '@/data/site'
import { SectionHead, Marquee, MonoLabel } from '@/components/ui'
import ProcessParticles from './ProcessParticles'
import './approach.css'

const STEPS = [
  {
    n: '01',
    tag: 'Phase 01 // Discovery',
    t: 'Listen',
    d: 'A real conversation about the business, the audience and the one thing that has to change.',
    deliverables: ['Problem definition', 'Audience mapping', 'Core ambition'],
    hud: 'CONVERSATION ACOUSTICS',
    tone: 'var(--ice)',
  },
  {
    n: '02',
    tag: 'Phase 02 // Architecture',
    t: 'Shape',
    d: 'Strategy, scope and a clear plan — what we’ll make, how long it takes, what it costs.',
    deliverables: ['Technical specs', 'Creative treatments', 'Fixed budget & timeline'],
    hud: 'GEOMETRIC BLUEPRINT',
    tone: 'var(--sky)',
  },
  {
    n: '03',
    tag: 'Phase 03 // Execution',
    t: 'Make',
    d: 'Design, code, shoot, cut, grade. One team, in-house, with you in the loop every week.',
    deliverables: ['Custom development', 'Film production', 'Weekly staging builds'],
    hud: 'CINEMA × CODE FORGE',
    tone: 'var(--acid)',
  },
  {
    n: '04',
    tag: 'Phase 04 // Velocity',
    t: 'Launch & grow',
    d: 'Ship it, measure it, improve it. We stay on for the next version, not just the first.',
    deliverables: ['Flawless deployment', 'Performance telemetry', 'Iteration roadmap'],
    hud: 'GROWTH TRAJECTORY',
    tone: 'var(--emerald)',
  },
]

export default function Approach() {
  const root = useRef<HTMLElement>(null)
  const particleProgress = useRef(0)
  const [activeStep, setActiveStep] = useState(0)
  const activeStepRef = useRef(0)

  useGSAP(
    () => {
      // Audiences text fill scrub
      gsap.utils.toArray<HTMLElement>('.ap-row').forEach((row) => {
        gsap.fromTo(
          row,
          { '--fill': '0%' },
          {
            '--fill': '100%',
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 45%', scrub: true },
          },
        )
      })

      // Vertical Rail laser fill animation
      gsap.fromTo(
        '.ap-rail-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.ap-flow',
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: true,
          },
        },
      )

      // Step focus detection syncing particle morph progress & active state
      const stepEls = gsap.utils.toArray<HTMLElement>('.ap-step-vert')
      if (stepEls.length === 0) return

      const updateActiveStep = () => {
        const focalY = window.innerHeight * 0.48
        let targetIndex = 0
        let closestDist = Infinity

        stepEls.forEach((el, idx) => {
          const rect = el.getBoundingClientRect()
          if (rect.top <= focalY && rect.bottom > focalY) {
            targetIndex = idx
            closestDist = 0
          } else if (closestDist > 0) {
            const center = (rect.top + rect.bottom) / 2
            const dist = Math.abs(center - focalY)
            if (dist < closestDist) {
              closestDist = dist
              targetIndex = idx
            }
          }
        })

        if (targetIndex !== activeStepRef.current) {
          activeStepRef.current = targetIndex
          setActiveStep(targetIndex)
          gsap.to(particleProgress, {
            current: targetIndex,
            duration: 0.85,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
      }

      ScrollTrigger.create({
        trigger: '.ap-flow',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: updateActiveStep,
        onRefresh: updateActiveStep,
      })

      updateActiveStep()
      refreshScroll()
    },
    { scope: root },
  )

  const handleStepClick = (index: number) => {
    activeStepRef.current = index
    setActiveStep(index)
    gsap.to(particleProgress, { current: index, duration: 0.85, ease: 'power2.out', overwrite: 'auto' })
    const steps = root.current?.querySelectorAll<HTMLElement>('.ap-step-vert')
    if (steps && steps[index]) {
      steps[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <section ref={root} className="ap section">
      <div className="wrap">
        {/* Section 03: Audiences */}
        <SectionHead
          index="03"
          label="Built for"
          title={
            <>
              Who we <em className="serif text-grad">work</em> with.
            </>
          }
        />
        <div className="ap-list">
          {AUDIENCES.map((a) => (
            <div key={a.k} className="ap-row">
              <span className="display ap-k" data-text={a.k}>
                {a.k}
              </span>
              <span className="ap-v">{a.v}</span>
            </div>
          ))}
        </div>

        {/* Section 04: How We Work - Vertical Narrative & Sticky 3D Particle Morph */}
        <div className="ap-proc">
          <div className="ap-proc-head">
            <div className="flex items-center gap-3">
              <MonoLabel index="04">The Process</MonoLabel>
              <span className="ap-proc-badge mono">04 Phases</span>
            </div>
            <span className="mono text-xs text-[var(--fg-3)] hidden md:inline-block tracking-wider">
              IDEA → PRODUCTION → SCALE
            </span>
          </div>

          <div className="ap-pipeline">
            {/* Left: Continuous Vertical Flow with Laser Progress Rail */}
            <div className="ap-flow">
              <div className="ap-rail" aria-hidden="true">
                <div className="ap-rail-fill" />
              </div>

              {STEPS.map((s, i) => {
                const isActive = activeStep === i
                return (
                  <article
                    key={s.n}
                    className={`ap-step-vert ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleStepClick(i)}
                  >
                    <div className="ap-step-meta mono">
                      <span className="ap-step-tag" style={{ color: s.tone }}>
                        {s.tag}
                      </span>
                    </div>

                    <h3 className="display ap-step-title">
                      <span className="ap-step-num mono">{s.n}</span>
                      <span className="ap-step-name">{s.t}</span>
                    </h3>

                    <p className="ap-step-desc">{s.d}</p>

                    <div className="ap-step-deliv mono">
                      {s.deliverables.map((item) => (
                        <span key={item} className="ap-deliv-pill">
                          <i style={{ background: s.tone }} />
                          {item}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Right: Sticky 3D Particle Morph Stage */}
            <div className="ap-visual-col">
              <div className="ap-stage-box">
                {/* 3D WebGL Morphing Particles */}
                <ProcessParticles progress={particleProgress} className="ap-particles" />

                {/* Minimalist Studio Telemetry HUD Overlay */}
                <div className="ap-hud mono" aria-hidden="true">
                  <div className="ap-hud-top">
                    <span className="ap-hud-pill">
                      <i className="ap-hud-live" style={{ background: STEPS[activeStep].tone }} />
                      <span>{STEPS[activeStep].hud}</span>
                    </span>
                    <span className="ap-hud-phase">STAGE 0{activeStep + 1} / 04</span>
                  </div>

                  <div className="ap-hud-bot">
                    <span className="ap-hud-hint">INTERACTIVE 3D PARTICLES · MORPHING ON SCROLL</span>
                    <span className="ap-hud-fps">NMYT // CORE_GL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Marquee className="ap-mq" speed={48}>
        {[
          'Websites',
          'Landing pages',
          'Dashboards',
          'Brand films',
          'Product shoots',
          'Social',
          'Ads',
          'Brand design',
          'Cinematics',
          'Short films',
        ].map((w, i) => (
          <span key={w} className="display ap-mq-item">
            {w}
            <em className={i % 2 ? 'is-g' : ''}>✦</em>
          </span>
        ))}
      </Marquee>
    </section>
  )
}
