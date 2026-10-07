import type { ReactNode, CSSProperties } from 'react'
import { Reveal, SplitReveal } from './Reveal'

/** Small eyebrow label above a heading. (`index` / `color` are accepted for compatibility and ignored.) */
export function MonoLabel({ children, className = '' }: { index?: string; children: ReactNode; className?: string; color?: string }) {
  return (
    <div className={`eyebrow ${className}`} style={{ color: 'var(--fg-3)' }}>
      {children}
    </div>
  )
}

/** Section header: eyebrow, heading, optional lede. */
export function SectionHead({
  label,
  title,
  lede,
  className = '',
  titleClassName = 'h-section',
}: {
  index?: string
  label: string
  title: ReactNode
  lede?: ReactNode
  accent?: string
  className?: string
  titleClassName?: string
  aside?: ReactNode
}) {
  return (
    <div className={className}>
      <Reveal className="mb-4 md:mb-5">
        <MonoLabel>{label}</MonoLabel>
      </Reveal>
      <SplitReveal as="h2" className={`display ${titleClassName}`}>
        {title}
      </SplitReveal>
      {lede && (
        <Reveal className="lede mt-6 max-w-[44ch]" delay={0.15}>
          {lede}
        </Reveal>
      )}
    </div>
  )
}

/** Infinite marquee (CSS-driven, pauses on hover). */
export function Marquee({ children, speed = 40, reverse, className = '', style }: { children: ReactNode; speed?: number; reverse?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div className={`mq ${className}`} style={style}>
      <style>{`
        .mq{overflow:hidden;display:flex;user-select:none;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
        .mq-track{display:flex;flex-shrink:0;min-width:100%;align-items:center;animation:mq var(--mq-s) linear infinite}
        .mq-rev .mq-track{animation-direction:reverse}
        .mq:hover .mq-track{animation-play-state:paused}
        @keyframes mq{to{transform:translateX(-100%)}}
      `}</style>
      <div className={`flex ${reverse ? 'mq-rev' : ''}`} style={{ ['--mq-s' as string]: `${speed}s` }}>
        <div className="mq-track">{children}</div>
        <div className="mq-track" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

/** Corner brackets were a HUD decoration; retired. Kept as a no-op so call sites stay valid. */
export function Brackets(_props: { color?: string; size?: number; inset?: number }) {
  return null
}
