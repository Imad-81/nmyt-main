import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '@/lib/smooth'
import './button.css'

type Props = {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  onPointerEnter?: () => void
  onFocus?: () => void
  variant?: 'light' | 'ghost' | 'sky' | 'acid' | 'dark'
  small?: boolean
  arrow?: boolean
  className?: string
  type?: 'button' | 'submit'
}

/** Pill button with magnetic pull and a text roll on hover. */
export function MagneticButton({ children, to, href, onClick, onPointerEnter, onFocus, variant = 'light', small, arrow = true, className = '', type }: Props) {
  const ref = useRef<HTMLElement>(null)

  const move = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    gsap.to(el, { x: x * 0.28, y: y * 0.36, duration: 0.6, ease: 'power3.out' })
  }
  const leave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })

  const inner = (
    <>
      <span className="mb-label">
        <span className="mb-roll" data-text={typeof children === 'string' ? children : ''}>
          {children}
        </span>
      </span>
      {arrow && (
        <span className="mb-arrow" aria-hidden>
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M3 13L13 3M13 3H5M13 3v8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      )}
    </>
  )
  const cls = `mb mb--${variant} ${small ? 'mb--sm' : ''} ${className}`
  const common = { className: cls, onPointerMove: move, onPointerLeave: leave, onPointerEnter, onFocus, 'data-cursor-hover': true }

  if (to)
    return (
      <Link to={to} ref={ref as React.Ref<HTMLAnchorElement>} {...common}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a href={href} ref={ref as React.Ref<HTMLAnchorElement>} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" {...common}>
        {inner}
      </a>
    )
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} onClick={onClick} type={type ?? 'button'} {...common}>
      {inner}
    </button>
  )
}
