import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/smooth'
import { useLocation } from 'react-router-dom'

/**
 * Dot + trailing ring. Grows on interactive elements; shows a label for
 * elements with data-cursor="Label". Disabled on touch devices.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [enabled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const loc = useLocation()

  useEffect(() => setLabel(''), [loc.pathname])

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const d = dot.current!
    const r = ring.current!
    const xd = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3' })
    const yd = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3' })
    const xr = gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3' })
    const yr = gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3' })
    let visible = false

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!visible) {
        visible = true
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 })
      }
      xd(e.clientX)
      yd(e.clientY)
      xr(e.clientX)
      yr(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      const lab = t.closest<HTMLElement>('[data-cursor]')
      const hov = t.closest('a, button, [data-cursor-hover], input, textarea, select, label')
      if (lab) {
        setLabel(lab.dataset.cursor || '')
        r.dataset.state = 'label'
      } else if (hov) {
        setLabel('')
        r.dataset.state = 'hover'
      } else {
        setLabel('')
        r.dataset.state = ''
      }
    }
    const leave = () => {
      visible = false
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 })
    }
    const down = () => gsap.to(r, { scale: 0.8, duration: 0.2 })
    const up = () => gsap.to(r, { scale: 1, duration: 0.4, ease: 'back.out(3)' })

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <style>{`
        .cr-dot,.cr-ring{position:fixed;left:0;top:0;pointer-events:none;z-index:2000;opacity:0;visibility:hidden}
        .cr-dot{width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;mix-blend-mode:difference}
        .cr-ring{width:38px;height:38px;margin:-19px 0 0 -19px;display:grid;place-items:center}
        .cr-ring i{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,255,255,.45);transition:transform .5s var(--ease-out),background .4s,border-color .4s;mix-blend-mode:difference}
        .cr-ring[data-state=hover] i{transform:scale(1.7);border-color:rgba(255,255,255,.9)}
        .cr-ring[data-state=label] i{transform:scale(2.6);background:rgba(244,246,251,.96);border-color:transparent;mix-blend-mode:normal}
        .cr-ring b{position:relative;font:500 10px/1 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:#030408;opacity:0;transform:scale(.6);transition:opacity .3s,transform .5s var(--ease-out);white-space:nowrap}
        .cr-ring[data-state=label] b{opacity:1;transform:scale(1)}
      `}</style>
      <div ref={dot} className="cr-dot" />
      <div ref={ring} className="cr-ring">
        <i />
        <b>{label}</b>
      </div>
    </>
  )
}
