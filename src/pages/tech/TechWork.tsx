import { media, type MediaKey } from '@/data/media'
import Img from '@/components/Img'
import { Reveal } from '@/components/Reveal'
import { TechHead, MediaFrame } from './shared'

const STUDIO: { k: MediaKey; label: string; alt: string }[] = [
  { k: 'techDesk', label: 'The desk', alt: 'NMYT Tech Studio desk with design and code on screen' },
  { k: 'techDashboard', label: 'Systems', alt: 'A dashboard interface built by NMYT' },
  { k: 'techPhone', label: 'Mobile first', alt: 'A website shown on a phone' },
  { k: 'techHands', label: 'Hands on', alt: 'Hands on a keyboard in the NMYT studio' },
]

export default function TechWork() {
  return (
    <section className="tw tk-section" id="work">
      <div className="wrap">
        <TechHead
          label="From the studio"
          title={
            <>
              Built <em className="serif">here.</em>
            </>
          }
        />
        <Reveal className="tw-gal" childSelector=".tw-g" stagger={0.08} y={36}>
          {STUDIO.map((s) => (
            <figure key={s.k} className="tw-g">
              <MediaFrame className="tw-g-media" label={s.label}>
                <Img src={media(s.k, 'sm')} alt={s.alt} className="tf-img h-full w-full" tint="#16b4ff" tintOpacity={0.12} parallax={0} />
              </MediaFrame>
              <figcaption>{s.label}</figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
