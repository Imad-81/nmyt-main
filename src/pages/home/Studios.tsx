import { Link } from 'react-router-dom'
import { TECH_SERVICES, CREATIVE_SERVICES } from '@/data/site'
import { Head } from '@/components/Simple'
import { Reveal } from '@/components/Reveal'
import './studios.css'

const SIDES = [
  {
    key: 'tech',
    to: '/tech',
    name: 'Tech',
    line: 'Landing pages, websites and simple systems. Fast, clean and built to be used.',
    list: TECH_SERVICES,
  },
  {
    key: 'creative',
    to: '/creative',
    name: 'Creative',
    line: 'Brand films, product shoots, social and ads. Made to be felt, not scrolled past.',
    list: CREATIVE_SERVICES,
  },
] as const

/**
 * The two studios, side by side as open type. No cards: the only surface is the light behind
 * them, blue under Tech and green under Creative, which leans toward the side being considered.
 */
export default function Studios() {
  return (
    <section className="section st" id="studios">
      <div className="st-light" aria-hidden>
        <i className="st-glow st-glow--tech" />
        <i className="st-glow st-glow--creative" />
      </div>
      <div className="wrap st-wrap">
        <Head
          eyebrow="Two studios"
          title={
            <>
              Pick your <em className="text-grad">side.</em>
              <br />
              Or take both.
            </>
          }
        />
        <Reveal className="st-row" childSelector=".st-side" stagger={0.12} y={36}>
          {SIDES.map((s) => (
            <Link key={s.key} to={s.to} className={`st-side st-side--${s.key}`}>
              <h3 className="display st-name">
                <span className="st-name-in">{s.name} studio</span>
                <svg className="st-arrow" viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 19L19 5M19 5H8M19 5v11" />
                </svg>
              </h3>
              <p className="st-line">{s.line}</p>
              <ul className="st-list">
                {s.list.map((x) => (
                  <li key={x.n}>{x.title}</li>
                ))}
              </ul>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
