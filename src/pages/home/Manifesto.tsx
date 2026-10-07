import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/smooth'
import ParticleMorph from '@/gl/ParticleMorph'
import { MonoLabel, Brackets } from '@/components/ui'
import './manifesto.css'

const TEXT =
  'NMYT is a small studio with big standards. Two teams, one roof: a Tech Studio that builds websites, landing pages and simple systems — and a Creative Studio that shoots films, products and content. Most businesses juggle five vendors to get there. You get one team, one standard, one story.'

const STAGES = [
  { k: 'Tech Studio', v: 'A website, wireframed.', c: 'var(--sky)' },
  { k: 'Creative Studio', v: 'A lens, wide open.', c: 'var(--acid)' },
  { k: 'NMYT', v: 'One mark. Both crafts.', c: 'var(--fg)' },
]

const FACTS = [
  { n: '2', l: 'Studios' },
  { n: '11', l: 'Disciplines' },
  { n: '1', l: 'Team, start to finish' },
  { n: '0', l: 'Templates' },
]

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [stage, setStage] = useState(0)

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>('.mf-w')
      ScrollTrigger.create({
        trigger: '.mf-pin',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress
          // morph 0 → 2 between 18% and 86% of the pin
          const m = gsap.utils.clamp(0, 2, gsap.utils.mapRange(0.18, 0.86, 0, 2, p))
          progress.current = m
          const s = m < 0.5 ? 0 : m < 1.5 ? 1 : 2
          setStage((prev) => (prev === s ? prev : s))
          // words light up across the first 55%
          const lit = gsap.utils.clamp(0, 1, p / 0.55) * words.length
          words.forEach((w, i) => {
            const o = gsap.utils.clamp(0.14, 1, lit - i + 1)
            w.style.opacity = String(o)
          })
        },
      })
      gsap.fromTo(
        '.mf-fact',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.mf-facts', start: 'top 95%', once: true } },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="mf" aria-label="About NMYT">
      <div className="mf-pin">
      <div className="mf-sticky">
        <div className="mf-grid wrap">
          <div className="mf-copy">
            <MonoLabel index="02">About NMYT</MonoLabel>
            <p className="mf-text">
              {TEXT.split(' ').map((w, i) => (
                <span key={i} className="mf-w">
                  {w}{' '}
                </span>
              ))}
            </p>
            <ol className="mf-stages">
              {STAGES.map((s, i) => (
                <li key={s.k} className={i === stage ? 'is-on' : ''} style={{ ['--c' as string]: s.c }}>
                  <span className="mono mf-si">0{i + 1}</span>
                  <span className="mf-sk">{s.k}</span>
                  <span className="mf-sv serif">{s.v}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mf-stage">
            <Brackets color="rgba(255,255,255,.28)" size={16} />
            <ParticleMorph progress={progress} />
            <div className="mf-stage-cap mono">
              <span>Fig. 0{stage + 1}</span>
              <span>{STAGES[stage].k}</span>
            </div>
            <div className="mf-stage-hint mono">Move your cursor through it</div>
          </div>
        </div>
      </div>
      </div>
      <div className="mf-facts wrap">
        {FACTS.map((f) => (
          <div key={f.l} className="mf-fact">
            <span className="display mf-n">{f.n}</span>
            <span className="mono mf-l">{f.l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
