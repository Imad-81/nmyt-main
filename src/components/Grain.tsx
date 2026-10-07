import { useEffect, useState } from 'react'

const TILE = 180

/**
 * Site-wide animated film grain. Noise (with alpha baked in) is generated once on a
 * canvas; the layer is only one tile larger than the viewport and moves by whole
 * tiles-fractions with `transform` — composited on the GPU, no blend modes, no repaints.
 */
export default function Grain({ strength = 0.032 }: { strength?: number }) {
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
      img.data[i + 3] = Math.random() * 255 * strength * (light ? 0.9 : 1.2)
    }
    ctx.putImageData(img, 0, 0)
    setUrl(c.toDataURL('image/png'))
  }, [strength])
  if (!url) return null
  return (
    <>
      <style>{`
        .grain{position:fixed;left:-${TILE}px;top:-${TILE}px;right:-${TILE}px;bottom:-${TILE}px;z-index:900;pointer-events:none;background-size:${TILE}px ${TILE}px;will-change:transform;animation:grain .9s steps(1) infinite}
        @keyframes grain{
          0%{transform:translate3d(0,0,0)}
          16%{transform:translate3d(-61px,37px,0)}
          33%{transform:translate3d(47px,-83px,0)}
          50%{transform:translate3d(-29px,-17px,0)}
          66%{transform:translate3d(89px,53px,0)}
          83%{transform:translate3d(-97px,71px,0)}
          100%{transform:translate3d(0,0,0)}
        }
      `}</style>
      <div className="grain" style={{ backgroundImage: `url(${url})` }} aria-hidden />
    </>
  )
}
