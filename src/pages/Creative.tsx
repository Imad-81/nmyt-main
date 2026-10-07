import Footer from '@/components/Footer'
import CreativeHero from './creative/CreativeHero'
import GlassWarp from './creative/GlassWarp'
import CreativeServices from './creative/CreativeServices'
import { SlideMarquee, Steps, WorkGrid } from '@/components/Simple'
import { PROJECTS } from '@/data/work'
import './creative/creative.css'

const WORK = PROJECTS.filter((p) => p.studio === 'creative' || p.studio === 'hybrid')

const STAGES = [
  { title: 'Concept', body: 'Idea, script and boards. The feeling is decided before the camera comes out.' },
  { title: 'Shoot', body: 'Studio or location, directed by the same team that will cut it.' },
  { title: 'Edit', body: 'Story first. Cut for the screen it lives on: 16:9, 9:16, 1:1.' },
  { title: 'Grade', body: 'Colour that makes every frame look like the same brand.' },
  { title: 'Sound', body: 'Music, mix and design. Half of what the audience feels.' },
]

/** /creative: Creative Studio. */
export default function Creative() {
  return (
    <div className="cr">
      <CreativeHero />
      <GlassWarp />
      <CreativeServices />
      <WorkGrid id="cr-work" eyebrow="Selected work" title="Selected creative work." lede="Films, shoots and content systems for brands that wanted to be looked at twice." items={WORK} note="Sample projects, shown to illustrate the layout." />
      <Steps eyebrow="How a film gets made" title="From idea to final mix." lede="One team carries the piece the whole way, so nothing is lost between hands." items={STAGES} accent="var(--acid)" />
      <SlideMarquee words={['Brand films', 'Product shoots', 'Social', 'Ads', 'Brand design', 'Cinematics']} accent="var(--acid)" />
      <Footer accent="creative" />
    </div>
  )
}
