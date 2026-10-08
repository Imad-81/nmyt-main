/**
 * The Earth from orbit, for /about. NASA Blue Marble imagery on a sphere: a lit crescent with
 * real colour, the night side with city lights that glimmer, a thin atmosphere and a halo.
 * It is framed large and off-centre so only part of it is in view, and it turns slowly round
 * India, where the studio is. The pointer nudges the turn.
 *
 * Plain three.js: three draw calls. Sleeps off-screen, lowers its own resolution if frames run slow.
 */
import * as THREE from 'three'
import { pointer } from '@/lib/hooks'

const SPHERE_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vO;
void main(){
  vUv = uv;
  vO = position;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vP = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`

const EARTH_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying vec3 vO;
uniform sampler2D uDay; uniform sampler2D uAux;
uniform vec3 uSun; uniform vec3 uHome; uniform float uTime; uniform float uShow;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vP);
  vec3 day = texture2D(uDay, vUv).rgb;
  vec2 aux = texture2D(uAux, vUv).rg;
  float ndl = dot(N, uSun);
  float lit = smoothstep(-0.16, 0.34, ndl);
  // daylight: the map's own colours, a touch deeper
  vec3 dayCol = pow(day, vec3(1.12)) * vec3(0.92, 1.0, 1.12) * (0.22 + 0.92 * max(ndl, 0.0));
  // the sun on open water
  float spec = pow(max(dot(reflect(-uSun, N), V), 0.0), 26.0) * aux.g;
  dayCol += vec3(0.7, 0.85, 1.0) * spec * 0.5;
  // night: land and sea stay just readable in blue, cities burn white and blue and glimmer
  float lum = dot(day, vec3(0.3, 0.55, 0.15));
  vec3 nightCol = vec3(0.012, 0.03, 0.075) + vec3(0.05, 0.11, 0.24) * lum * (1.0 - aux.g * 0.55);
  float city = pow(clamp((aux.r - 0.07) * 2.4, 0.0, 1.0), 1.15);
  float tw = 0.72 + 0.28 * sin(uTime * (1.2 + hash(floor(vUv * vec2(900.0, 450.0))) * 3.0) + hash(floor(vUv * vec2(640.0, 320.0))) * 40.0);
  nightCol += mix(vec3(0.35, 0.62, 1.0), vec3(0.95, 0.98, 1.0), city) * city * tw * 2.1;
  vec3 col = mix(nightCol, dayCol, lit);
  // home: a quiet beacon on Hyderabad
  float hd = acos(clamp(dot(normalize(vO), uHome), -1.0, 1.0));
  float ph = fract(uTime * 0.32);
  float beacon = smoothstep(0.0075, 0.003, hd) + smoothstep(0.0045, 0.0, abs(hd - ph * 0.05)) * (1.0 - ph) * 0.7;
  col += vec3(0.75, 0.9, 1.0) * beacon;
  // atmosphere: thin on the face, bright on the limb, brightest toward the sun
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  col += mix(vec3(0.03, 0.1, 0.38), vec3(0.3, 0.62, 1.0), lit) * fres * (0.55 + lit * 0.9);
  col += vec3(0.9, 0.96, 1.0) * pow(fres, 3.0) * lit * 0.55;
  gl_FragColor = vec4(col * uShow, 1.0);
}`

const HALO_FRAG = /* glsl */ `
precision highp float;
varying vec3 vN; varying vec3 vP;
uniform vec3 uSun; uniform float uShow;
void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vP);
  // a shell seen from inside out: densest at the planet's edge, gone a little way off
  float x = clamp(dot(-N, V) / 0.507, 0.0, 1.0);
  float glow = pow(x, 3.2);
  float side = 0.22 + 0.78 * smoothstep(-0.7, 0.8, dot(normalize(vec3(N.xy, 0.12)), uSun));
  vec3 col = mix(vec3(0.03, 0.16, 0.85), vec3(0.5, 0.78, 1.0), glow * side) * glow * side;
  gl_FragColor = vec4(col * uShow, 1.0);
}`

const SPARK_VERT = /* glsl */ `
attribute vec3 aRand;
uniform float uTime; uniform float uPR; uniform float uShow;
varying float vA; varying vec3 vCol;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.0 + aRand.x * 2.6) * uPR;
  float tw = 0.5 + 0.5 * sin(uTime * (0.6 + aRand.y * 2.4) + aRand.z * 40.0);
  vA = tw * tw * (0.35 + 0.65 * aRand.x) * uShow;
  vCol = mix(vec3(0.4, 0.66, 1.0), vec3(1.0), aRand.y * aRand.y);
}`

const SPARK_FRAG = /* glsl */ `
varying float vA; varying vec3 vCol;
void main(){
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, r);
  a = a * a * vA;
  gl_FragColor = vec4(vCol * a, a);
}`

export type Globe = { dispose: () => void }

const HOME = { lat: 17.385, lon: 78.4867 } // Hyderabad

// Light that adds to the picture without making the canvas opaque: the halo and the sparks
// glow over the page itself, so the planet has no box round it.
const LIGHT = {
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
} as const

export function createGlobe(host: HTMLElement): Globe | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false, premultipliedAlpha: true })
  } catch {
    return null
  }
  const canvas = renderer.domElement
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block' })
  host.appendChild(canvas)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NoToneMapping

  let pr = Math.min(window.devicePixelRatio || 1, 2)
  const scene = new THREE.Scene()
  const FOV = 26
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200)

  const sun = new THREE.Vector3(-0.8, 0.38, -0.34).normalize()
  const lat = (HOME.lat * Math.PI) / 180
  const lon = (HOME.lon * Math.PI) / 180
  const home = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon))
  const u = {
    uDay: { value: null as THREE.Texture | null },
    uAux: { value: null as THREE.Texture | null },
    uSun: { value: sun },
    uHome: { value: home },
    uTime: { value: 0 },
    uShow: { value: 0 },
  }
  const geo = new THREE.SphereGeometry(1, 128, 80)
  const earthMat = new THREE.ShaderMaterial({ vertexShader: SPHERE_VERT, fragmentShader: EARTH_FRAG, uniforms: u })
  const earth = new THREE.Mesh(geo, earthMat)
  const haloMat = new THREE.ShaderMaterial({
    vertexShader: SPHERE_VERT,
    fragmentShader: HALO_FRAG,
    uniforms: { uSun: u.uSun, uShow: u.uShow },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    ...LIGHT,
  })
  const halo = new THREE.Mesh(geo, haloMat)
  halo.scale.setScalar(1.16)

  // glimmering points in the space round the planet
  const SPARKS = 340
  const sPos = new Float32Array(SPARKS * 3)
  const sRnd = new Float32Array(SPARKS * 3)
  for (let i = 0; i < SPARKS; i++) {
    const r = 1.1 + Math.pow(Math.random(), 1.6) * 1.5
    const a = Math.random() * Math.PI * 2
    const b = Math.acos(Math.random() * 2 - 1)
    sPos[i * 3] = r * Math.sin(b) * Math.cos(a)
    sPos[i * 3 + 1] = r * Math.cos(b) * 0.8
    sPos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a)
    for (let k = 0; k < 3; k++) sRnd[i * 3 + k] = Math.random()
  }
  const sparkGeo = new THREE.BufferGeometry()
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
  sparkGeo.setAttribute('aRand', new THREE.BufferAttribute(sRnd, 3))
  const sparkU = { uTime: u.uTime, uPR: { value: pr }, uShow: u.uShow }
  const sparkMat = new THREE.ShaderMaterial({ vertexShader: SPARK_VERT, fragmentShader: SPARK_FRAG, uniforms: sparkU, transparent: true, depthWrite: false, ...LIGHT })
  const sparks = new THREE.Points(sparkGeo, sparkMat)

  const planet = new THREE.Group()
  planet.add(earth, halo, sparks)
  planet.visible = false
  scene.add(planet)

  // textures: the large day map only where the globe is drawn large
  let disposed = false
  let loaded = 0
  const loader = new THREE.TextureLoader()
  const big = host.clientWidth * pr > 900
  const tex: THREE.Texture[] = []
  const prep = (t: THREE.Texture) => {
    t.wrapS = THREE.RepeatWrapping
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    tex.push(t)
    if (disposed) t.dispose()
    else if (++loaded === 2) planet.visible = true
    return t
  }
  loader.load(big ? '/media/earth-day.webp' : '/media/earth-day-sm.webp', (t) => (u.uDay.value = prep(t)))
  loader.load('/media/earth-aux.webp', (t) => (u.uAux.value = prep(t)))

  // India sits in the part of the planet that is in view, on the edge of night; the planet
  // sways a little either side of that
  let baseX = 0.2
  let baseY = 0
  const size = { w: 1, h: 1 }
  const resize = () => {
    const r = host.getBoundingClientRect()
    size.w = Math.max(1, r.width)
    size.h = Math.max(1, r.height)
    renderer.setPixelRatio(pr)
    renderer.setSize(size.w, size.h, false)
    sparkU.uPR.value = pr * Math.max(1, size.w / 900)
    camera.aspect = size.w / size.h
    // frame the planet by pixels: on tablets and phones its top shows as a horizon, on desktop its side
    const band = window.matchMedia('(max-width: 1023px)').matches
    baseX = band ? -0.42 : 0.2
    baseY = -Math.PI / 2 - lon - (band ? 0.05 : 0.3)
    const R = band ? size.w * 0.78 : Math.min(size.w * 0.6, size.h * 0.74)
    const cx = band ? size.w * 0.5 : size.w * 0.84
    const cy = band ? size.h * 0.26 + R : size.h * 0.56
    const tan = Math.tan((FOV * Math.PI) / 360)
    const d = size.h / (2 * R * tan)
    camera.position.set(0, 0, d)
    const unit = (2 * d * tan) / size.h // world units per pixel at the planet
    planet.position.set((cx - size.w / 2) * unit, -(cy - size.h / 2) * unit, 0)
    camera.far = d + 10
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '80px' })
  io.observe(host)
  const onLost = (e: Event) => e.preventDefault()
  canvas.addEventListener('webglcontextlost', onLost)

  // India faces the viewer; the planet sways a little either side of it
  let raf = 0
  let last = performance.now()
  let slow = 0
  let frames = 0
  let mx = 0
  let my = 0
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
        if (slow > 22 && pr > 0.75) {
          pr = Math.max(0.75, pr * 0.82)
          resize()
        }
        frames = 0
        slow = 0
      }
    }
    u.uTime.value += dt
    const t = u.uTime.value
    if (planet.visible) u.uShow.value += (1 - u.uShow.value) * Math.min(1, dt * 1.6)
    if (pointer.px || pointer.py) {
      mx += (pointer.x - mx) * 0.04
      my += (pointer.y - my) * 0.04
    }
    earth.rotation.set(baseX - my * 0.08, baseY + Math.sin(t * 0.045) * 0.22 + mx * 0.25, 0)
    sparks.rotation.y = t * 0.012 + mx * 0.1
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
      geo.dispose()
      earthMat.dispose()
      haloMat.dispose()
      sparkGeo.dispose()
      sparkMat.dispose()
      tex.forEach((t) => t.dispose())
      renderer.dispose()
      canvas.remove()
    },
  }
}
