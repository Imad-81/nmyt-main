import type { ReactNode, CSSProperties } from 'react'
import { Reveal, SplitReveal } from './Reveal'

/** `01 / ABOUT` style label */
export function MonoLabel({ index, children, className = '', color }: { index?: string; children: ReactNode; className?: string; color?: string }) {
  return (
    <div className={`mono inline-flex items-center gap-2 ${className}`} style={{ color: 'var(--fg-3)' }}>
      {index && <span style={{ color: color ?? 'var(--sky)' }}>{index}</span>}
      {index && <span aria-hidden>/</span>}
      <span>{children}</span>
    </div>
  )
}

/** Section header: mono index row with hairline, big display title, optional lede. */
export function SectionHead({
  index,
  label,
  title,
  lede,
  accent,
  className = '',
  titleClassName = 'h-section',
  aside,
}: {
  index: string
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
      <Reveal className="mb-10 flex items-center gap-4 md:mb-14">
        <MonoLabel index={index} color={accent}>
          {label}
        </MonoLabel>
        <div className="hairline flex-1" />
        {aside}
      </Reveal>
      <SplitReveal as="h2" className={`display ${titleClassName}`}>
        {title}
      </SplitReveal>
      {lede && (
        <Reveal className="lede mt-8 max-w-[40ch]" delay={0.15}>
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

/** Corner brackets — HUD framing like SpaceX overlays. */
export function Brackets({ color = 'rgba(255,255,255,.4)', size = 14, inset = 0 }: { color?: string; size?: number; inset?: number }) {
  const b = (pos: CSSProperties, rot: number) => (
    <span
      className="pointer-events-none absolute"
      style={{ ...pos, width: size, height: size, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}`, transform: `rotate(${rot}deg)` }}
    />
  )
  return (
    <>
      {b({ top: inset, left: inset }, 0)}
      {b({ top: inset, right: inset }, 90)}
      {b({ bottom: inset, right: inset }, 180)}
      {b({ bottom: inset, left: inset }, 270)}
    </>
  )
}
