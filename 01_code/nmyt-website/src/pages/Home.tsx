import { useLayoutEffect } from 'react'
import { refreshScroll } from '@/lib/smooth'
import HomeLightSpine from './home/HomeLightSpine'
import HomeHero from './home/HomeHero'
import Manifesto from './home/Manifesto'
import SelectedWork from './home/SelectedWork'
import Approach from './home/Approach'
import Footer from '@/components/Footer'
import './home/home.css'

export default function Home() {
  useLayoutEffect(() => {
    refreshScroll()
    const t = setTimeout(refreshScroll, 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="home-page relative bg-[var(--void)]">
      <HomeLightSpine />
      <div className="relative z-[1]">
        <HomeHero />
        <Manifesto />
        <SelectedWork />
        <Approach />
        <Footer />
      </div>
    </div>
  )
}
