/**
 * Creative Studio hero object: one continuous ribbon of liquid chrome, knotted on itself,
 * running from the studio's royal blue through teal to green. It floats on a white wall,
 * turns slowly, leans toward the pointer, and opens up as the page scrolls.
 *
 * Plain three.js, one mesh, one draw call. Transparent canvas over the CSS wall.
 * Resolution adapts to the device's real frame time; the loop sleeps off-screen.
 */
import * as THREE from 'three'
import { pointer } from '@/lib/hooks'

export type RibbonState = { intro: number; scroll: number }
export type RibbonForm = { dispose: () => void }

/** A bright studio: white wall and floor, black flags for contrast, blue and green cards for colour. */
function buildEnv(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene()
  env.background = new THREE.Color(0xdfe3e8)
  const geo = new THREE.PlaneGeometry(1, 1)
  const mats: THREE.Material[] = []
  const card = (hex: number, k: number, pos: [number, number, number], scale: [number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side: THREE.DoubleSide, toneMapped: false })
    mats.push(mat)
    const m = new THREE.Mesh(geo, mat)
    m.position.set(...pos)
    m.scale.set(scale[0], scale[1], 1)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  // soft boxes
  card(0xffffff, 3.2, [0, 9, 4], [14, 6])
  card(0xffffff, 2.2, [-9, 2, 6], [5, 10])
  card(0xffffff, 1.8, [9, 3, 5], [4, 9])
  // black flags: chrome on white only reads as chrome if it has something dark to mirror
  card(0x05070c, 1, [6, -1, 9], [2.2, 14])
  card(0x05070c, 1, [-5, 0, 10], [1.4, 14])
  card(0x05070c, 1, [0, -9, 0], [18, 18])
  card(0x05070c, 1, [-10, -3, -4], [8, 5])
  // colour cards
  card(0x1638ff, 2.6, [-8, 5, -5], [9, 5])
  card(0x16b4ff, 2.2, [10, -2, -3], [6, 6])
  card(0x00e08a, 2.4, [3, 6, -9], [9, 4])
  card(0x7cff3a, 1.8, [8, 7, 2], [3, 3])
  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(env, 0.03).texture
  pmrem.dispose()
  geo.dispose()
  mats.forEach((m) => m.dispose())
  return tex
}

/** Returns null when WebGL is unavailable; the caller keeps the plain wall. */
export function createRibbonForm(host: HTMLElement, state: RibbonState): RibbonForm | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false })
  } catch {
    return null
  }
  const canvas = renderer.domElement
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block' })
  host.appendChild(canvas)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0

  const mobile = window.matchMedia('(max-width: 767px)').matches
  let pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75)
  renderer.setPixelRatio(pr)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
  camera.position.set(0, 0, 9)
  const envTex = buildEnv(renderer)
  scene.environment = envTex
  scene.environmentIntensity = 0.95

  // the ribbon: a torus knot flattened into a band, coloured along its length
  const geo = new THREE.TorusKnotGeometry(1.25, 0.34, mobile ? 220 : 340, mobile ? 20 : 28, 2, 3)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  const col = new Float32Array(pos.count * 3)
  const a = new THREE.Color('#1638ff')
  const b = new THREE.Color('#12b0e8')
  const c = new THREE.Color('#00d98a')
  const d = new THREE.Color('#7cff3a')
  const tmp = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    // there and back again along the length, so the seam is invisible
    const u = uv.getX(i)
    const t = 1 - Math.abs(u * 2 - 1)
    if (t < 0.4) tmp.copy(a).lerp(b, t / 0.4)
    else if (t < 0.75) tmp.copy(b).lerp(c, (t - 0.4) / 0.35)
    else tmp.copy(c).lerp(d, (t - 0.75) / 0.25)
    col[i * 3] = tmp.r
    col[i * 3 + 1] = tmp.g
    col[i * 3 + 2] = tmp.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 1, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 })
  // a pulse of light keeps running through the ribbon, in the ribbon's own colour
  const pulse = { value: 0 }
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uT = pulse
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vU;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvU = uv.x;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vU; uniform float uT;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
      float pl = pow(0.5 + 0.5 * sin(vU * 12.5664 - uT * 1.5), 9.0);
      totalEmissiveRadiance += vColor.rgb * pl * 1.5 + vec3(0.85, 1.0, 0.96) * pow(pl, 5.0) * 0.7;`,
      )
  }
  const knot = new THREE.Mesh(geo, mat)
  knot.scale.set(1, 1, 0.62) // flatten the tube toward a band
  const rig = new THREE.Group()
  rig.add(knot)
  scene.add(rig)

  // three small chrome beads in orbit, each on its own tilted path
  const beadGeo = new THREE.SphereGeometry(0.1, 24, 16)
  const beads = [0x1638ff, 0x00d98a, 0xf2f6fb].map((hex, i) => {
    const bm = new THREE.MeshPhysicalMaterial({ color: hex, metalness: 1, roughness: 0.12, clearcoat: 1, emissive: hex, emissiveIntensity: 0.35 })
    const mesh = new THREE.Mesh(beadGeo, bm)
    mesh.scale.setScalar(i === 2 ? 0.7 : 1)
    rig.add(mesh)
    return { mesh, bm, r: 2.15 + i * 0.22, speed: 0.55 + i * 0.21, tilt: 0.5 + i * 0.9, phase: i * 2.1 }
  })

  const size = { w: 1, h: 1 }
  let fit = 1
  let px = 0
  let py = 0
  const resize = () => {
    const r = host.getBoundingClientRect()
    size.w = Math.max(1, r.width)
    size.h = Math.max(1, r.height)
    renderer.setPixelRatio(pr)
    renderer.setSize(size.w, size.h, false)
    camera.aspect = size.w / size.h
    camera.updateProjectionMatrix()
    const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    const vw = vh * camera.aspect
    const land = camera.aspect > 1.05
    // right of the headline on wide screens, above it on tall ones
    fit = Math.min((vw * (land ? 0.4 : 0.8)) / 4.6, (vh * (land ? 0.74 : 0.4)) / 4.6) * 1.18
    px = land ? vw * 0.2 : 0
    py = land ? vh * 0.02 : vh * 0.17
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '60px' })
  io.observe(host)

  let raf = 0
  let last = performance.now()
  let t = 0
  let frames = 0
  let slow = 0
  const m = new THREE.Vector2()
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const raw = now - last
    last = now
    if (!visible || document.hidden) return
    const dt = Math.min(raw, 50) / 1000
    if (raw < 200) {
      frames++
      if (raw > 22) slow++
      if (frames >= 45) {
        if (slow > 22 && pr > 0.7) {
          pr = Math.max(0.7, pr * 0.82)
          resize()
        }
        frames = 0
        slow = 0
      }
    }
    t += dt
    if (pointer.px || pointer.py) {
      m.x += (pointer.x - m.x) * 0.05
      m.y += (pointer.y - m.y) * 0.05
    }
    const e = 1 - Math.pow(1 - state.intro, 3)
    const s = state.scroll
    // intro: arrives turning; scroll: comes to centre, grows and keeps turning
    rig.position.set(px * (1 - s), py * (1 - s) + Math.sin(t * 0.7) * 0.06, 0)
    rig.scale.setScalar(fit * (0.6 + 0.4 * e) * (1 + s * 1.6))
    rig.rotation.y = t * 0.28 + m.x * 0.9 + (1 - e) * -2.2 + s * 2.4
    rig.rotation.x = 0.35 + Math.sin(t * 0.23) * 0.18 - m.y * 0.6 + s * 0.8
    rig.rotation.z = Math.sin(t * 0.17) * 0.12
    pulse.value = t
    for (const bd of beads) {
      const a2 = t * bd.speed + bd.phase
      const x = Math.cos(a2) * bd.r
      const z = Math.sin(a2) * bd.r
      bd.mesh.position.set(x, Math.sin(bd.tilt) * z, Math.cos(bd.tilt) * z)
      bd.mesh.visible = state.intro > 0.3
    }
    knot.visible = state.intro > 0.002
    scene.environmentRotation.set(0, t * 0.12 + m.x * 0.4, 0)
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      geo.dispose()
      mat.dispose()
      beadGeo.dispose()
      beads.forEach((b) => b.bm.dispose())
      envTex.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
