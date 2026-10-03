import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, type Location } from 'react-router-dom'
import { gsap, initSmoothScroll, scrollToTop, refreshScroll, getLenis } from '@/lib/smooth'
import Nav from '@/components/Nav'
import Cursor from '@/components/Cursor'
import Grain from '@/components/Grain'
import Loader from '@/components/Loader'
import Home from '@/pages/Home'

const Tech = lazy(() => import('@/pages/Tech'))
const Creative = lazy(() => import('@/pages/Creative'))
const Originals = lazy(() => import('@/pages/Originals'))
const Work = lazy(() => import('@/pages/Work'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/** Prefetches page chunks on link hover/focus so navigation is instant */
export const prefetchRoute = (path: string) => {
  switch (path) {
    case '/tech':
      import('@/pages/Tech')
      break
    case '/creative':
      import('@/pages/Creative')
      break
    case '/originals':
      import('@/pages/Originals')
      break
    case '/work':
      import('@/pages/Work')
      break
    case '/contact':
      import('@/pages/Contact')
      break
  }
}

const skipLoader = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noloader')

export default function App() {
  const location = useLocation()
  const [shown, setShown] = useState<Location>(location)
  const [loading, setLoading] = useState(() => !skipLoader())
  const cover = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    initSmoothScroll()
    if (!loading) {
      ;(window as unknown as { __nmytRevealed?: boolean }).__nmytRevealed = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLoaded = useCallback(() => {
    ;(window as unknown as { __nmytRevealed?: boolean }).__nmytRevealed = true
    setLoading(false)
  }, [])

  // page transitions — cover in, swap route, cover out
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (location.pathname === shown.pathname) {
      if (location.hash) document.querySelector(location.hash)?.scrollIntoView()
      return
    }
    const el = cover.current!
    const q = gsap.utils.selector(el)
    const tl = gsap.timeline()
    tl.set(el, { display: 'block' })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.inOut' })
      .fromTo(q('.pt-logo'), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0.25)
      .add(() => {
        setShown(location)
        scrollToTop(true)
      })
      .add(() => {
        refreshScroll()
      }, '+=0.1')
      .to(q('.pt-logo'), { autoAlpha: 0, duration: 0.25 }, '+=0.05')
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.65, ease: 'expo.inOut' }, '<')
      .add(() => {
        getLenis()?.start()
        refreshScroll()
      })
      .set(el, { display: 'none' })
    return () => {
      tl.progress(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    document.documentElement.dataset.route = shown.pathname.split('/')[1] || 'home'
  }, [shown])

  useLayoutEffect(() => {
    refreshScroll()
    const t = setTimeout(refreshScroll, 120)
    return () => clearTimeout(t)
  }, [shown.pathname])

  return (
    <>
      {loading && <Loader onDone={onLoaded} />}
      <Nav />
      <main key={shown.pathname}>
        <Suspense fallback={null}>
          <Routes location={shown}>
            <Route path="/" element={<Home />} />
            <Route path="/tech" element={<Tech />} />
            <Route path="/creative" element={<Creative />} />
            <Route path="/originals" element={<Originals />} />
            <Route path="/work" element={<Work />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <div ref={cover} className="pt" style={{ display: 'none' }} aria-hidden>
        <style>{`
          .pt{position:fixed;inset:0;z-index:500;background:var(--void)}
          .pt::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--grad-master)}
          .pt-logo{position:absolute;left:50%;top:50%;width:min(36vw,280px);transform:translate(-50%,-50%)}
          .pt-logo img{width:100%;height:auto}
        `}</style>
        <div className="pt-logo">
          <img src="/brand/nmyt-logo.webp" alt="" />
        </div>
      </div>
      <Cursor />
      <Grain />
    </>
  )
}
