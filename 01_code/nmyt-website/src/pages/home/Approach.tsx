import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { AUDIENCES } from '@/data/site'
import { SectionHead, Marquee } from '@/components/ui'
import { Reveal } from '@/components/Reveal'
import Img from '@/components/Img'
import { media } from '@/data/media'
import './approach.css'

const STEPS = [
  { n: '01', t: 'Listen', d: 'A real conversation about the business, the audience and the one thing that has to change.' },
  { n: '02', t: 'Shape', d: 'Strategy, scope and a clear plan — what we’ll make, how long it takes, what it costs.' },
  { n: '03', t: 'Make', d: 'Design, code, shoot, cut, grade. One team, in-house, with you in the loop every week.' },
  { n: '04', t: 'Launch & grow', d: 'Ship it, measure it, improve it. We stay on for the next version, not just the first.' },
]

export default function Approach() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('.ap-row').forEach((row) => {
        gsap.fromTo(row, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 45%', scrub: true } })
      })
      gsap.fromTo(
        '.ap-step',
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, stagger: 0.12, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.ap-steps', start: 'top 82%', once: true } },
      )
      gsap.fromTo('.ap-line i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.ap-steps', start: 'top 75%', end: 'bottom 60%', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="ap section">
      <div className="wrap">
        <SectionHead index="05" label="Built for" title={<>Who we <em className="serif text-grad">work</em> with.</>} />
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

        <figure className="ap-band">
          <Img src={media('studioTeam')} alt="An edit suite at night — colour grading on one desk, storyboards on the next" className="ap-band-img" parallax={10} />
          <figcaption className="mono">
            <span>In-house</span>
            <span>Edit · Grade · Storyboard · Code</span>
          </figcaption>
        </figure>

        <div className="ap-proc">
          <Reveal className="mb-10 flex items-center gap-4">
            <span className="mono text-[var(--fg-3)]">
              <span className="text-[var(--sky)]">06</span> / How we work
            </span>
            <div className="hairline flex-1" />
          </Reveal>
          <div className="ap-steps">
            <div className="ap-line">
              <i />
            </div>
            {STEPS.map((s) => (
              <article key={s.n} className="ap-step">
                <span className="ap-dot" />
                <span className="display ap-n">{s.n}</span>
                <h3 className="ap-t">{s.t}</h3>
                <p className="ap-d">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Marquee className="ap-mq" speed={48}>
        {['Websites', 'Landing pages', 'Dashboards', 'Brand films', 'Product shoots', 'Social', 'Ads', 'Brand design', 'Cinematics', 'Short films'].map((w, i) => (
          <span key={w} className="display ap-mq-item">
            {w}
            <em className={i % 2 ? 'is-g' : ''}>✦</em>
          </span>
        ))}
      </Marquee>
    </section>
  )
}
