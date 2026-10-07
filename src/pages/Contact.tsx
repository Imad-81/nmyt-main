import { useRef, useState } from 'react'
import Footer from '@/components/Footer'
import { Reveal, SplitReveal } from '@/components/Reveal'
import { MonoLabel } from '@/components/ui'
import { SITE } from '@/data/site'
import BriefForm from './contact/BriefForm'
import './contact/contact.css'

const NEXT = [
  { n: '01', t: 'We read your brief and reply, usually with a few questions.' },
  { n: '02', t: 'A short call to understand the goal, the audience and the deadline.' },
  { n: '03', t: 'A plan, a timeline and an honest quote.' },
]

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(0)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${SITE.email}`
    }
  }

  return (
    <div className="ct">
      <section className="wrap ct-main">
        <div className="ct-left">
          <div className="ct-sticky">
            <Reveal trigger="intro" delay={0.2} className="ct-top">
              <MonoLabel index="00">Contact</MonoLabel>
            </Reveal>
            <h1 className="display ct-title">
              <SplitReveal as="span" className="ct-line" type="chars" trigger="intro" delay={0.2} stagger={0.035} duration={1.4}>
                Let’s
              </SplitReveal>
              <SplitReveal as="span" className="ct-line" type="chars" trigger="intro" delay={0.4} stagger={0.035} duration={1.4}>
                <em className="serif ct-em">talk.</em>
              </SplitReveal>
            </h1>
            <Reveal trigger="intro" delay={0.8} className="lede ct-lede">
              A website, a system, a film, a campaign, or all of it. Tell us what you’re making and we’ll tell you how we’d make it.
            </Reveal>

            <Reveal trigger="intro" delay={1} className="ct-mail">
              <div className="mono ct-k">Email</div>
              <div className="ct-mail-row">
                <a href={`mailto:${SITE.email}`} className="ct-mail-link" data-cursor-hover>
                  {SITE.email}
                </a>
                <button type="button" className="ct-copy mono" onClick={copy} aria-live="polite">
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            </Reveal>

            <Reveal trigger="intro" delay={1.1} className="ct-meta" childSelector=".ct-meta > div">
              <div>
                <div className="mono ct-k">Social</div>
                <ul className="ct-socials">
                  {SITE.socials.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noreferrer">
                        <span>{s.label}</span>
                        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                          <path d="M4 12L12 4M12 4H6M12 4v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mono ct-k">What happens next</div>
                <ol className="ct-next">
                  {NEXT.map((s) => (
                    <li key={s.n}>
                      <span className="mono">{s.n}</span>
                      {s.t}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal trigger="intro" delay={0.5} y={60} className="ct-right">
          <BriefForm />
        </Reveal>
      </section>
      <Footer />
    </div>
  )
}
