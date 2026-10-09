import { useRef, type ElementType, type ReactNode, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, prefersReducedMotion } from '@/lib/smooth'

import { whenRevealed } from '@/lib/reveal'

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
      // Lines rise and fade in. No clipping masks: descenders and edges can never be cut off.
      const split = SplitText.create(el, {
        type: type === 'lines' ? 'lines' : 'lines,words',
        linesClass: 'sr-line',
        autoSplit: true,
        onSplit(self) {
          tween?.kill()
          gsap.set(el, { autoAlpha: 1 })
          const targets = type === 'lines' ? self.lines : self.words
          const y = reduce ? 10 : 28
          const vars: gsap.TweenVars = {
            duration: Math.min(duration, 1.1),
            ease: 'expo.out',
            stagger: type === 'lines' ? (stagger ?? 0.09) : 0.045,
            delay,
          }
          if (trigger === 'scroll') {
            tween = gsap.from(targets, { ...vars, y, autoAlpha: 0, scrollTrigger: { trigger: el, start, once: true } })
          } else {
            gsap.set(targets, { autoAlpha: 0, y })
            cleanupWait()
            cleanupWait = whenRevealed(() => {
              tween = gsap.to(targets, { ...vars, y: 0, autoAlpha: 1 })
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
      if (!el) return
      const targets = childSelector ? el.querySelectorAll(childSelector) : el
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
