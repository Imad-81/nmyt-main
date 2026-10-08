/**
 * NMYT home hero.
 * Deep space, the chrome NMYT mark at the centre, and embers in the brand's three lights
 * (space white, blue, green) drifting across. The pointer turns the mark and parts the embers.
 *
 * Plain three.js (no React renderer): three draw calls in total. Resolution adapts to the
 * device's real frame time, and the loop sleeps off-screen.
 */
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { pointer } from '@/lib/hooks'
import mark from './nmyt-mark.json'

const MARK_W = 6 // world width of the mark
const ENV_I = 0.6 // the light rig is bright; this keeps the faces inside the tone curve

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

float hash2(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main(){
  vec3 d = normalize(vDir);
  // deep space: near-black navy, a slow royal breath behind the mark, a faint green counter-light
  vec2 c = d.xy / max(-d.z, 0.2) - uMouse * 0.03;
  float r = length(c * vec2(0.8, 1.15));
  vec3 col = vec3(0.0, 0.006, 0.012);
  // a deep teal core behind the mark, royal blue to one side, green to the other
  col += vec3(0.0, 0.05, 0.095) * exp(-r * r * 2.0) * (0.9 + 0.1 * sin(uTime * 0.4)) * uIntro;
  col += vec3(0.02, 0.1, 0.62) * exp(-pow(length(c + vec2(0.62, -0.18)) * 1.5, 2.0)) * 0.11 * uIntro;
  col += vec3(0.0, 0.3, 0.3) * exp(-pow(length(c - vec2(0.62, -0.26)) * 1.6, 2.0)) * 0.1 * uIntro;
  col += vec3(0.0, 0.1, 0.14) * exp(-pow((c.y + 0.75) * 1.6, 2.0)) * 0.3 * uIntro;
  vec2 sp = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  col *= mix(0.55, 1.0, smoothstep(1.2, 0.2, length(sp * vec2(0.85, 1.1))));
  col *= 1.0 - uScroll * 0.7;
  col += (hash2(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`

// The volume: a curved wall behind the mark, like the LED stage a film crew shoots against.
// It plays a clip, but never as a rectangle: the picture is bent round the arc, its edges
// dissolve into the dark, and two copies half a loop apart cross-dissolve so it never jumps.
const WALL_R = 26
const WALL_ARC = (150 * Math.PI) / 180
const WALL_H = 34

const WALL_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const WALL_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVidA; uniform sampler2D uVidB;
uniform float uMix; uniform float uVol; uniform float uIntro; uniform float uScroll; uniform float uTime;
float hash2(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  // seen from inside the arc, so u runs right to left
  vec2 uv = vec2(1.0 - vUv.x, vUv.y);
  vec3 col = mix(texture2D(uVidB, uv).rgb, texture2D(uVidA, uv).rgb, uMix);
  // settle the footage into the scene's own blacks and blues
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 1.1);
  // deep and low: the wall is the room, not the subject. Its blue leans to teal and indigo so
  // the mark's royal blue stays the brightest, purest colour in the frame.
  col = pow(max(col - 0.03, 0.0), vec3(1.55)) * vec3(0.25, 0.53, 0.64);
  float m = smoothstep(0.0, 0.3, uv.x) * smoothstep(1.0, 0.7, uv.x) * smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.66, uv.y);
  // a pool of shadow where the mark stands
  m *= mix(0.3, 1.0, smoothstep(0.05, 0.42, length((uv - vec2(0.5, 0.54)) * vec2(1.5, 2.3))));
  col *= m * uVol * uIntro * (1.0 - uScroll * 0.75);
  col += (hash2(gl_FragCoord.xy + fract(uTime) * 37.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`

const EMBER_VERT = /* glsl */ `
attribute vec4 aRand;
uniform float uTime; uniform float uPR; uniform float uIntro; uniform float uScroll;
uniform vec2 uMouseW;
varying vec3 vCol; varying float vA;
void main(){
  vec3 p = position;
  // three streams, three directions: white falls from the upper left, blue rises from below,
  // green sweeps in from the right
  float grp = floor(aRand.x * 2.999);
  vec2 dir = grp < 0.5 ? vec2(0.8, -0.6) : (grp < 1.5 ? vec2(0.16, 0.99) : vec2(-0.92, 0.38));
  float pace = 0.55 + aRand.y * 1.25;
  p.xy += dir * uTime * pace;
  p.x = mod(p.x + 20.0, 40.0) - 20.0;
  p.y = mod(p.y + 11.0, 22.0) - 11.0;
  // embers flutter across their own path
  vec2 side = vec2(-dir.y, dir.x);
  p.xy += side * sin(uTime * (0.7 + aRand.w * 1.4) + aRand.z * 6.283) * 0.35;
  // the pointer parts them gently
  vec2 d = p.xy - uMouseW; float dl = length(d);
  p.xy += (d / max(dl, 1e-3)) * smoothstep(3.2, 0.0, dl) * 0.9;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (2.4 + aRand.z * aRand.z * 9.0) * uPR * (11.0 / -mv.z);
  vec3 white = vec3(0.9, 0.97, 1.0);
  vec3 blue = mix(vec3(0.1, 0.3, 1.0), vec3(0.1, 0.75, 1.0), aRand.w);
  vec3 green = mix(vec3(0.0, 0.95, 0.6), vec3(0.5, 1.0, 0.3), aRand.w);
  vCol = grp < 0.5 ? white : (grp < 1.5 ? blue : green);
  float tw = 0.55 + 0.45 * sin(uTime * (0.8 + aRand.w * 2.2) + aRand.x * 40.0);
  // fade at the wrap edges so nothing pops in or out
  float edge = smoothstep(20.0, 16.0, abs(p.x)) * smoothstep(11.0, 8.5, abs(p.y));
  vA = tw * edge * (0.5 + 0.5 * aRand.z) * uIntro * (1.0 - uScroll * 0.8);
}`

const EMBER_FRAG = /* glsl */ `
varying vec3 vCol; varying float vA;
void main(){
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, r);
  float a = (pow(glow, 2.0) + pow(glow, 7.0) * 1.2) * vA;
  gl_FragColor = vec4(vCol * a, a);
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
  strip(0xdcecff, 6, [0, 6, 8], [16, 0.5])
  strip(0xdcecff, 4.5, [7, 3, 6], [0.4, 9])
  strip(0xcfefff, 4.5, [-8, -2, 5], [0.5, 10])
  // blues
  strip(0x1638ff, 7, [-9, 3, 1], [9, 3.2])
  strip(0x16b4ff, 6, [9, -1, 2], [8, 1.1])
  strip(0x16b4ff, 4, [0, -7, 5], [14, 0.6])
  strip(0x1638ff, 3, [2, 2, -10], [18, 6])
  // greens
  strip(0x16b4ff, 4.2, [5, -5, 6], [8, 0.5])
  strip(0x1e5bff, 3.4, [9, 0, 8], [1.2, 12])
  strip(0x9fe6ff, 4.6, [-5, 6, 5], [7, 0.7])
  strip(0x1638ff, 2.4, [10, 5, -3], [5, 5])
  // soft greys: the body of the metal between the bright bands
  strip(0x1230a0, 0.45, [0, 0, 12], [30, 16])
  strip(0xdcecff, 4, [-3, 2, 11], [0.5, 14])
  strip(0x16b4ff, 4, [3.5, -1, 11], [0.9, 14])
  strip(0x16b4ff, 3.2, [7.5, 1, 9.5], [0.6, 12])
  strip(0x5a6480, 0.55, [0, -10, 0], [30, 30])
  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(env, 0.035).texture
  pmrem.dispose()
  geo.dispose()
  mats.forEach((m) => m.dispose())
  return tex
}

type VolumeUniforms = { uVidA: { value: THREE.Texture | null }; uVidB: { value: THREE.Texture | null }; uMix: { value: number }; uVol: { value: number } }

function buildMaterial(time: { value: number }, vol: VolumeUniforms) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  })
  // The logo's own finish: royal-blue metal that runs to sky, space white and green, with the
  // diagonal light bands of the original artwork travelling slowly across the faces.
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = time
    sh.uniforms.uEmis = emis
    sh.uniforms.uVidA = vol.uVidA
    sh.uniforms.uVidB = vol.uVidB
    sh.uniforms.uMix = vol.uMix
    sh.uniforms.uVol = vol.uVol
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMp; varying float vFace;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMp = position; vFace = step(0.9, abs(normal.z));')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMp; varying float vFace; uniform float uT; uniform float uEmis;\nuniform sampler2D uVidA; uniform sampler2D uVidB; uniform float uMix; uniform float uVol;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
      float gx = clamp(vMp.x / ${MARK_W.toFixed(1)} + 0.5, 0.0, 1.0);
      vec3 tint = mix(vec3(0.02, 0.1, 0.78), vec3(0.04, 0.24, 1.0), smoothstep(0.0, 0.55, gx));
      tint = mix(tint, vec3(0.06, 0.36, 1.0), smoothstep(0.55, 1.0, gx));
      diffuseColor.rgb *= mix(vec3(0.3, 0.45, 0.8), tint, 0.92);`,
      )
      // the big flat faces can only mirror one direction: soften them so they hold a sheen, not a flash
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.46, vFace);')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
      float bd = vMp.x * 0.9 - vMp.y * 1.5;
      float b1 = pow(0.5 + 0.5 * sin(bd * 1.55 - uT * 0.55), 10.0);
      float b2 = pow(0.5 + 0.5 * sin(bd * 0.8 + uT * 0.32 + 2.0), 22.0);
      // brushed metal: broad navy-to-royal bands on the diagonal, then two bright streaks that travel
      float band = 0.5 + 0.5 * sin(bd * 1.15 + 0.4);
      float shade = 0.26 + 0.66 * band * band + 0.08 * (vMp.y / ${(MARK_W * 0.183).toFixed(2)});
      vec3 streak = mix(vec3(0.1, 0.62, 1.0), vec3(0.78, 0.94, 1.0), b2);
      vec3 faceCol = tint * shade + streak * (b1 * 0.75 + b2 * 1.0);
      totalEmissiveRadiance += faceCol * vFace * uEmis + tint * 0.06 * (1.0 - vFace) * uEmis;`,
      )
      .replace(
        '#include <opaque_fragment>',
        `outgoingLight = mix(outgoingLight, (outgoingLight - totalEmissiveRadiance) * 0.18 + totalEmissiveRadiance, vFace);
      // the volume lights the metal: the wall's picture wraps the stage and shows in the chrome
      vec3 vr = inverseTransformDirection(reflect(-normalize(vViewPosition), normal), viewMatrix);
      vec2 vuv = vec2(abs(atan(vr.x, vr.z)) / 3.14159, clamp(0.5 + vr.y * 0.6, 0.0, 1.0));
      vec3 vcol = pow(mix(texture2D(uVidB, vuv).rgb, texture2D(uVidA, vuv).rgb, uMix), vec3(2.2));
      outgoingLight += vcol * vec3(0.5, 0.9, 1.1) * uVol * uEmis * mix(0.9, 0.03, vFace);
      #include <opaque_fragment>`,
      )
  }
  return m
}
const emis = { value: 0 }

/** 0..1 intro after the loader, 0..1 scroll through the hero — mutated by the caller */
export type DomeState = { intro: number; scroll: number }
export type DomeHero = { dispose: () => void }

/** Returns null when WebGL is unavailable — the caller shows the static poster instead. */
export function createDomeHero(host: HTMLElement, state: DomeState, opts: { reduce?: boolean; onLost?: () => void; volume?: string } = {}): DomeHero | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false })
  } catch {
    return null
  }
  const canvas = renderer.domElement
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block' })
  host.appendChild(canvas)
  renderer.setClearColor(0x000204, 1)
  // neutral tone mapping keeps the blues blue (ACES skews saturated blue toward purple)
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0

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

  // embers
  const EMBERS = window.matchMedia('(max-width: 767px)').matches ? 520 : 1200
  const ePos = new Float32Array(EMBERS * 3)
  const eRnd = new Float32Array(EMBERS * 4)
  for (let i = 0; i < EMBERS; i++) {
    ePos[i * 3] = (Math.random() - 0.5) * 40
    ePos[i * 3 + 1] = (Math.random() - 0.5) * 22
    ePos[i * 3 + 2] = -14 + Math.random() * 19
    for (let k = 0; k < 4; k++) eRnd[i * 4 + k] = Math.random()
  }
  const emberGeo = new THREE.BufferGeometry()
  emberGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3))
  emberGeo.setAttribute('aRand', new THREE.BufferAttribute(eRnd, 4))
  const emberU = { uTime: uniforms.uTime, uIntro: uniforms.uIntro, uScroll: uniforms.uScroll, uPR: { value: pr }, uMouseW: { value: new THREE.Vector2(99, 99) } }
  const emberMat = new THREE.ShaderMaterial({ vertexShader: EMBER_VERT, fragmentShader: EMBER_FRAG, uniforms: emberU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
  const embers = new THREE.Points(emberGeo, emberMat)
  embers.frustumCulled = false
  scene.add(embers)

  // the volume wall. Until its clip is playing the wall adds nothing, and the scene looks as it did.
  const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
  black.needsUpdate = true
  const volU: VolumeUniforms = { uVidA: { value: black }, uVidB: { value: black }, uMix: { value: 1 }, uVol: { value: 0 } }
  const wallGeo = new THREE.CylinderGeometry(WALL_R, WALL_R, WALL_H, 64, 1, true, Math.PI - WALL_ARC / 2, WALL_ARC)
  const wallMat = new THREE.ShaderMaterial({
    vertexShader: WALL_VERT,
    fragmentShader: WALL_FRAG,
    uniforms: { ...volU, uIntro: uniforms.uIntro, uScroll: uniforms.uScroll, uTime: uniforms.uTime },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })
  const wall = new THREE.Mesh(wallGeo, wallMat)
  wall.position.set(0, 1.2, 4)
  wall.frustumCulled = false
  wall.renderOrder = -0.5
  scene.add(wall)

  const vids: HTMLVideoElement[] = []
  const vidTex: THREE.VideoTexture[] = []
  let volOn = 0
  if (opts.volume) {
    for (let k = 0; k < 2; k++) {
      const v = document.createElement('video')
      v.src = opts.volume
      v.muted = true
      v.loop = true
      v.playsInline = true
      v.preload = 'auto'
      v.setAttribute('aria-hidden', 'true')
      vids.push(v)
    }
    const [a, b] = vids
    const start = () => {
      if (vidTex.length || !a.duration || !b.duration) return
      // the second copy runs half a loop ahead, so one is always mid-clip while the other wraps
      b.currentTime = a.duration / 2
      Promise.all([a.play(), b.play()])
        .then(() => {
          for (const v of vids) {
            const t = new THREE.VideoTexture(v)
            t.minFilter = THREE.LinearFilter
            t.generateMipmaps = false
            vidTex.push(t)
          }
          volU.uVidA.value = vidTex[0]
          volU.uVidB.value = vidTex[1]
          volOn = 1
        })
        .catch(() => {})
    }
    a.addEventListener('loadeddata', start)
    b.addEventListener('loadeddata', start)
    a.load()
    b.load()
  }

  const envTex = buildEnv(renderer)
  scene.environment = envTex
  const markGeo = buildMark()
  const markMat = buildMaterial(uniforms.uTime, volU)
  const logo = new THREE.Mesh(markGeo, markMat)
  const rig = new THREE.Group()
  rig.add(logo)
  scene.add(rig)

  const size = { w: 1, h: 1 }
  let fit = 1
  const view = { w: 1, h: 1 }
  let restY = 0
  const resize = () => {
    const r = host.getBoundingClientRect()
    size.w = Math.max(1, r.width)
    size.h = Math.max(1, r.height)
    renderer.setPixelRatio(pr)
    renderer.setSize(size.w, size.h, false)
    uniforms.uRes.value.set(size.w * pr, size.h * pr)
    emberU.uPR.value = pr
    camera.aspect = size.w / size.h
    camera.updateProjectionMatrix()
    // fit the mark to the frame: wide on phones, restrained on desktop, clear of the headline
    const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    const vw = vh * camera.aspect
    const land = camera.aspect > 1.05
    fit = Math.min((vw * (land ? 0.46 : 0.8)) / MARK_W, (vh * 0.3) / (MARK_W * 0.366))
    restY = vh * 0.1
    view.w = vw
    view.h = vh
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
    emberU.uMouseW.value.set((mouse.x * view.w) / 2, (mouse.y * view.h) / 2)
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
    // (with scene.environment, intensity lives on the scene, not the material)
    scene.environmentIntensity = ENV_I * e * (1 - s * 0.7)
    emis.value = e * (1 - s * 0.7)
    // the baked light rig turns slowly: highlights sweep across the chrome for free
    scene.environmentRotation.set(Math.sin(t * 0.21) * 0.22, t * 0.2 + mouse.x * 0.5, 0)
    dome.rotation.set(mouse.y * 0.03, -mouse.x * 0.045, Math.sin(t * 0.05) * 0.06)

    // the volume: ease it in once the clip plays, cross-dissolve the two copies around each wrap,
    // and let the camera drift a little so the wall sits at a real distance behind the mark
    volU.uVol.value += (volOn - volU.uVol.value) * Math.min(1, dt * 0.9)
    if (volOn) {
      const [a, b] = vids
      const d = a.duration || 1
      const wa = Math.min(a.currentTime, d - a.currentTime)
      const wb = Math.min(b.currentTime, d - b.currentTime)
      const m = wa / Math.max(wa + wb, 1e-4)
      volU.uMix.value = m * m * (3 - 2 * m)
    }
    camera.position.x = mouse.x * 0.5 + Math.sin(t * 0.11) * 0.18
    camera.position.y = mouse.y * 0.22
    camera.lookAt(0, 0, -6)

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      emberGeo.dispose()
      emberMat.dispose()
      domeGeo.dispose()
      domeMat.dispose()
      markGeo.dispose()
      markMat.dispose()
      envTex.dispose()
      wallGeo.dispose()
      wallMat.dispose()
      black.dispose()
      vidTex.forEach((t) => t.dispose())
      vids.forEach((v) => {
        v.pause()
        v.removeAttribute('src')
        v.load()
      })
      renderer.dispose()
      canvas.remove()
    },
  }
}
