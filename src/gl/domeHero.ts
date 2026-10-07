/**
 * "The Dome" — NMYT home hero.
 * The camera sits inside a huge sphere. Two families of light rings wrap it:
 * royal/sky threads (Tech Studio) and acid/emerald silk (Creative Studio). Their axes are
 * offset, so the rings interleave and burn white where they cross — a spatial enclosure of
 * light with the chrome NMYT mark floating at its centre, reflecting the same palette.
 *
 * Plain three.js (no React renderer): one draw call for the dome, one for the mark.
 * Resolution adapts to the device's real frame time, and the loop sleeps off-screen.
 */
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { pointer } from '@/lib/hooks'
import mark from './nmyt-mark.json'

const MARK_W = 6 // world width of the mark

const DOME_VERT = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const DOME_FRAG = /* glsl */ `
precision highp float;
varying vec3 vDir;
uniform float uTime;
uniform float uIntro;
uniform float uScroll;
uniform vec2 uMouse;
uniform vec2 uRes;

const vec3 ROYAL = vec3(0.086, 0.22, 1.0);
const vec3 SKY   = vec3(0.086, 0.706, 1.0);
const vec3 ICE   = vec3(0.81, 0.94, 1.0);
const vec3 ACID  = vec3(0.486, 1.0, 0.227);
const vec3 EMER  = vec3(0.0, 0.878, 0.541);
const vec3 DEEP  = vec3(0.02, 0.05, 0.30);

float hash(float n){ return fract(sin(n * 91.345) * 47453.5453); }
float hash2(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// one family of rings around an axis. returns colour in rgb, raw intensity in a
vec4 rings(vec3 d, vec3 axis, float N, float t, float seed, vec3 cA, vec3 cB, float wav, float zoom){
  vec3 bx = normalize(cross(vec3(0.0, 1.0, 0.0), axis));
  vec3 by = cross(axis, bx);
  float pol = acos(clamp(dot(d, axis), -1.0, 1.0)) / zoom;
  float az = atan(dot(d, by), dot(d, bx));
  // silk: the rings breathe along their length (integer harmonics keep the seam closed)
  float w = wav * (0.6 * sin(az * 2.0 + t * 0.7 + seed) + 0.4 * sin(az * 3.0 - t * 0.45 + seed * 2.3));
  float v = (pow(pol, 0.86) + w * (0.05 + pol * 0.16)) * N;
  float id = floor(v);
  float h = hash(id + seed * 17.0);
  float dist = abs(fract(v) - 0.5) / N;
  // rings nearer the viewer (wider polar angle) read thicker: depth without geometry
  float width = mix(0.0006, 0.0024, h * h) * (0.6 + pol * 1.9);
  float g = width / (dist + 0.0011) * exp(-dist * 46.0);
  g += width * 9.0 * exp(-dist * dist * 2600.0);   // soft halo round the core
  // light travelling round each ring at its own pace
  float k = 1.0 + floor(h * 3.0);
  float flow = 0.34 + 0.66 * pow(0.5 + 0.5 * sin(az * k - t * (0.7 + h * 1.6) + h * 40.0), 2.4);
  g *= step(0.14, h) * flow;
  // rings write in from the pole outward; keep the centre calm for the mark
  g *= smoothstep(0.0, 0.25, uIntro * 1.5 - pol) * mix(0.2, 1.0, smoothstep(0.1, 0.36, pol));
  return vec4(mix(cA, cB, h) * g, g);
}

void main(){
  vec3 d = normalize(vDir);
  float t = uTime * 0.22;
  float zoom = 1.0 + uScroll * 0.7;
  vec3 m = vec3(uMouse * 0.07, 0.0);
  vec3 axA = normalize(vec3(0.05, 0.13, -1.0) + m);
  vec3 axB = normalize(vec3(-0.11, 0.03, -1.0) - m * 0.6);

  vec4 a = rings(d, axA, 21.0, t, 1.0, ROYAL, SKY, 1.0, zoom);
  vec4 b = rings(d, axB, 14.0, t * 0.9, 5.0, EMER, ACID, 1.5, zoom);
  vec3 col = a.rgb * 1.5 + b.rgb * 1.0;
  col += ICE * min(a.a, b.a) * 0.9;            // white-hot where the two studios cross

  // atmosphere: a deep blue breath behind the mark, a faint green counter-glow
  float pc = acos(clamp(-d.z, -1.0, 1.0));
  col += DEEP * exp(-pc * pc * 5.0) * 0.55 * uIntro;
  col += mix(ROYAL, SKY, 0.35) * exp(-pow((pc - 0.52) * 4.2, 2.0)) * 0.05 * uIntro;
  col += EMER * exp(-pow((acos(clamp(dot(d, axB), -1.0, 1.0)) - 0.6) * 4.0, 2.0)) * 0.022 * uIntro;

  // sparse dust riding the light
  vec2 gp = floor(gl_FragCoord.xy / 3.0);
  float s = hash2(gp + floor(uTime * 5.0));
  col += vec3(0.8, 0.95, 1.0) * step(0.9972, s) * min(1.0, (a.a + b.a) * 1.6) * 0.7;

  // vignette in view space, filmic tonemap that keeps saturation
  vec2 sp = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  col *= mix(0.5, 1.0, smoothstep(1.25, 0.2, length(sp * vec2(0.85, 1.1))));
  col = 1.0 - exp(-col * 1.3);
  col *= 1.0 - uScroll * 0.75;
  col += (hash2(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`

function buildMark() {
  const d = (mark as { parts: string[] }).parts.join(' ')
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`)
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p))
  const geos = shapes.map(
    (s) => new THREE.ExtrudeGeometry(s, { depth: 34, bevelEnabled: true, bevelThickness: 9, bevelSize: 6.5, bevelSegments: 6, curveSegments: 20 }),
  )
  const g = mergeGeometries(geos, false)!
  geos.forEach((x) => x.dispose())
  g.computeBoundingBox()
  const bb = g.boundingBox!
  g.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -(bb.min.z + bb.max.z) / 2)
  const s = MARK_W / (bb.max.x - bb.min.x)
  // SVG is y-down: turning 180° about X keeps it upright and un-mirrored
  g.scale(s, -s, -s)
  const out = toCreasedNormals(g, Math.PI / 5)
  g.dispose()
  // the faces are big fan triangles: pin their normals flat so bevel smoothing can't leak in
  const pos = out.attributes.position.array as Float32Array
  const nrm = out.attributes.normal.array as Float32Array
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  for (let i = 0; i < pos.length; i += 9) {
    a.set(pos[i], pos[i + 1], pos[i + 2])
    b.set(pos[i + 3], pos[i + 4], pos[i + 5])
    c.set(pos[i + 6], pos[i + 7], pos[i + 8])
    const n = b.sub(a).cross(c.sub(a)).normalize()
    if (Math.abs(n.z) > 0.9995) {
      for (let k = 0; k < 3; k++) {
        nrm[i + k * 3] = 0
        nrm[i + k * 3 + 1] = 0
        nrm[i + k * 3 + 2] = Math.sign(n.z)
      }
    }
  }
  out.attributes.normal.needsUpdate = true
  return out
}

/** A tiny studio of light strips in the brand palette, baked once into the chrome's reflections. */
function buildEnv(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene()
  env.background = new THREE.Color(0x01030c)
  const geo = new THREE.PlaneGeometry(1, 1)
  const mats: THREE.Material[] = []
  const strip = (hex: number, intensity: number, pos: [number, number, number], scale: [number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false })
    mats.push(mat)
    const m = new THREE.Mesh(geo, mat)
    m.position.set(...pos)
    m.scale.set(scale[0], scale[1], 1)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  // space whites
  strip(0xf2f8ff, 7, [0, 6, 8], [16, 0.5])
  strip(0xf2f8ff, 5, [7, 3, 6], [0.4, 9])
  strip(0xcfefff, 4.5, [-8, -2, 5], [0.5, 10])
  // blues
  strip(0x1638ff, 7, [-9, 3, 1], [9, 3.2])
  strip(0x16b4ff, 6, [9, -1, 2], [8, 1.1])
  strip(0x16b4ff, 4, [0, -7, 5], [14, 0.6])
  strip(0x1638ff, 3, [2, 2, -10], [18, 6])
  // greens
  strip(0x7cff3a, 4.2, [5, -5, 6], [8, 0.5])
  strip(0x00e08a, 4.6, [-5, 6, 5], [7, 0.7])
  strip(0x00e08a, 2.4, [10, 5, -3], [5, 5])
  // soft greys: the body of the metal between the bright bands
  strip(0x3a4c8c, 0.7, [0, 0, 12], [30, 16])
  strip(0xf2f8ff, 5, [-3, 2, 11], [0.5, 14])
  strip(0x16b4ff, 4, [3.5, -1, 11], [0.9, 14])
  strip(0x00e08a, 3.2, [7.5, 1, 9.5], [0.6, 12])
  strip(0x5a6480, 0.55, [0, -10, 0], [30, 30])
  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(env, 0.035).texture
  pmrem.dispose()
  geo.dispose()
  mats.forEach((m) => m.dispose())
  return tex
}

function buildMaterial(time: { value: number }) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.3,
  })
  // The logo's own finish: royal-blue metal that runs to sky, space white and green, with the
  // diagonal light bands of the original artwork travelling slowly across the faces.
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = time
    sh.uniforms.uEmis = emis
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMp = position;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMp; uniform float uT; uniform float uEmis;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
      float gx = clamp(vMp.x / ${MARK_W.toFixed(1)} + 0.5, 0.0, 1.0);
      vec3 tint = mix(vec3(0.07, 0.2, 1.0), vec3(0.1, 0.62, 1.0), smoothstep(0.0, 0.45, gx));
      tint = mix(tint, vec3(0.78, 0.9, 1.0), smoothstep(0.42, 0.66, gx));
      tint = mix(tint, vec3(0.3, 1.0, 0.5), smoothstep(0.68, 1.0, gx));
      diffuseColor.rgb *= mix(vec3(0.62, 0.66, 0.74), tint, 0.8);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
      float bd = vMp.x * 0.9 - vMp.y * 1.5;
      float b1 = pow(0.5 + 0.5 * sin(bd * 1.55 - uT * 0.55), 14.0);
      float b2 = pow(0.5 + 0.5 * sin(bd * 0.8 + uT * 0.32 + 2.0), 26.0);
      float gxe = clamp(vMp.x / ${MARK_W.toFixed(1)} + 0.5, 0.0, 1.0);
      vec3 bc = mix(vec3(0.25, 0.7, 1.0), vec3(0.85, 0.95, 1.0), b2);
      bc = mix(bc, vec3(0.55, 1.0, 0.7), smoothstep(0.62, 1.0, gxe) * 0.7);
      totalEmissiveRadiance += bc * (b1 * 0.55 + b2 * 0.9) * step(0.5, abs(normal.z)) * uEmis;`,
      )
  }
  return m
}
const emis = { value: 0 }

/** 0..1 intro after the loader, 0..1 scroll through the hero — mutated by the caller */
export type DomeState = { intro: number; scroll: number }
export type DomeHero = { dispose: () => void }

/** Returns null when WebGL is unavailable — the caller shows the static poster instead. */
export function createDomeHero(host: HTMLElement, state: DomeState, opts: { reduce?: boolean; onLost?: () => void } = {}): DomeHero | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false })
  } catch {
    return null
  }
  const canvas = renderer.domElement
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block' })
  host.appendChild(canvas)
  renderer.setClearColor(0x030408, 1)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const maxPR = Math.min(window.devicePixelRatio || 1, 1.5)
  let pr = maxPR
  renderer.setPixelRatio(pr)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120)
  camera.position.set(0, 0, 10)

  const uniforms = {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uRes: { value: new THREE.Vector2(1, 1) },
  }
  const domeGeo = new THREE.SphereGeometry(60, 48, 32)
  const domeMat = new THREE.ShaderMaterial({ vertexShader: DOME_VERT, fragmentShader: DOME_FRAG, uniforms, side: THREE.BackSide, depthWrite: false, depthTest: false, toneMapped: false })
  const dome = new THREE.Mesh(domeGeo, domeMat)
  dome.frustumCulled = false
  dome.renderOrder = -1
  scene.add(dome)

  const envTex = buildEnv(renderer)
  scene.environment = envTex
  const markGeo = buildMark()
  const markMat = buildMaterial(uniforms.uTime)
  const logo = new THREE.Mesh(markGeo, markMat)
  const rig = new THREE.Group()
  rig.add(logo)
  scene.add(rig)

  const size = { w: 1, h: 1 }
  let fit = 1
  let restY = 0
  const resize = () => {
    const r = host.getBoundingClientRect()
    size.w = Math.max(1, r.width)
    size.h = Math.max(1, r.height)
    renderer.setPixelRatio(pr)
    renderer.setSize(size.w, size.h, false)
    uniforms.uRes.value.set(size.w * pr, size.h * pr)
    camera.aspect = size.w / size.h
    camera.updateProjectionMatrix()
    // fit the mark to the frame: wide on phones, restrained on desktop, clear of the headline
    const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    const vw = vh * camera.aspect
    const land = camera.aspect > 1.05
    fit = Math.min((vw * (land ? 0.46 : 0.8)) / MARK_W, (vh * 0.3) / (MARK_W * 0.366))
    restY = vh * (land ? 0.13 : 0.15)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '60px' })
  io.observe(host)

  let lost = false
  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    opts.onLost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  const speed = opts.reduce ? 0.35 : 1
  let raf = 0
  let last = performance.now()
  let slow = 0
  let frames = 0
  const mouse = new THREE.Vector2()
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const raw = now - last
    last = now
    if (!visible || document.hidden || lost) return
    const dt = Math.min(raw, 50) / 1000

    // adaptive resolution: if the device can't hold ~45fps, trade pixels for smoothness
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

    uniforms.uTime.value += dt * speed
    const t = uniforms.uTime.value
    if (pointer.px || pointer.py) {
      mouse.x += (pointer.x - mouse.x) * 0.045
      mouse.y += (pointer.y - mouse.y) * 0.045
    }
    uniforms.uMouse.value.copy(mouse)
    uniforms.uIntro.value = state.intro
    uniforms.uScroll.value = state.scroll

    const i = state.intro
    const s = state.scroll
    const e = 1 - Math.pow(1 - i, 3)
    rig.scale.setScalar(fit * (0.72 + 0.28 * e) * (1 + s * 0.5))
    rig.position.set(0, restY + Math.sin(t * 0.6) * 0.05 + s * 0.6, (1 - e) * -6)
    rig.rotation.y = mouse.x * 0.3 + Math.sin(t * 0.33) * 0.1 + (1 - e) * -1.1 + s * 0.5
    rig.rotation.x = -mouse.y * 0.16 + Math.sin(t * 0.27) * 0.05 - s * 0.25
    logo.visible = i > 0.002
    markMat.envMapIntensity = 1.3 * e * (1 - s * 0.7)
    emis.value = e * (1 - s * 0.7)
    // the baked light rig turns slowly: highlights sweep across the chrome for free
    scene.environmentRotation.set(Math.sin(t * 0.21) * 0.22, t * 0.2 + mouse.x * 0.5, 0)
    dome.rotation.set(mouse.y * 0.03, -mouse.x * 0.045, Math.sin(t * 0.05) * 0.06)

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      domeGeo.dispose()
      domeMat.dispose()
      markGeo.dispose()
      markMat.dispose()
      envTex.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
