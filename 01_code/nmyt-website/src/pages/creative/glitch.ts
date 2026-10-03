import { gsap } from '@/lib/smooth'

/**
 * Slice + RGB-split glitch burst for stacked glitch layers (`.gl-layer`) over a base element.
 * Returns the timeline so callers can chain; `onPulse` receives a 0..1 intensity for shaders.
 */
export function glitchBurst(base: Element | null, layers: Element[], strength = 1, onPulse?: (v: number) => void) {
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(layers, { autoAlpha: 0, x: 0, clipPath: 'inset(0% 0% 0% 0%)' })
      if (base) gsap.set(base, { x: 0, skewX: 0 })
      onPulse?.(0)
    },
  })
  const steps = 8
  const r = gsap.utils.random
  for (let i = 0; i < steps; i++) {
    tl.add(() => {
      const k = strength * (1 - i / (steps + 2))
      layers.forEach((l) => {
        const top = r(0, 88)
        const h = r(5, 26)
        gsap.set(l, { autoAlpha: 1, x: r(-16, 16) * k, clipPath: `inset(${top}% 0% ${Math.max(0, 100 - top - h)}% 0%)` })
      })
      if (base) gsap.set(base, { x: r(-5, 5) * k, skewX: r(-7, 7) * k })
      onPulse?.(k)
    }, i * 0.05)
  }
  tl.add(() => {}, steps * 0.05 + 0.02)
  return tl
}
