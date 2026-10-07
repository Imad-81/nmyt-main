import Footer from '@/components/Footer'
import OriginalsHero from './originals/OriginalsHero'
import { Manifesto, Program, FilmSlate, CallForFilmmakers } from './originals/OriginalsSections'
import './originals/originals.css'

export default function Originals() {
  return (
    <div className="orig">
      <OriginalsHero />
      <Manifesto />
      <Program />
      <FilmSlate />
      <CallForFilmmakers />
      <Footer />
    </div>
  )
}
