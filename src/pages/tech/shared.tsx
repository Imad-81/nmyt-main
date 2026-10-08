import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Reveal, SplitReveal } from '@/components/Reveal'

/** Section head on the light page: eyebrow, one-line title, lede beneath. One left axis for the whole page. */
export function TechHead({ label, title, lede, className = '' }: { label: string; title: ReactNode; lede?: ReactNode; className?: string }) {
  return (
    <div className={`tk-head ${className}`}>
      <Reveal className="eyebrow tk-eyebrow" y={16}>
        {label}
      </Reveal>
      <SplitReveal as="h2" className="display tk-title">
        {title}
      </SplitReveal>
      {lede && (
        <Reveal className="lede tk-lede" delay={0.1} y={20}>
          {lede}
        </Reveal>
      )}
    </div>
  )
}

/**
 * Wraps an <Img>. If the image 404s (media not generated yet) the photo is hidden and the
 * gradient + label underneath read as an intentional placeholder.
 */
export function MediaFrame({ children, label, className = '' }: { children: ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    const img = ref.current?.querySelector('img')
    if (!img) return
    const fail = () => setMissing(true)
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail()
    img.addEventListener('error', fail)
    return () => img.removeEventListener('error', fail)
  }, [])
  return (
    <div ref={ref} className={`tf ${missing ? 'is-missing' : ''} ${className}`}>
      {children}
      <div className="tf-ph" aria-hidden>
        <span className="mono">{label}</span>
      </div>
    </div>
  )
}
