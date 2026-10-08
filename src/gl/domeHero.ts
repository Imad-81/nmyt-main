/**
 * NMYT home hero.
 * The real NMYT logo, standing above a field of digital pixels that rolls away to a horizon.
 * Everything is drawn live: no footage. The pointer tilts the logo, moves the light across
 * its metal and presses a ripple into the field; a click or tap sends a pulse out from the logo.
 *
 * Plain three.js (no React renderer): five draw calls. Resolution adapts to the device's real
 * frame time, and the loop sleeps off-screen.
 */
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { pointer } from '@/lib/hooks'
import mark from './nmyt-mark.json'

const MARK_W = 6 // world width of the logo
const ART = '/brand/nmyt-logo-hq.webp' // the logo artwork itself, used untouched on the face
const ART_ASPECT = 575 / 1545
const FLOOR_Y = -3.1

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
  // deep space: near-black navy with a slow breath of the logo's blue behind it
  vec2 c = d.xy / max(-d.z, 0.2) - uMouse * 0.03;
  float r = length(c * vec2(0.8, 1.15));
  vec3 col = vec3(0.0, 0.005, 0.014);
  col += vec3(0.0, 0.035, 0.13) * exp(-r * r * 2.2) * (0.9 + 0.1 * sin(uTime * 0.4)) * uIntro;
  col += vec3(0.02, 0.1, 0.62) * exp(-pow(length(c + vec2(0.62, -0.18)) * 1.5, 2.0)) * 0.1 * uIntro;
  col += vec3(0.0, 0.26, 0.3) * exp(-pow(length(c - vec2(0.62, -0.26)) * 1.6, 2.0)) * 0.08 * uIntro;
  // the horizon: where the field ends, light gathers
  float hz = c.y + 0.058;
  col += vec3(0.03, 0.2, 0.9) * exp(-hz * hz * 420.0) * exp(-c.x * c.x * 0.9) * 0.3 * uIntro;
  col += vec3(0.02, 0.1, 0.5) * exp(-hz * hz * 34.0) * exp(-c.x * c.x * 0.7) * 0.06 * uIntro;
  vec2 sp = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  col *= mix(0.55, 1.0, smoothstep(1.2, 0.2, length(sp * vec2(0.85, 1.1))));
  col *= 1.0 - uScroll * 0.7;
  col += (hash2(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`

// The field: a plane of square pixels. Waves pass through it, the pointer presses a ripple
// into it, and a pulse can travel out from under the logo.
const FIELD_VERT = /* glsl */ `
attribute float aSeed;
uniform float uTime; uniform float uPR; uniform float uIntro; uniform float uScroll;
uniform vec3 uHit;      // x, z of the pointer on the field, strength
uniform float uPulse;   // seconds since the last pulse
uniform float uPortrait;
varying vec3 vCol; varying float vA;
void main(){
  vec3 p = position;
  float t = uTime;
  float h = sin(p.x * 0.33 + t * 0.55) * 0.26
          + sin(p.z * 0.46 - t * 0.85 + p.x * 0.12) * 0.3
          + sin((p.x + p.z) * 0.9 + t * 1.25) * 0.07;
  float lift = 0.0;
  // the pointer: a soft dome with a ring running out of it
  float d = length(p.xz - uHit.xy);
  float near = exp(-d * d * 0.07) * uHit.z;
  h += near * 0.75 + sin(d * 1.5 - t * 4.2) * exp(-d * 0.3) * 0.22 * uHit.z;
  lift += near * 1.3;
  // the pulse: one ring leaving the logo's footprint
  float d0 = length(p.xz - vec2(0.0, -3.0));
  float ring = exp(-pow(d0 - uPulse * 15.0, 2.0) * 0.16) * exp(-uPulse * 0.9) * step(0.0, uPulse);
  h += ring * 0.85;
  lift += ring * 1.6;
  // light pooled under the logo
  float pool = exp(-(p.x * p.x * 0.018 + (p.z + 3.0) * (p.z + 3.0) * 0.03));
  p.y += h;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.0, (0.55 + aSeed * 0.6) * uPR * 84.0 / -mv.z);
  float crest = smoothstep(-0.35, 0.6, h);
  vec3 col = mix(vec3(0.03, 0.12, 0.85), vec3(0.08, 0.5, 1.0), crest);
  col = mix(col, vec3(0.0, 0.78, 0.72), smoothstep(6.0, 30.0, p.x) * 0.55);
  col = mix(col, vec3(0.82, 0.94, 1.0), clamp(lift * 0.45 + smoothstep(0.45, 0.8, h) * 0.5, 0.0, 1.0));
  vCol = col;
  float tw = 0.72 + 0.28 * sin(t * (0.7 + aSeed * 2.0) + aSeed * 40.0);
  float fade = smoothstep(-47.0, -24.0, position.z) * smoothstep(7.0, 2.5, position.z) * smoothstep(1.0, 0.72, abs(position.x) / 36.0);
  // keep the field quiet where the words sit
  vec2 ndc = gl_Position.xy / gl_Position.w;
  float land = mix(0.2, 1.0, max(smoothstep(-0.5, 0.1, ndc.x), smoothstep(-0.5, -0.12, ndc.y)));
  float port = mix(0.14, 1.0, smoothstep(-0.5, -0.2, ndc.y));
  float quiet = mix(land, port, uPortrait);
  vA = (0.42 + crest * 0.5 + pool * 0.6 + lift * 0.8) * tw * fade * quiet * uIntro * (1.0 - uScroll * 0.85);
}`

const FIELD_FRAG = /* glsl */ `
varying vec3 vCol; varying float vA;
void main(){
  // a square pixel with a slightly soft rim
  vec2 q = abs(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.72, max(q.x, q.y)) * vA;
  gl_FragColor = vec4(vCol * a, a);
}`

// Loose pixels drifting through the air, in the logo's blues.
const DUST_VERT = /* glsl */ `
attribute vec4 aRand;
uniform float uTime; uniform float uPR; uniform float uIntro; uniform float uScroll;
uniform vec2 uMouseW;
varying vec3 vCol; varying float vA;
void main(){
  vec3 p = position;
  float pace = 0.25 + aRand.y * 0.6;
  p.y += uTime * pace;
  p.x += sin(uTime * (0.3 + aRand.w * 0.5) + aRand.z * 6.283) * 0.5;
  p.y = mod(p.y + 9.0, 18.0) - 9.0;
  vec2 d = p.xy - uMouseW; float dl = length(d);
  p.xy += (d / max(dl, 1e-3)) * smoothstep(3.0, 0.0, dl) * 0.8;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.0, (1.4 + aRand.z * aRand.z * 4.5) * uPR * (11.0 / -mv.z));
  vCol = mix(vec3(0.1, 0.34, 1.0), vec3(0.75, 0.92, 1.0), aRand.w * aRand.w);
  float tw = 0.5 + 0.5 * sin(uTime * (0.8 + aRand.w * 2.2) + aRand.x * 40.0);
  float edge = smoothstep(9.0, 6.5, abs(p.y)) * smoothstep(20.0, 15.0, abs(p.x));
  vA = tw * edge * (0.35 + 0.5 * aRand.z) * uIntro * (1.0 - uScroll * 0.8);
}`

// The logo's face: the artwork exactly as drawn, plus light travelling across the metal.
const FACE_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const FACE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uArt;
uniform float uTime; uniform float uShow; uniform float uScroll; uniform float uFlash;
uniform vec2 uPtr;
void main(){
  vec4 art = texture2D(uArt, vUv);
  // the artwork's own bands run across the strokes on this diagonal
  float s = vUv.x / ${ART_ASPECT.toFixed(4)} + vUv.y;
  float sweep = mod(uTime * 0.42, 7.0) - 1.6;
  float g = exp(-pow((s - sweep) / 0.2, 2.0));
  // a second light that follows the pointer
  float pg = exp(-pow((s - (1.85 + uPtr.x * 1.5 - uPtr.y * 0.4)) / 0.34, 2.0));
  vec3 col = art.rgb * (1.0 + g * 1.15 + pg * 0.5 + uFlash * 0.6);
  col += vec3(0.55, 0.82, 1.0) * (g * 0.1 + uFlash * 0.05) * art.a;
  col *= 1.0 - uScroll * 0.6;
  gl_FragColor = vec4(col, art.a * uShow);
}`

/** The logo's outline as a solid body, so it has real depth when it turns. */
function buildBody() {
  const d = (mark as { parts: string[] }).parts.join(' ')
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`)
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p))
  const geos = shapes.map((s) => new THREE.ExtrudeGeometry(s, { depth: 46, bevelEnabled: false, curveSegments: 18 }))
  const g = mergeGeometries(geos, false)!
  geos.forEach((x) => x.dispose())
  g.computeBoundingBox()
  const bb = g.boundingBox!
  g.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -bb.min.z)
  // a hair smaller than the artwork so the body never shows round the face
  const s = (MARK_W * 0.992) / (bb.max.x - bb.min.x)
  // SVG is y-down: turning 180° about X keeps it upright and un-mirrored
  g.scale(s, -s * ((MARK_W * ART_ASPECT * 0.992) / ((bb.max.y - bb.min.y) * s)), -s)
  g.computeVertexNormals()
  return g
}

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
  renderer.setClearColor(0x000204, 1)
  renderer.toneMapping = THREE.NoToneMapping

  const small = window.matchMedia('(max-width: 767px)').matches
  const maxPR = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.5)
  let pr = maxPR
  renderer.setPixelRatio(pr)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 140)
  camera.position.set(0, 0, 10)

  const uniforms = {
    uTime: { value: 0 },
    uIntro: { value: 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uRes: { value: new THREE.Vector2(1, 1) },
  }
  const uPR = { value: pr }

  const domeGeo = new THREE.SphereGeometry(60, 48, 32)
  const domeMat = new THREE.ShaderMaterial({ vertexShader: DOME_VERT, fragmentShader: DOME_FRAG, uniforms, side: THREE.BackSide, depthWrite: false, depthTest: false })
  const dome = new THREE.Mesh(domeGeo, domeMat)
  dome.frustumCulled = false
  dome.renderOrder = -1
  scene.add(dome)

  // the field. Rows bunch up near the viewer and spread toward the horizon, so far rows
  // do not crowd into shimmer.
  const NX = small ? 64 : 150
  const NZ = small ? 84 : 104
  const HALF = small ? 15 : 36
  const fPos = new Float32Array(NX * NZ * 3)
  const fSeed = new Float32Array(NX * NZ)
  for (let j = 0, n = 0; j < NZ; j++) {
    const z = 6.5 - 53 * Math.pow(j / (NZ - 1), 1.55)
    for (let i = 0; i < NX; i++, n++) {
      fPos[n * 3] = (i / (NX - 1) - 0.5) * 2 * HALF
      fPos[n * 3 + 1] = FLOOR_Y
      fPos[n * 3 + 2] = z
      fSeed[n] = Math.random()
    }
  }
  const fieldGeo = new THREE.BufferGeometry()
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3))
  fieldGeo.setAttribute('aSeed', new THREE.BufferAttribute(fSeed, 1))
  const fieldU = {
    uTime: uniforms.uTime,
    uIntro: uniforms.uIntro,
    uScroll: uniforms.uScroll,
    uPR,
    uHit: { value: new THREE.Vector3(0, -8, 0) },
    uPulse: { value: -1 },
    uPortrait: { value: 0 },
  }
  const fieldMat = new THREE.ShaderMaterial({ vertexShader: FIELD_VERT, fragmentShader: FIELD_FRAG, uniforms: fieldU, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })
  const field = new THREE.Points(fieldGeo, fieldMat)
  field.frustumCulled = false
  field.renderOrder = -0.5
  scene.add(field)

  // loose pixels in the air
  const DUST = small ? 240 : 520
  const dPos = new Float32Array(DUST * 3)
  const dRnd = new Float32Array(DUST * 4)
  for (let i = 0; i < DUST; i++) {
    dPos[i * 3] = (Math.random() - 0.5) * 40
    dPos[i * 3 + 1] = (Math.random() - 0.5) * 18
    dPos[i * 3 + 2] = -14 + Math.random() * 19
    for (let k = 0; k < 4; k++) dRnd[i * 4 + k] = Math.random()
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
  dustGeo.setAttribute('aRand', new THREE.BufferAttribute(dRnd, 4))
  const dustU = { uTime: uniforms.uTime, uIntro: uniforms.uIntro, uScroll: uniforms.uScroll, uPR, uMouseW: { value: new THREE.Vector2(99, 99) } }
  const dustMat = new THREE.ShaderMaterial({ vertexShader: DUST_VERT, fragmentShader: FIELD_FRAG, uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  const dust = new THREE.Points(dustGeo, dustMat)
  dust.frustumCulled = false
  scene.add(dust)

  // the logo: a navy body for depth, and the artwork itself on its face
  const bodyGeo = buildBody()
  const bodyMat = new THREE.ShaderMaterial({
    uniforms: { uShow: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `varying vec3 vN; uniform float uShow; void main(){
      // the sides: deep navy metal with a thin blue rim, like the artwork's own edge
      float rim = pow(1.0 - abs(normalize(vN).z), 2.0);
      vec3 col = mix(vec3(0.0, 0.02, 0.11), vec3(0.03, 0.2, 0.85), rim * 0.75) * uShow;
      gl_FragColor = vec4(col, 1.0);
    }`,
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  const faceGeo = new THREE.PlaneGeometry(MARK_W, MARK_W * ART_ASPECT)
  const faceU = { uArt: { value: null as THREE.Texture | null }, uTime: uniforms.uTime, uShow: { value: 0 }, uScroll: uniforms.uScroll, uFlash: { value: 0 }, uPtr: { value: new THREE.Vector2() } }
  const faceMat = new THREE.ShaderMaterial({ vertexShader: FACE_VERT, fragmentShader: FACE_FRAG, uniforms: faceU, transparent: true, depthWrite: false })
  const face = new THREE.Mesh(faceGeo, faceMat)
  face.position.z = 0.004
  face.renderOrder = 1
  const rig = new THREE.Group()
  rig.add(body, face)
  rig.visible = false
  scene.add(rig)

  let art: THREE.Texture | null = null
  let disposed = false
  new THREE.TextureLoader().load(ART, (t) => {
    if (disposed) return t.dispose()
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.magFilter = THREE.LinearFilter
    t.generateMipmaps = true
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    t.needsUpdate = true
    art = t
    faceU.uArt.value = t
    rig.visible = true
  })

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
    uPR.value = pr * (size.h / 760)
    camera.aspect = size.w / size.h
    camera.updateProjectionMatrix()
    // fit the logo to the frame: wide on phones, restrained on desktop, clear of the words
    const vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    const vw = vh * camera.aspect
    const land = camera.aspect > 1.05
    fit = Math.min((vw * (land ? 0.46 : 0.76)) / MARK_W, (vh * 0.3) / (MARK_W * ART_ASPECT))
    restY = vh * (land ? 0.11 : 0.13)
    view.w = vw
    view.h = vh
    fieldU.uPortrait.value = land ? 0 : 1
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

  // a click or tap anywhere on the hero sends a pulse through the field
  const stage = host.parentElement ?? host
  const onDown = () => {
    fieldU.uPulse.value = 0
    faceU.uFlash.value = 1
  }
  stage.addEventListener('pointerdown', onDown, { passive: true })

  const speed = opts.reduce ? 0.35 : 1
  let raf = 0
  let last = performance.now()
  let slow = 0
  let frames = 0
  let firstPulse = false
  const mouse = new THREE.Vector2()
  const ray = new THREE.Raycaster()
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y)
  const hit = new THREE.Vector3()
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
    const live = pointer.px || pointer.py
    if (live) {
      mouse.x += (pointer.x - mouse.x) * 0.05
      mouse.y += (pointer.y - mouse.y) * 0.05
    }
    uniforms.uMouse.value.copy(mouse)
    dustU.uMouseW.value.set((mouse.x * view.w) / 2, (mouse.y * view.h) / 2)
    uniforms.uIntro.value = state.intro
    uniforms.uScroll.value = state.scroll

    const i = state.intro
    const s = state.scroll
    const e = 1 - Math.pow(1 - i, 3)
    rig.scale.setScalar(fit * (0.72 + 0.28 * e) * (1 + s * 0.4))
    rig.position.set(0, restY + Math.sin(t * 0.6) * 0.05 + s * 0.6, (1 - e) * -6)
    rig.rotation.y = mouse.x * 0.26 + Math.sin(t * 0.33) * 0.07 + (1 - e) * -0.9 + s * 0.35
    rig.rotation.x = -mouse.y * 0.14 + Math.sin(t * 0.27) * 0.035 - s * 0.2
    faceU.uShow.value = art ? e : 0
    bodyMat.uniforms.uShow.value = faceU.uShow.value * (1 - s * 0.6)
    faceU.uPtr.value.copy(mouse)
    faceU.uFlash.value *= Math.pow(0.04, dt)
    dome.rotation.set(mouse.y * 0.03, -mouse.x * 0.045, 0)

    // the camera drifts a little, so the field has real depth under the logo
    camera.position.x = mouse.x * 0.45 + Math.sin(t * 0.11) * 0.15
    camera.position.y = mouse.y * 0.18
    camera.lookAt(0, 0, -6)

    // where the pointer meets the field. Without a pointer (touch), the ripple wanders alone.
    const h3 = fieldU.uHit.value
    let tx = Math.sin(t * 0.23) * 9
    let tz = -9 + Math.cos(t * 0.17) * 6
    let ts = 0.55
    if (live) {
      ray.setFromCamera(mouse, camera)
      if (ray.ray.direction.y < -0.02 && ray.ray.intersectPlane(floor, hit)) {
        tx = hit.x
        tz = Math.max(hit.z, -40)
        ts = 1
      } else {
        ts = 0
      }
    }
    const k = Math.min(1, dt * 5)
    h3.x += (tx - h3.x) * k
    h3.y += (tz - h3.y) * k
    h3.z += (ts * e - h3.z) * Math.min(1, dt * 2.5)
    if (fieldU.uPulse.value >= 0) {
      fieldU.uPulse.value += dt
      if (fieldU.uPulse.value > 6) fieldU.uPulse.value = -1
    }
    // the logo lands, the field answers once
    if (!firstPulse && i > 0.55) {
      firstPulse = true
      fieldU.uPulse.value = 0
    }

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      stage.removeEventListener('pointerdown', onDown)
      fieldGeo.dispose()
      fieldMat.dispose()
      dustGeo.dispose()
      dustMat.dispose()
      domeGeo.dispose()
      domeMat.dispose()
      bodyGeo.dispose()
      bodyMat.dispose()
      faceGeo.dispose()
      faceMat.dispose()
      art?.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
