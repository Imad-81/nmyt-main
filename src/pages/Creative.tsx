import Footer from '@/components/Footer'
import CreativeHero from './creative/CreativeHero'
import GlassWarp from './creative/GlassWarp'
import CreativeServices from './creative/CreativeServices'
import { Catalogue, SlideMarquee, Steps } from '@/components/Simple'
import './creative/creative.css'

const MAKES = [
  { img: 'creativeCommercial', title: 'Brand commercials', body: 'Script, shoot, grade and sound.' },
  { img: 'workSkincare', title: 'Product films', body: 'Macro, motion and stills.' },
  { img: 'workFashion', title: 'Lookbooks', body: 'Fashion and lifestyle shoots.' },
  { img: 'workRestaurant', title: 'Food and hospitality', body: 'Kitchens, plates and people.' },
  { img: 'creativeSocial', title: 'Social content', body: 'A month planned, shot in a day.' },
  { img: 'workMusic', title: 'Live and music', body: 'Stage visuals and performance films.' },
] as const

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
      <Catalogue id="cr-work" eyebrow="What we make" title="The catalogue." lede="The kinds of pieces the studio produces. Client work will be shown on the Work page once it is released." items={[...MAKES]} note="Studio look development frames, shown as examples." />
      <Steps eyebrow="How a film gets made" title="From idea to final mix." lede="One team carries the piece the whole way, so nothing is lost between hands." items={STAGES} accent="var(--acid)" />
      <SlideMarquee words={['Brand films', 'Product shoots', 'Social', 'Ads', 'Brand design', 'Cinematics']} accent="var(--acid)" />
      <Footer accent="creative" />
    </div>
  )
}
