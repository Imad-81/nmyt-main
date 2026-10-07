import HomeHero from './home/HomeHero'
import Manifesto from './home/Manifesto'
import Studios from './home/Studios'
import OriginalsTeaser from './home/OriginalsTeaser'
import Approach from './home/Approach'
import Footer from '@/components/Footer'
import { Pillars } from '@/components/Simple'

const PILLARS = [
  { img: 'techHands', title: 'We build.', body: 'Websites, landing pages, dashboards and simple systems.', to: '/tech', tone: 'var(--sky)' },
  { img: 'creativeCommercial', title: 'We shoot.', body: 'Brand films, product shoots, social, ads and design.', to: '/creative', tone: 'var(--acid)' },
  { img: 'heroFilmset', title: 'We tell stories.', body: 'In-house short films, made with new filmmakers.', to: '/originals', tone: 'var(--ice)' },
] as const

export default function Home() {
  return (
    <>
      <HomeHero />
      <Manifesto />
      <Pillars items={[...PILLARS]} />
      <Studios />
      <Approach />
      <OriginalsTeaser />
      <Footer />
    </>
  )
}
