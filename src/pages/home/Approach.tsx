import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { AUDIENCES } from '@/data/site'
import { SectionHead, Marquee } from '@/components/ui'
import Img from '@/components/Img'
import { media } from '@/data/media'
import './approach.css'

export default function Approach() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('.ap-row').forEach((row) => {
        gsap.fromTo(row, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 45%', scrub: true } })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="ap section">
      <div className="wrap">
        <SectionHead index="06" label="Built for" title={<>Who we <em className="serif text-grad">work</em> with.</>} />
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
          <Img src={media('studioTeam')} alt="An edit suite at night, colour grading on one desk, storyboards on the next" className="ap-band-img" parallax={10} />
        </figure>

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
