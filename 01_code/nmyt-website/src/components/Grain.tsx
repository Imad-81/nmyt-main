import { useEffect, useState } from 'react'

const TILE = 200

/**
 * Site-wide subtle static film grain.
 * Noise is rendered once without animation to eliminate visual jitter and screen vibration.
 */
export default function Grain({ strength = 0.018 }: { strength?: number }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = c.height = TILE
    const ctx = c.getContext('2d')!
    const img = ctx.createImageData(TILE, TILE)
    for (let i = 0; i < img.data.length; i += 4) {
      const light = Math.random() > 0.5
      const v = light ? 255 : 0
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = Math.random() * 255 * strength * (light ? 0.8 : 1.1)
    }
    ctx.putImageData(img, 0, 0)
    setUrl(c.toDataURL('image/png'))
  }, [strength])

  if (!url) return null

  return (
    <>
      <style>{`
        .grain {
          position: fixed;
          inset: 0;
          z-index: 900;
          pointer-events: none;
          background-size: ${TILE}px ${TILE}px;
          opacity: 0.4;
        }
      `}</style>
      <div className="grain" style={{ backgroundImage: `url(${url})` }} aria-hidden />
    </>
  )
}
