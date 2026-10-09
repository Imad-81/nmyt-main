import { useEffect, useRef, useState } from 'react'
import { media, CLIPS, type MediaKey } from '@/data/media'
import { whenRevealed } from '@/lib/reveal'

type Props = {
  k: MediaKey
  alt?: string
  className?: string
  /** play once and hold the last frame (hero shots) instead of looping */
  once?: boolean
  priority?: boolean
  position?: string
  onEnded?: () => void
}

/**
 * A still that comes alive: the image paints first, the clip fades in over it once it can
 * play, and playback only runs while the element is on screen. Muted, inline, no controls.
 */
export default function Motion({ k, alt = '', className = '', once = false, priority = false, position = 'center', onEnded }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [near, setNear] = useState(priority)
  const [revealed, setRevealed] = useState(false)
  const clip = CLIPS[k]

  // a one-shot clip waits for the intro loader to lift, so nobody misses the move
  useEffect(() => (once ? whenRevealed(() => setRevealed(true)) : undefined), [once])
  useEffect(() => {
    if (once && revealed && ready) vid.current?.play().catch(() => {})
  }, [once, revealed, ready])

  useEffect(() => {
    const el = ref.current
    if (!el || !clip) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true)
        const v = vid.current
        if (!v) return
        if (once) return
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [clip, once])

  return (
    <div ref={ref} className={`mo ${className}`}>
      <img
        src={media(k, 'sm')}
        srcSet={`${media(k, 'sm')} 900w, ${media(k)} 2000w`}
        sizes="(max-width: 767px) 100vw, 80vw"
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{ objectPosition: position }}
      />
      {clip && near && (
        <video
          ref={vid}
          className={ready ? 'is-on' : ''}
          src={clip}
          muted
          playsInline
          autoPlay={!once}
          loop={!once}
          preload="auto"
          disablePictureInPicture
          aria-hidden
          onCanPlay={() => setReady(true)}
          onEnded={onEnded}
          style={{ objectPosition: position }}
        />
      )}
    </div>
  )
}
