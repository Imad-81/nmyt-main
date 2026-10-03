import HomeHero from './home/HomeHero'
import Reel from './home/Reel'
import Manifesto from './home/Manifesto'
import Studios from './home/Studios'
import SelectedWork from './home/SelectedWork'
import OriginalsTeaser from './home/OriginalsTeaser'
import Approach from './home/Approach'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <HomeHero />
      <Reel />
      <Manifesto />
      <Studios />
      <SelectedWork />
      <OriginalsTeaser />
      <Approach />
      <Footer />
    </>
  )
}
