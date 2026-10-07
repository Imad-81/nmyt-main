import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

let lenis: Lenis | null = null

const forceFull = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('motion') === 'full'

/**
 * True when the visitor asked the OS for reduced motion. NMYT policy: reduced ≠ none.
 * We keep fades, the logo intro and short text reveals, and drop smooth-scroll
 * hijacking, parallax and large scroll-scrubbed transforms.
 */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !forceFull() && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

export function initSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !prefersReducedMotion(),
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
  })
  lenis.on('scroll', ScrollTrigger.update)
  if (import.meta.env.DEV) (window as unknown as { __lenis: Lenis }).__lenis = lenis
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true })
  else window.scrollTo(0, 0)
}

export function stopScroll() {
  lenis?.stop()
}
export function startScroll() {
  lenis?.start()
}

export { gsap, ScrollTrigger, SplitText }
