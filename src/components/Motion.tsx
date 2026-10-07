import { useEffect, useRef, useState } from 'react'
import { media, type MediaKey } from '@/data/media'

/**
 * Short looping motion clips for the large visuals. A clip is used only when its file is
 * listed here; otherwise the still image shows. Files live in /public/media/video.
 */
export const CLIPS: Partial<Record<MediaKey, string>> = {
  // filled in as clips are produced, e.g. studioTeam: '/media/video/studio-team.mp4'
}

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
  const clip = CLIPS[k]

  useEffect(() => {
    const el = ref.current
    if (!el || !clip) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true)
        const v = vid.current
        if (!v) return
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [clip])

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
          autoPlay
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
