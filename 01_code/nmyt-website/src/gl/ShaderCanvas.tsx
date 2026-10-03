import { useEffect, useRef, type CSSProperties } from 'react'
import * as THREE from 'three'
import { pointer } from '@/lib/hooks'

export type ShaderFrame = {
  time: number
  dt: number
  mouse: THREE.Vector2
  uniforms: Record<string, THREE.IUniform>
  size: { w: number; h: number }
}

type Props = {
  fragment: string
  uniforms?: Record<string, THREE.IUniform>
  onFrame?: (f: ShaderFrame) => void
  className?: string
  style?: CSSProperties
  /** max device-pixel-ratio */
  dpr?: number
  /** pointer smoothing (0..1, lower = smoother) */
  follow?: number
  transparent?: boolean
}

const VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

/**
 * Full-screen fragment-shader canvas. Provides uRes, uTime, uMouse (smoothed -1..1).
 * Pauses when off-screen or tab hidden. Used by hero + studio backgrounds.
 */
export default function ShaderCanvas({ fragment, uniforms = {}, onFrame, className, style, dpr = 1.5, follow = 0.06, transparent = false }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const cb = useRef(onFrame)
  cb.current = onFrame

  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: transparent, powerPreference: 'high-performance', premultipliedAlpha: false })
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.2 : Math.min(dpr, 1.5)))
    renderer.setClearColor(0x030408, transparent ? 0 : 1)
    el.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const u: Record<string, THREE.IUniform> = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      ...uniforms,
    }
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: fragment, uniforms: u, transparent, depthTest: false, depthWrite: false })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
    scene.add(mesh)

    const size = { w: 1, h: 1 }
    const resize = () => {
      const r = el.getBoundingClientRect()
      size.w = Math.max(1, r.width)
      size.h = Math.max(1, r.height)
      renderer.setSize(size.w, size.h, false)
      const pr = renderer.getPixelRatio()
      ;(u.uRes.value as THREE.Vector2).set(size.w * pr, size.h * pr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    let isRunning = false
    let visible = true
    const m = u.uMouse.value as THREE.Vector2

    const loop = () => {
      if (!isRunning) return
      raf = requestAnimationFrame(loop)
      const dt = Math.min(clock.getDelta(), 0.05)
      u.uTime.value += dt
      // pointer relative to this element
      const r = el.getBoundingClientRect()
      const tx = ((pointer.px - r.left) / r.width) * 2 - 1
      const ty = -(((pointer.py - r.top) / r.height) * 2 - 1)
      if (pointer.px || pointer.py) {
        m.x += (tx - m.x) * follow
        m.y += (ty - m.y) * follow
      }
      cb.current?.({ time: u.uTime.value, dt, mouse: m, uniforms: u, size })
      renderer.render(scene, camera)
    }

    const startLoop = () => {
      if (isRunning || !visible || document.hidden) return
      isRunning = true
      clock.start()
      loop()
    }

    const stopLoop = () => {
      isRunning = false
      if (raf) cancelAnimationFrame(raf)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible) startLoop()
        else stopLoop()
      },
      { rootMargin: '80px' },
    )
    io.observe(el)

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop()
      else if (visible) startLoop()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    startLoop()

    return () => {
      stopLoop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      ro.disconnect()
      io.disconnect()
      mat.dispose()
      mesh.geometry.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragment])

  return <div ref={host} className={className} style={{ position: 'absolute', inset: 0, ...style }} aria-hidden />
}
