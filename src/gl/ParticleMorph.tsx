import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { pointer } from '@/lib/hooks'

/**
 * ~9k particles morphing between three forms, driven by `progress.current` (0..2):
 *   0 → a website wireframe (Tech Studio)
 *   1 → a camera lens aperture (Creative Studio)
 *   2 → the NMYT mark, sampled from the real logo silhouette
 * Cursor repels particles. Additive glow, colour follows the form.
 */
export default function ParticleMorph({ progress, className }: { progress: React.MutableRefObject<number>; className?: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current!
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const N = mobile ? 4200 : 9000
    let disposed = false

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)
    camera.position.set(0, 0, 9)

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    // ---------- target A: website wireframe ----------
    const segs: [number, number, number, number][] = []
    const rect = (x: number, y: number, w: number, h: number) => {
      segs.push([x, y, x + w, y], [x + w, y, x + w, y - h], [x + w, y - h, x, y - h], [x, y - h, x, y])
    }
    const W = 5.2
    const H = 3.3
    const x0 = -W / 2
    const y0 = H / 2
    rect(x0, y0, W, H) // window
    segs.push([x0, y0 - 0.32, x0 + W, y0 - 0.32]) // toolbar
    for (let i = 0; i < 3; i++) rect(x0 + 0.14 + i * 0.16, y0 - 0.12, 0.08, 0.08) // traffic lights
    rect(x0 + 1.4, y0 - 0.1, 2.4, 0.12) // url bar
    // nav
    rect(x0 + 0.3, y0 - 0.55, 0.5, 0.12)
    for (let i = 0; i < 4; i++) rect(x0 + 2.6 + i * 0.52, y0 - 0.57, 0.38, 0.08)
    // hero headline + lede + button
    rect(x0 + 0.3, y0 - 0.95, 2.4, 0.26)
    rect(x0 + 0.3, y0 - 1.32, 1.8, 0.26)
    rect(x0 + 0.3, y0 - 1.75, 1.6, 0.06)
    rect(x0 + 0.3, y0 - 1.88, 1.3, 0.06)
    rect(x0 + 0.3, y0 - 2.1, 0.7, 0.2)
    // hero image
    rect(x0 + 2.95, y0 - 0.95, 1.95, 1.35)
    segs.push([x0 + 2.95, y0 - 0.95, x0 + 4.9, y0 - 2.3], [x0 + 4.9, y0 - 0.95, x0 + 2.95, y0 - 2.3])
    // cards
    for (let i = 0; i < 3; i++) rect(x0 + 0.3 + i * 1.57, y0 - 2.5, 1.43, 0.62)
    const segLen = segs.map(([a, b, c, d]) => Math.hypot(c - a, d - b))
    const totalLen = segLen.reduce((s, v) => s + v, 0)
    const pickOnSegs = () => {
      let r = Math.random() * totalLen
      for (let i = 0; i < segs.length; i++) {
        if (r < segLen[i]) {
          const t = r / segLen[i]
          const [a, b, c, d] = segs[i]
          return [a + (c - a) * t, b + (d - b) * t]
        }
        r -= segLen[i]
      }
      return [0, 0]
    }

    // ---------- target B: lens aperture ----------
    const pickAperture = (): [number, number] => {
      const r = Math.random()
      if (r < 0.28) {
        const a = rand(0, Math.PI * 2)
        return [Math.cos(a) * 1.75, Math.sin(a) * 1.75]
      }
      if (r < 0.46) {
        const a = rand(0, Math.PI * 2)
        const rr = rand(1.88, 1.98)
        // focus-scale ticks
        const tick = Math.round((a / (Math.PI * 2)) * 72) / 72
        const aa = tick * Math.PI * 2
        return [Math.cos(aa) * rr, Math.sin(aa) * rr]
      }
      if (r < 0.62) {
        const a = rand(0, Math.PI * 2)
        return [Math.cos(a) * 1.28, Math.sin(a) * 1.28]
      }
      // 7 aperture blades: straight edges forming a heptagonal opening
      const k = Math.floor(Math.random() * 7)
      const a0 = (k / 7) * Math.PI * 2 + 0.3
      const a1 = a0 + (Math.PI * 2) / 7
      const inner = 0.62
      const p0 = [Math.cos(a0) * inner, Math.sin(a0) * inner]
      // blade edge extends out toward the inner ring
      const p1 = [Math.cos(a1 + 0.55) * 1.28, Math.sin(a1 + 0.55) * 1.28]
      const t = Math.random()
      return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]
    }

    const geo = new THREE.BufferGeometry()
    const A = new Float32Array(N * 3)
    const B = new Float32Array(N * 3)
    const C = new Float32Array(N * 3)
    const R = new Float32Array(N)
    const S = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const [ax, ay] = pickOnSegs()
      A[i * 3] = ax + rand(-0.012, 0.012)
      A[i * 3 + 1] = ay + rand(-0.012, 0.012)
      A[i * 3 + 2] = rand(-0.05, 0.05)
      const [bx, by] = pickAperture()
      B[i * 3] = bx + rand(-0.015, 0.015)
      B[i * 3 + 1] = by + rand(-0.015, 0.015)
      B[i * 3 + 2] = rand(-0.08, 0.08)
      R[i] = Math.random()
      S[i] = Math.random() < 0.06 ? rand(1.6, 2.6) : rand(0.6, 1.2)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(A.slice(), 3))
    geo.setAttribute('aA', new THREE.BufferAttribute(A, 3))
    geo.setAttribute('aB', new THREE.BufferAttribute(B, 3))
    geo.setAttribute('aC', new THREE.BufferAttribute(C, 3))
    geo.setAttribute('aR', new THREE.BufferAttribute(R, 1))
    geo.setAttribute('aS', new THREE.BufferAttribute(S, 1))

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uPx: { value: renderer.getPixelRatio() },
      uScale: { value: 1 },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aA; attribute vec3 aB; attribute vec3 aC; attribute float aR; attribute float aS;
        uniform float uTime; uniform float uMorph; uniform vec3 uMouse; uniform float uPx; uniform float uScale;
        varying vec3 vCol; varying float vA;
        float ease(float t){ return t<.5 ? 4.*t*t*t : 1.-pow(-2.*t+2.,3.)/2.; }
        void main(){
          float m1 = clamp((uMorph - 0.0)*1.35 - aR*0.35, 0., 1.);
          float m2 = clamp((uMorph - 1.0)*1.35 - aR*0.35, 0., 1.);
          vec3 p = mix(aA, aB, ease(m1));
          p = mix(p, aC, ease(m2));
          // turbulence while travelling
          float trav = sin(3.14159*m1) + sin(3.14159*m2);
          p += vec3(sin(aR*40.+uTime*1.3), cos(aR*33.+uTime*1.1), sin(aR*21.+uTime))*0.35*trav;
          // idle shimmer
          p += vec3(sin(uTime*.8+aR*60.), cos(uTime*.7+aR*50.), 0.)*0.012;
          p *= uScale;
          // cursor repulsion
          vec2 d = p.xy - uMouse.xy;
          float l = length(d);
          p.xy += normalize(d + 1e-4) * (1. - smoothstep(0., 1.1, l)) * 0.42;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aS * uPx * 2.4 * (9. / -mv.z);
          vec3 sky = vec3(.086,.706,1.), ice=vec3(.81,.94,1.), royal=vec3(.086,.22,1.), acid=vec3(.486,1.,.227), emer=vec3(0.,.878,.541);
          vec3 cA = mix(sky, ice, step(.82, aR));
          vec3 cB = mix(emer, acid, aR);
          float gx = clamp(aC.x*0.2+0.5, 0., 1.);
          vec3 cC = gx < .55 ? mix(royal, sky, gx/.55) : mix(sky, acid, (gx-.55)/.45);
          vCol = mix(mix(cA, cB, ease(m1)), cC, ease(m2));
          vA = .55 + .45*aR;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vCol; varying float vA;
        void main(){
          vec2 c = gl_PointCoord - .5;
          float d = length(c);
          float a = smoothstep(.5, .0, d);
          a = pow(a, 1.6);
          gl_FragColor = vec4(vCol * 1.25, a * vA);
        }
      `,
    })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // ---------- target C: NMYT mark from the logo alpha mask ----------
    const img = new Image()
    img.src = '/brand/nmyt-mask.png'
    img.onload = () => {
      if (disposed) return
      const cw = img.width
      const ch = img.height
      const cv = document.createElement('canvas')
      cv.width = cw
      cv.height = ch
      const ctx = cv.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, cw, ch).data
      const inside: number[] = []
      const edge: number[] = []
      const at = (x: number, y: number) => data[(y * cw + x) * 4]
      for (let y = 1; y < ch - 1; y += 1)
        for (let x = 1; x < cw - 1; x += 1) {
          if (at(x, y) > 128) {
            const e = at(x - 1, y) < 128 || at(x + 1, y) < 128 || at(x, y - 1) < 128 || at(x, y + 1) < 128
            ;(e ? edge : inside).push(x, y)
          }
        }
      const scale = 5.4 / cw
      for (let i = 0; i < N; i++) {
        const useEdge = Math.random() < 0.42
        const arr = useEdge ? edge : inside
        const k = Math.floor(Math.random() * (arr.length / 2)) * 2
        C[i * 3] = (arr[k] - cw / 2) * scale + rand(-0.006, 0.006)
        C[i * 3 + 1] = -(arr[k + 1] - ch / 2) * scale + rand(-0.006, 0.006)
        C[i * 3 + 2] = rand(-0.06, 0.06)
      }
      ;(geo.getAttribute('aC') as THREE.BufferAttribute).needsUpdate = true
    }

    const resize = () => {
      const r = el.getBoundingClientRect()
      renderer.setSize(r.width, r.height, false)
      camera.aspect = r.width / Math.max(1, r.height)
      camera.updateProjectionMatrix()
      // fit ~5.8 world units of width
      const visW = 2 * 9 * Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.aspect
      uniforms.uScale.value = Math.min(1.15, visW / 6.2)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    const clock = new THREE.Clock()
    const ray = new THREE.Vector3()
    let raf = 0
    let rotX = 0
    let rotY = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(clock.getDelta(), 0.05)
      if (!visible || document.hidden) return
      uniforms.uTime.value += dt
      uniforms.uMorph.value += (progress.current - uniforms.uMorph.value) * 0.08
      // cursor → world (z=0 plane)
      const r = el.getBoundingClientRect()
      const nx = ((pointer.px - r.left) / r.width) * 2 - 1
      const ny = -((pointer.py - r.top) / r.height) * 2 + 1
      if (Math.abs(nx) < 1.2 && Math.abs(ny) < 1.2) {
        ray.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize()
        const t = -camera.position.z / ray.z
        const target = camera.position.clone().add(ray.multiplyScalar(t))
        uniforms.uMouse.value.lerp(target, 0.15)
        rotY += (nx * 0.22 - rotY) * 0.05
        rotX += (-ny * 0.14 - rotX) * 0.05
      } else {
        uniforms.uMouse.value.lerp(new THREE.Vector3(99, 99, 0), 0.05)
      }
      points.rotation.set(rotX, rotY + Math.sin(uniforms.uTime.value * 0.25) * 0.05, 0)
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [progress])

  return <div ref={host} className={className} style={{ position: 'absolute', inset: 0 }} aria-hidden />
}
