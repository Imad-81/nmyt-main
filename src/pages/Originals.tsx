import Footer from '@/components/Footer'
import OriginalsHero from './originals/OriginalsHero'
import { Manifesto, Program, ReelMarquee, FilmSlate, CallForFilmmakers } from './originals/OriginalsSections'
import './originals/originals.css'

export default function Originals() {
  return (
    <div className="orig">
      <OriginalsHero />
      <Manifesto />
      <Program />
      <ReelMarquee />
      <FilmSlate />
      <CallForFilmmakers />
      <Footer />
    </div>
  )
}
