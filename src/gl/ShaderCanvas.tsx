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
  /** return false to skip drawing this frame (the last image stays on screen) */
  onFrame?: (f: ShaderFrame) => void | boolean
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
 * Pauses when off-screen or tab hidden, and lowers its own resolution on devices that
 * can't hold a smooth frame rate. Used by hero + studio backgrounds.
 */
export default function ShaderCanvas({ fragment, uniforms = {}, onFrame, className, style, dpr = 1.5, follow = 0.06, transparent = false }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const cb = useRef(onFrame)
  cb.current = onFrame

  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: transparent, powerPreference: 'high-performance', premultipliedAlpha: false })
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    let pr = Math.min(window.devicePixelRatio, isMobile ? Math.min(dpr, 1.25) : dpr)
    renderer.setPixelRatio(pr)
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
      renderer.setPixelRatio(pr)
      renderer.setSize(size.w, size.h, false)
      ;(u.uRes.value as THREE.Vector2).set(size.w * pr, size.h * pr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    let frames = 0
    let slow = 0
    const m = u.uMouse.value as THREE.Vector2
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const raw = clock.getDelta()
      const dt = Math.min(raw, 0.05)
      if (!visible || document.hidden) return
      // adaptive resolution: when the GPU can't hold ~45fps, trade pixels for smoothness
      if (raw < 0.2) {
        frames++
        if (raw > 0.022) slow++
        if (frames >= 45) {
          if (slow > 22 && pr > 0.6) {
            pr = Math.max(0.6, pr * 0.8)
            resize()
          }
          frames = 0
          slow = 0
        }
      }
      u.uTime.value += dt
      // pointer relative to this element
      const r = el.getBoundingClientRect()
      const tx = ((pointer.px - r.left) / r.width) * 2 - 1
      const ty = -(((pointer.py - r.top) / r.height) * 2 - 1)
      if (pointer.px || pointer.py) {
        m.x += (tx - m.x) * follow
        m.y += (ty - m.y) * follow
      }
      if (cb.current?.({ time: u.uTime.value, dt, mouse: m, uniforms: u, size }) === false) return
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
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
