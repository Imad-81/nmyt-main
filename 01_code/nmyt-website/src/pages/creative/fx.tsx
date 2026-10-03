import { useEffect, useRef, type ElementType, type CSSProperties } from 'react'
import { prefersReducedMotion } from '@/lib/smooth'
import { whenRevealed } from '@/components/Reveal'

const GLYPHS = '#$%&*+<>/\\[]{}=_-01ABCDEFXYZ▮▯'

/**
 * Terminal "decode" — characters resolve left → right out of random glyphs.
 * Best on short mono labels. Re-runs on hover when `hover` is set.
 */
export function Scramble({
  text,
  as: Tag = 'span',
  className,
  style,
  trigger = 'scroll',
  delay = 0,
  duration = 0.9,
  hover = false,
}: {
  text: string
  as?: ElementType
  className?: string
  style?: CSSProperties
  trigger?: 'scroll' | 'intro' | 'none'
  delay?: number
  duration?: number
  hover?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const run = useRef<() => void>(() => {})

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.textContent = text
      run.current = () => {}
      return
    }
    let raf = 0
    let timer = 0
    const n = text.length
    const go = (d = 0) => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = (now - t0) / (duration * 1000)
          let out = ''
          for (let i = 0; i < n; i++) {
            const c = text[i]
            const th = (i / n) * 0.7 + 0.3
            if (c === ' ' || p >= th) out += c
            else if (p >= th - 0.45) out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
            else out += ' '
          }
          el.textContent = out
          if (p < 1) raf = requestAnimationFrame(tick)
          else el.textContent = text
        }
        raf = requestAnimationFrame(tick)
      }, d * 1000)
    }
    run.current = () => go(0)

    let off = () => {}
    if (trigger === 'intro') {
      el.textContent = ' '
      off = whenRevealed(() => go(delay))
    } else if (trigger === 'scroll') {
      el.textContent = ' '
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            go(delay)
            io.disconnect()
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      )
      io.observe(el)
      off = () => io.disconnect()
    }
    return () => {
      off()
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      el.textContent = text
    }
  }, [text, trigger, delay, duration])

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text} onPointerEnter={hover ? () => run.current() : undefined}>
      {text}
    </Tag>
  )
}
