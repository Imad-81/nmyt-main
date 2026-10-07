import { useRef, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, prefersReducedMotion } from '@/lib/smooth'

type Props = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  style?: CSSProperties
  /** parallax travel in % of the image height (0 disables) */
  parallax?: number
  /** clip-path wipe direction on enter */
  wipe?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** tint overlay colour (CSS colour) blended with `mix-blend-mode: color` */
  tint?: string
  tintOpacity?: number
  priority?: boolean
  position?: string
}

const WIPES: Record<string, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
}

/** Graded image with wipe-in and optional scroll parallax. Wrapper must be sized by the parent. */
export default function Img({ src, alt, className = '', imgClassName = '', style, parallax = 8, wipe = 'up', tint, tintOpacity = 0.35, priority, position = 'center' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = ref.current!
      const img = el.querySelector('img')!
      if (prefersReducedMotion()) return
      if (wipe !== 'none') {
        gsap.fromTo(el, { clipPath: WIPES[wipe] }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
        gsap.fromTo(img, { scale: 1.25 }, { scale: 1.08, duration: 1.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      }
      if (parallax) {
        gsap.fromTo(img, { yPercent: -parallax / 2 }, { yPercent: parallax / 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      }
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        style={{ objectPosition: position, transform: parallax ? 'scale(1.08)' : undefined }}
      />
      {tint && <div className="pointer-events-none absolute inset-0" style={{ background: tint, mixBlendMode: 'color', opacity: tintOpacity }} />}
    </div>
  )
}
