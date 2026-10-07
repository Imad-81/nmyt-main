import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/smooth'
import { media, type MediaKey } from '@/data/media'
import Img from '@/components/Img'
import { TechHead, MediaFrame } from './shared'

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
        <div className="tw-studio">
          <TechHead label="From the studio" title={<>Built <em className="serif">here.</em></>} />
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
