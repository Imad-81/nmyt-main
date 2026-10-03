import HomeHero from './home/HomeHero'
import Manifesto from './home/Manifesto'
import SelectedWork from './home/SelectedWork'
import Approach from './home/Approach'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <HomeHero />
      <Manifesto />
      <SelectedWork />
      <Approach />
      <Footer />
    </>
  )
}
