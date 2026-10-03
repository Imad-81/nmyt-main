import { useLayoutEffect } from 'react'
import { refreshScroll } from '@/lib/smooth'
import HomeHero from './home/HomeHero'
import Manifesto from './home/Manifesto'
import SelectedWork from './home/SelectedWork'
import Approach from './home/Approach'
import Footer from '@/components/Footer'

export default function Home() {
  useLayoutEffect(() => {
    refreshScroll()
    const t = setTimeout(refreshScroll, 120)
    return () => clearTimeout(t)
  }, [])

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
