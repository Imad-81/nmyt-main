import { lazy, Suspense, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/smooth'
import { SCOPE_LABELS } from '@/gl/scopeMeta'
import './manifesto.css'

const ScopeMorph = lazy(() => import('@/gl/ScopeMorph'))

const TEXT =
  'NMYT is a small studio with big standards. Two teams, one roof: a Tech Studio that builds websites, landing pages and simple systems, and a Creative Studio that shoots films, products and content. Most businesses juggle five vendors to get there. You get one team, one standard, one story.'

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const [stage, setStage] = useState(1)

  useGSAP(
    () => {
      // words light up as the paragraph travels up the screen. Nothing is pinned.
      const words = gsap.utils.toArray<HTMLElement>('.mf-w')
      ScrollTrigger.create({
        trigger: '.mf-text',
        start: 'top 82%',
        end: 'bottom 45%',
        onUpdate: (self) => {
          const lit = self.progress * (words.length + 1)
          words.forEach((w, i) => {
            w.style.opacity = String(gsap.utils.clamp(0.16, 1, lit - i + 1))
          })
        },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="mf section" aria-label="About NMYT">
      <div className="mf-grid wrap">
        <div className="mf-copy">
          <div className="eyebrow mf-eyebrow">About NMYT</div>
          <p className="mf-text">
            {TEXT.split(' ').map((w, i) => (
              <span key={i} className="mf-w">
                {w}{' '}
              </span>
            ))}
          </p>
        </div>
        <div className="mf-stage">
          <Suspense fallback={null}>
            <ScopeMorph onStage={setStage} />
          </Suspense>
          <div className="mf-stage-cap" aria-hidden>
            {SCOPE_LABELS[stage]}
          </div>
        </div>
      </div>
    </section>
  )
}
