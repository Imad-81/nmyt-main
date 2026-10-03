import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { pointer } from '@/lib/hooks'

const rand = (a: number, b: number) => a + Math.random() * (b - a)

interface ProcessParticlesProps {
  progress: React.MutableRefObject<number>
  className?: string
}

export default function ProcessParticles({ progress, className }: ProcessParticlesProps) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    const mobile = window.matchMedia('(max-width: 767px)').matches
    const N = mobile ? 3600 : 8000
    let disposed = false

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50)
    camera.position.set(0, 0, 8.5)

    const A = new Float32Array(N * 3) // 0: Listen (Conversing Voice Waves)
    const B = new Float32Array(N * 3) // 1: Shape (Wireframe Cube + Blueprint Grid)
    const C = new Float32Array(N * 3) // 2: Make (Cinema Aperture + Code Brackets)
    const D = new Float32Array(N * 3) // 3: Launch (Exponential Growth Trajectory Graph)
    const R = new Float32Array(N)
    const S = new Float32Array(N)

    // ========== 01 / LISTEN: Dual Voice Waves in Conversation ==========
    for (let i = 0; i < N; i++) {
      const mode = Math.random()
      if (mode < 0.22) {
        // Center conversational resonance pulses
        const a = Math.random() * Math.PI * 2
        const rad = rand(0.15, 0.95)
        A[i * 3] = Math.cos(a) * rad
        A[i * 3 + 1] = Math.sin(a) * rad * 0.75
        A[i * 3 + 2] = rand(-0.15, 0.15)
      } else if (mode < 0.61) {
        // Left voice (Client speech frequency)
        const x = rand(-2.8, -0.25)
        const env = Math.exp(-Math.pow(Math.abs(x) - 1.45, 2) * 1.8)
        const y = Math.sin(x * 6.2) * env * 1.45 + (Math.random() - 0.5) * 0.14
        A[i * 3] = x
        A[i * 3 + 1] = y
        A[i * 3 + 2] = rand(-0.2, 0.2)
      } else {
        // Right voice (Studio response wave)
        const x = rand(0.25, 2.8)
        const env = Math.exp(-Math.pow(Math.abs(x) - 1.45, 2) * 1.8)
        const y = Math.sin(x * 5.4 + 1.2) * env * 1.45 + (Math.random() - 0.5) * 0.14
        A[i * 3] = x
        A[i * 3 + 1] = y
        A[i * 3 + 2] = rand(-0.2, 0.2)
      }
    }

    // ========== 02 / SHAPE: Geometric Wireframe Cube + Isometric Grid ==========
    const cubeEdges: [number, number, number, number, number, number][] = [
      // Bottom square
      [-1.1, -1.1, -1.1, 1.1, -1.1, -1.1],
      [1.1, -1.1, -1.1, 1.1, 1.1, -1.1],
      [1.1, 1.1, -1.1, -1.1, 1.1, -1.1],
      [-1.1, 1.1, -1.1, -1.1, -1.1, -1.1],
      // Top square
      [-1.1, -1.1, 1.1, 1.1, -1.1, 1.1],
      [1.1, -1.1, 1.1, 1.1, 1.1, 1.1],
      [1.1, 1.1, 1.1, -1.1, 1.1, 1.1],
      [-1.1, 1.1, 1.1, -1.1, -1.1, 1.1],
      // Pillars
      [-1.1, -1.1, -1.1, -1.1, -1.1, 1.1],
      [1.1, -1.1, -1.1, 1.1, -1.1, 1.1],
      [1.1, 1.1, -1.1, 1.1, 1.1, 1.1],
      [-1.1, 1.1, -1.1, -1.1, 1.1, 1.1],
      // Cross axes
      [-1.1, 0, 0, 1.1, 0, 0],
      [0, -1.1, 0, 0, 1.1, 0],
      [0, 0, -1.1, 0, 0, 1.1],
    ]

    for (let i = 0; i < N; i++) {
      if (Math.random() < 0.7) {
        const e = cubeEdges[Math.floor(Math.random() * cubeEdges.length)]
        const t = Math.random()
        B[i * 3] = (e[0] + (e[3] - e[0]) * t) * 1.25 + rand(-0.02, 0.02)
        B[i * 3 + 1] = (e[1] + (e[4] - e[1]) * t) * 1.25 + rand(-0.02, 0.02)
        B[i * 3 + 2] = (e[2] + (e[5] - e[2]) * t) * 1.25 + rand(-0.02, 0.02)
      } else {
        // Ground blueprint grid
        const gx = rand(-2.4, 2.4)
        const gz = rand(-2.4, 2.4)
        B[i * 3] = gx
        B[i * 3 + 1] = -1.6 + rand(-0.03, 0.03)
        B[i * 3 + 2] = gz
      }
    }

    // ========== 03 / MAKE: Camera Aperture + Code Brackets { ; } ==========
    for (let i = 0; i < N; i++) {
      const mode = Math.random()
      if (mode < 0.45) {
        // Aperture 7 blades + outer barrel
        const isOuter = Math.random() < 0.35
        if (isOuter) {
          const a = Math.random() * Math.PI * 2
          const rad = rand(1.5, 1.7)
          C[i * 3] = Math.cos(a) * rad
          C[i * 3 + 1] = Math.sin(a) * rad
          C[i * 3 + 2] = rand(-0.08, 0.08)
        } else {
          const k = Math.floor(Math.random() * 7)
          const a0 = (k / 7) * Math.PI * 2
          const a1 = a0 + (Math.PI * 2) / 7 + 0.35
          const p0 = [Math.cos(a0) * 0.7, Math.sin(a0) * 0.7]
          const p1 = [Math.cos(a1) * 1.45, Math.sin(a1) * 1.45]
          const t = Math.random()
          C[i * 3] = p0[0] + (p1[0] - p0[0]) * t + rand(-0.02, 0.02)
          C[i * 3 + 1] = p0[1] + (p1[1] - p0[1]) * t + rand(-0.02, 0.02)
          C[i * 3 + 2] = rand(-0.08, 0.08)
        }
      } else if (mode < 0.75) {
        // Left curly bracket {
        const t = rand(-1.6, 1.6)
        const bend = Math.sin((t / 1.6) * Math.PI * 0.5)
        const tip = Math.exp(-Math.pow(t, 2) * 8.0) * 0.35
        const x = -2.15 + (Math.abs(bend) * 0.35 - tip)
        C[i * 3] = x + rand(-0.025, 0.025)
        C[i * 3 + 1] = t
        C[i * 3 + 2] = rand(-0.08, 0.08)
      } else {
        // Right curly bracket }
        const t = rand(-1.6, 1.6)
        const bend = Math.sin((t / 1.6) * Math.PI * 0.5)
        const tip = Math.exp(-Math.pow(t, 2) * 8.0) * 0.35
        const x = 2.15 - (Math.abs(bend) * 0.35 - tip)
        C[i * 3] = x + rand(-0.025, 0.025)
        C[i * 3 + 1] = t
        C[i * 3 + 2] = rand(-0.08, 0.08)
      }
    }

    // ========== 04 / LAUNCH: Exponential Growth Curve + Coordinates ==========
    for (let i = 0; i < N; i++) {
      const mode = Math.random()
      if (mode < 0.58) {
        // Parabolic rocket growth curve
        const t = Math.pow(Math.random(), 0.9)
        const x = -2.3 + t * 4.6
        const y = -1.45 + Math.pow(t, 2.3) * 3.1
        D[i * 3] = x + rand(-0.035, 0.035)
        D[i * 3 + 1] = y + rand(-0.035, 0.035)
        D[i * 3 + 2] = rand(-0.1, 0.1)
      } else if (mode < 0.78) {
        // Rocket / vector arrow head burst at top right
        const a = rand(-0.4, 0.9)
        const dist = rand(0.05, 0.7)
        D[i * 3] = 2.3 + Math.cos(a) * dist + rand(-0.04, 0.04)
        D[i * 3 + 1] = 1.65 + Math.sin(a) * dist + rand(-0.04, 0.04)
        D[i * 3 + 2] = rand(-0.15, 0.15)
      } else {
        // Horizontal & Vertical Grid axes
        const isX = Math.random() < 0.55
        if (isX) {
          D[i * 3] = rand(-2.4, 2.4)
          D[i * 3 + 1] = -1.45 + rand(-0.015, 0.015)
          D[i * 3 + 2] = rand(-0.05, 0.05)
        } else {
          D[i * 3] = -2.3 + rand(-0.015, 0.015)
          D[i * 3 + 1] = rand(-1.45, 1.8)
          D[i * 3 + 2] = rand(-0.05, 0.05)
        }
      }
    }

    for (let i = 0; i < N; i++) {
      R[i] = Math.random()
      S[i] = Math.random() < 0.08 ? rand(1.6, 2.4) : rand(0.65, 1.15)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(A.slice(), 3))
    geo.setAttribute('aA', new THREE.BufferAttribute(A, 3))
    geo.setAttribute('aB', new THREE.BufferAttribute(B, 3))
    geo.setAttribute('aC', new THREE.BufferAttribute(C, 3))
    geo.setAttribute('aD', new THREE.BufferAttribute(D, 3))
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
        attribute vec3 aA; attribute vec3 aB; attribute vec3 aC; attribute vec3 aD;
        attribute float aR; attribute float aS;
        uniform float uTime; uniform float uMorph; uniform vec3 uMouse; uniform float uPx; uniform float uScale;
        varying vec3 vCol; varying float vA;

        float ease(float t){ return t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.; }

        void main(){
          // 4-stage morph: 0..1 (A->B), 1..2 (B->C), 2..3 (C->D)
          float m1 = clamp((uMorph - 0.0) * 1.35 - aR * 0.35, 0., 1.);
          float m2 = clamp((uMorph - 1.0) * 1.35 - aR * 0.35, 0., 1.);
          float m3 = clamp((uMorph - 2.0) * 1.35 - aR * 0.35, 0., 1.);

          vec3 p = mix(aA, aB, ease(m1));
          p = mix(p, aC, ease(m2));
          p = mix(p, aD, ease(m3));

          // Fluid aerodynamic turbulence during transitions
          float trav = sin(3.14159 * m1) + sin(3.14159 * m2) + sin(3.14159 * m3);
          p += vec3(sin(aR * 42. + uTime * 1.3), cos(aR * 35. + uTime * 1.1), sin(aR * 23. + uTime)) * 0.32 * trav;

          // Subtle organic breathing idle
          p += vec3(sin(uTime * 0.75 + aR * 50.), cos(uTime * 0.65 + aR * 40.), 0.) * 0.015;
          p *= uScale;

          // Interactive cursor repulsion
          vec2 d = p.xy - uMouse.xy;
          float l = length(d);
          p.xy += normalize(d + 1e-4) * (1. - smoothstep(0., 1.15, l)) * 0.42;

          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aS * uPx * 2.5 * (8.5 / -mv.z);

          // Dynamic 4-Phase Palette
          // 01 Listen: Ice Cyan -> Sky
          vec3 ice = vec3(.81, .94, 1.);
          vec3 sky = vec3(.086, .706, 1.);
          vec3 colA = mix(ice, sky, aR);

          // 02 Shape: Royal Sky -> Royal Deep
          vec3 royal = vec3(.086, .22, 1.);
          vec3 colB = mix(sky, royal, aR);

          // 03 Make: Electric Acid Lime
          vec3 acid = vec3(.486, 1., .227);
          vec3 mint = vec3(0., .92, .65);
          vec3 colC = mix(acid, mint, aR);

          // 04 Launch: Emerald -> Neon Cyan
          vec3 emer = vec3(0., .878, .541);
          vec3 colD = mix(emer, sky, aR);

          // Interpolate colors across morph
          vec3 col = mix(colA, colB, ease(m1));
          col = mix(col, colC, ease(m2));
          col = mix(col, colD, ease(m3));

          vCol = col;
          vA = .58 + .42 * aR;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vCol; varying float vA;
        void main(){
          vec2 c = gl_PointCoord - .5;
          float d = length(c);
          float a = smoothstep(.5, .0, d);
          a = pow(a, 1.5);
          gl_FragColor = vec4(vCol * 1.35, a * vA);
        }
      `,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    const resize = () => {
      const r = el.getBoundingClientRect()
      renderer.setSize(r.width, r.height, false)
      camera.aspect = r.width / Math.max(1, r.height)
      camera.updateProjectionMatrix()
      const visW = 2 * 8.5 * Math.tan(THREE.MathUtils.degToRad(19)) * camera.aspect
      uniforms.uScale.value = Math.min(1.15, visW / 6.2)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let visible = false
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(el)

    const clock = new THREE.Clock()
    const ray = new THREE.Vector3()
    let raf = 0
    let rotX = 0
    let rotY = 0

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (disposed || !visible || document.hidden) return
      const dt = Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value += dt
      uniforms.uMorph.value += (progress.current - uniforms.uMorph.value) * 0.08

      const r = el.getBoundingClientRect()
      const nx = ((pointer.px - r.left) / r.width) * 2 - 1
      const ny = -((pointer.py - r.top) / r.height) * 2 + 1

      if (Math.abs(nx) < 1.2 && Math.abs(ny) < 1.2) {
        ray.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize()
        const t = -camera.position.z / ray.z
        const target = camera.position.clone().add(ray.multiplyScalar(t))
        uniforms.uMouse.value.lerp(target, 0.15)
        rotY += (nx * 0.18 - rotY) * 0.05
        rotX += (-ny * 0.12 - rotX) * 0.05
      } else {
        uniforms.uMouse.value.lerp(new THREE.Vector3(99, 99, 0), 0.05)
      }

      // Gentle rotation when in geometric shape mode
      const isShape = Math.max(0, 1 - Math.abs(uniforms.uMorph.value - 1.0))
      points.rotation.set(
        rotX + isShape * Math.sin(uniforms.uTime.value * 0.4) * 0.25,
        rotY + uniforms.uTime.value * 0.12 * isShape + Math.sin(uniforms.uTime.value * 0.25) * 0.04,
        0,
      )

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
