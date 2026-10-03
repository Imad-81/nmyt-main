import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { PROJECTS, STUDIO_META } from '@/data/work'
import { media, type MediaKey } from '@/data/media'
import Img from '@/components/Img'
import { Reveal } from '@/components/Reveal'
import { TechHead, MediaFrame } from './shared'

const TECH_WORK = PROJECTS.filter((p) => p.studio === 'tech' || p.studio === 'hybrid')

const STUDIO: { k: MediaKey; label: string; alt: string }[] = [
  { k: 'techDesk', label: 'The desk', alt: 'NMYT Tech Studio desk with design and code on screen' },
  { k: 'techDashboard', label: 'Systems', alt: 'A dashboard interface built by NMYT' },
  { k: 'techPhone', label: 'Mobile-first', alt: 'A website shown on a phone' },
  { k: 'techHands', label: 'Hands on', alt: 'Hands on a keyboard in the NMYT studio' },
]

export default function TechWork({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (reduce) return
      // gallery columns travel at different speeds
      gsap.utils.toArray<HTMLElement>('.tw-g', ref.current).forEach((g, i) => {
        gsap.fromTo(g, { y: i % 2 ? 90 : 30 }, { y: i % 2 ? -60 : -20, ease: 'none', scrollTrigger: { trigger: ref.current!.querySelector('.tw-gal'), start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    },
    { scope: ref, dependencies: [reduce] },
  )

  return (
    <section ref={ref} className="tw tk-section" id="work">
      <div className="wrap">
        <TechHead
          index="04"
          label="Selected work"
          aside={
            <Link to="/work" className="tw-all" data-cursor-hover>
              All work <span aria-hidden>↗</span>
            </Link>
          }
          title={
            <>
              Selected
              <br />
              <em className="serif">tech</em> work.
            </>
          }
          lede="Websites, launch pages and systems — built to do one job well."
        />

        <div className="tw-grid">
          {TECH_WORK.map((p, i) => (
            <Link key={p.slug} to="/work" className="tw-card" data-cursor="View">
              <MediaFrame className="tw-media" label={p.name}>
                <Img src={media(p.image)} alt={`${p.name} — ${p.client}`} className="tf-img h-full w-full" tint="#16b4ff" tintOpacity={0.14} parallax={6} />
              </MediaFrame>
              <Reveal className="tw-meta" childSelector=".tw-in" stagger={0.06} y={24}>
                <div className="tw-row mono tw-in">
                  <span className="tw-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span>{STUDIO_META[p.studio].label}</span>
                  <span className="tw-year">{p.year}</span>
                </div>
                <h3 className="display tw-name tw-in">{p.name}</h3>
                <p className="mono tw-client tw-in">{p.client}</p>
                <p className="tw-sum tw-in">{p.summary}</p>
                <ul className="tw-tags tw-in">
                  {p.services.map((s) => (
                    <li key={s} className="pill">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Link>
          ))}
        </div>

        <div className="tw-studio">
          <Reveal className="tk-head-row">
            <span className="mono tk-label">
              <b>—</b> From the studio
            </span>
            <span className="tk-rule" />
          </Reveal>
          <div className="tw-gal">
            {STUDIO.map((s) => (
              <figure key={s.k} className="tw-g">
                <MediaFrame className="tw-g-media" label={s.label}>
                  <Img src={media(s.k, 'sm')} alt={s.alt} className="tf-img h-full w-full" tint="#16b4ff" tintOpacity={0.12} parallax={0} />
                </MediaFrame>
                <figcaption className="mono">{s.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
