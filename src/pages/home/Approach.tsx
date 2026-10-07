import { Marquee } from '@/components/ui'
import { Reveal } from '@/components/Reveal'
import Motion from '@/components/Motion'
import './approach.css'

/** The studio at work: one wide moving frame, then everything we make on a sliding line. */
export default function Approach() {
  return (
    <section className="ap section">
      <div className="wrap">
        <Reveal as="figure" className="ap-band" y={36}>
          <Motion k="studioTeam" alt="An edit suite at night: colour grading on one desk, storyboards on the next" className="ap-band-img" />
        </Reveal>
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
