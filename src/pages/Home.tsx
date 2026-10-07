import HomeHero from './home/HomeHero'
import Manifesto from './home/Manifesto'
import Studios from './home/Studios'
import OriginalsTeaser from './home/OriginalsTeaser'
import Approach from './home/Approach'
import Footer from '@/components/Footer'
import { Pillars, Steps, WorkGrid } from '@/components/Simple'
import { PROCESS } from '@/data/site'
import { PROJECTS } from '@/data/work'

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
      <WorkGrid eyebrow="Selected work" title="Work that moves people." lede="Films, sites and systems for brands that care how they show up." items={PROJECTS.slice(0, 4)} note="Sample projects, shown to illustrate the layout." />
      <OriginalsTeaser />
      <Approach />
      <Steps eyebrow="How we work" title="Four steps. No surprise invoices." items={PROCESS.map(({ t, d }) => ({ title: t, body: d }))} />
      <Footer />
    </>
  )
}
