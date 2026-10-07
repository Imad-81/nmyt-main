import { Marquee } from '@/components/ui'
import './approach.css'

/** Everything the studio makes, on one sliding line. */
export default function Approach() {
  return (
    <section className="ap ap--line">
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
