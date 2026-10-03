import Footer from '@/components/Footer'
import CreativeHero from './creative/CreativeHero'
import GlassWarp from './creative/GlassWarp'
import CreativeServices from './creative/CreativeServices'
import CreativeWork from './creative/CreativeWork'
import Timeline from './creative/Timeline'
import VelocityMarquee from './creative/VelocityMarquee'
import './creative/creative.css'

/** /creative — Creative Studio. Channel 02: louder, greener, glitchier than home. */
export default function Creative() {
  return (
    <div className="cr">
      <CreativeHero />
      <GlassWarp />
      <CreativeServices />
      <CreativeWork />
      <Timeline />
      <VelocityMarquee />
      <Footer accent="creative" />
    </div>
  )
}
