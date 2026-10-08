import { useEffect, useRef } from 'react'
import Footer from '@/components/Footer'
import { Reveal, SplitReveal } from '@/components/Reveal'
import { Steps } from '@/components/Simple'
import { MagneticButton } from '@/components/MagneticButton'
import { AUDIENCES, PROCESS } from '@/data/site'
import './about.css'

const FACTS = [
  { n: '2', l: 'Studios, one team' },
  { n: '11', l: 'Disciplines in-house' },
  { n: '2026', l: 'Founded in Hyderabad, India' },
  { n: '0', l: 'Templates' },
]

/** The Earth, seen from orbit, turning round India. Loads beside the page, never in front of it. */
function Earth() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let globe: { dispose: () => void } | null = null
    let gone = false
    import('@/gl/globe')
      .then(({ createGlobe }) => {
        if (!gone && ref.current) globe = createGlobe(ref.current)
      })
      .catch(() => {})
    return () => {
      gone = true
      globe?.dispose()
    }
  }, [])
  return <div ref={ref} className="ab-earth" aria-hidden />
}

/** /about: who NMYT is, in plain words. */
export default function About() {
  return (
    <div className="ab">
      <section className="ab-hero wrap">
        <Earth />
        <Reveal trigger="intro" delay={0.1} className="eyebrow ab-eyebrow">
          About NMYT
        </Reveal>
        <SplitReveal as="h1" className="display ab-title" trigger="intro" delay={0.2}>
          A creative tech studio with big standards.
        </SplitReveal>
        <div className="ab-cols">
          <Reveal trigger="intro" delay={0.5} className="ab-p">
            NMYT is a new-generation studio from Hyderabad. Two teams work under one roof: a Tech Studio that builds websites, landing pages and simple systems, and a Creative Studio that shoots films, products and content.
          </Reveal>
          <Reveal trigger="intro" delay={0.6} className="ab-p">
            Most businesses juggle five vendors to get there. Here the people who write your code sit next to the people who shoot your film, so nothing is lost between hands. One team, one standard, one story.
          </Reveal>
        </div>
        <Reveal className="ab-facts" childSelector=".ab-fact" stagger={0.08} y={20}>
          {FACTS.map((f) => (
            <div key={f.l} className="ab-fact">
              <span className="display ab-n">{f.n}</span>
              <span className="ab-l">{f.l}</span>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="section wrap">
        <Reveal className="eyebrow ab-eyebrow">Who we work with</Reveal>
        <Reveal className="ab-aud" childSelector=".ab-aud-row" stagger={0.07} y={24}>
          {AUDIENCES.map((a) => (
            <div key={a.k} className="ab-aud-row">
              <h3 className="display ab-aud-k">{a.k}</h3>
              <p className="ab-aud-v">{a.v}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <Steps eyebrow="How we work" title="Four steps. No surprise invoices." items={PROCESS.map(({ t, d }) => ({ title: t, body: d }))}>
        <div className="mt-12">
          <MagneticButton to="/contact" variant="light">
            Start a project
          </MagneticButton>
        </div>
      </Steps>
      <Footer />
    </div>
  )
}
