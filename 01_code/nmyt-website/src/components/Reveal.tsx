import { useRef, type ElementType, type ReactNode, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion } from '@/lib/smooth'

/** Resolves when the intro loader has finished (or immediately if it already has). */
export function whenRevealed(cb: () => void) {
  const w = window as unknown as { __nmytRevealed?: boolean }
  if (w.__nmytRevealed) {
    cb()
    return () => {}
  }
  const h = () => cb()
  window.addEventListener('nmyt:revealed', h, { once: true })
  return () => window.removeEventListener('nmyt:revealed', h)
}

type SplitProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  type?: 'lines' | 'words' | 'chars'
  /** 'scroll' = on enter viewport, 'intro' = after loader */
  trigger?: 'scroll' | 'intro'
  delay?: number
  stagger?: number
  duration?: number
  start?: string
}

/** Masked line / word / char reveal. Children may include <em className="serif">. */
export function SplitReveal({
  children,
  as: Tag = 'div',
  className,
  style,
  type = 'lines',
  trigger = 'scroll',
  delay = 0,
  stagger,
  duration = 1.2,
  start = 'top 88%',
}: SplitProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const reduce = prefersReducedMotion()
      let tween: gsap.core.Tween | null = null
      let cleanupWait = () => {}
      gsap.set(el, { autoAlpha: 0 })
      const split = SplitText.create(el, {
        type: type === 'chars' ? 'lines,words,chars' : type === 'words' ? 'lines,words' : 'lines',
        mask: 'lines',
        linesClass: 'sr-line',
        autoSplit: true,
        onSplit(self) {
          tween?.kill()
          const targets = type === 'chars' ? self.chars : type === 'words' ? self.words : self.lines
          if (!targets || targets.length === 0) return
          gsap.set(el, { autoAlpha: 1 })
          const vars: gsap.TweenVars = {
            yPercent: 115,
            rotate: type === 'lines' && !reduce ? 2.5 : 0,
            duration: reduce ? Math.min(duration, 0.9) : duration,
            ease: 'expo.out',
            stagger: stagger ?? (type === 'chars' ? 0.028 : type === 'words' ? 0.05 : 0.09),
            delay,
          }
          if (trigger === 'scroll') {
            tween = gsap.from(targets, { ...vars, scrollTrigger: { trigger: el, start, once: true } })
          } else {
            gsap.set(targets, { yPercent: 115 })
            cleanupWait()
            cleanupWait = whenRevealed(() => {
              tween = gsap.fromTo(targets, { yPercent: 115, rotate: vars.rotate }, { ...vars, yPercent: 0, rotate: 0 })
            })
          }
          return tween ?? undefined
        },
      })
      return () => {
        cleanupWait()
        split.revert()
      }
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}

type RevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  y?: number
  delay?: number
  stagger?: number
  /** animate direct children individually */
  childSelector?: string
  start?: string
  trigger?: 'scroll' | 'intro'
}

/** Fade + rise on enter. */
export function Reveal({ children, as: Tag = 'div', className, style, y = 40, delay = 0, stagger = 0.08, childSelector, start = 'top 90%', trigger = 'scroll' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const el = ref.current
      const targets = childSelector ? el.querySelectorAll(childSelector) : el
      if (!targets || (targets instanceof NodeList && targets.length === 0)) return
      const reduce = prefersReducedMotion()
      const from = { autoAlpha: 0, y: reduce ? Math.min(y, 16) : y }
      const to = { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger, delay }
      if (trigger === 'intro') {
        gsap.set(targets, from)
        return whenRevealed(() => gsap.to(targets, to))
      }
      gsap.fromTo(targets, from, { ...to, scrollTrigger: { trigger: el, start, once: true } })
    },
    { scope: ref },
  )
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}
