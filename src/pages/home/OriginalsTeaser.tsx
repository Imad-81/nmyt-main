import { Link } from 'react-router-dom'
import { Reveal } from '@/components/Reveal'
import './originals-bubble.css'

/** A single quiet pointer to NMYT Originals. The films have their own page. */
export default function OriginalsTeaser() {
  return (
    <section className="ob wrap" aria-label="NMYT Originals">
      <Reveal y={28}>
        <Link to="/originals" className="ob-bubble">
          <span className="ob-light" aria-hidden />
          <span className="ob-mark" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="ob-copy">
            <span className="display ob-title">NMYT Originals</span>
            <span className="ob-line">Where your stories come to life. All in-house.</span>
          </span>
          <span className="ob-more">
            Click for more
            <span className="ob-arrow" aria-hidden>
              ↗
            </span>
          </span>
        </Link>
      </Reveal>
    </section>
  )
}
