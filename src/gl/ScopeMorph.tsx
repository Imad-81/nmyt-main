import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { pointer } from '@/lib/hooks'
import { sampleShapes, WORLD_W, CW, CH } from './shapes'
import { SCOPE_LOOP } from './scopeMeta'

// three colours per form: logo, website, dashboard, viewfinder, aperture, social, reel
const PAL = [
  ['#2f6bff', '#19c2ff', '#8dfbff'],
  ['#19b4ff', '#ffffff', '#4dffa6'],
  ['#2f6bff', '#19c2ff', '#8cff3a'],
  ['#22ff7a', '#19c2ff', '#ffffff'],
  ['#22ff7a', '#d0ff3a', '#19b4ff'],
  ['#22ff7a', '#3f7bff', '#d0ff3a'],
  ['#ffe2b0', '#19b4ff', '#22ff7a'],
]

const VERT = /* glsl */ `
attribute vec3 aPos1; attribute vec3 aPos2; attribute vec3 aPos3; attribute vec3 aPos4; attribute vec3 aPos5; attribute vec3 aPos6;
attribute vec4 aRand;
uniform float uTime; uniform float uChapter; uniform float uSize; uniform float uPR; uniform float uOpacity;
uniform vec2 uMouse; uniform float uMouseK;
uniform vec3 uPal[21];
varying vec3 vCol; varying float vAlpha;

vec3 shapePos(int i){
  if(i==1) return aPos1; if(i==2) return aPos2; if(i==3) return aPos3;
  if(i==4) return aPos4; if(i==5) return aPos5; if(i==6) return aPos6;
  return position;
}
vec3 hash3(vec3 p){ p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6))); return -1.0 + 2.0*fract(sin(p)*43758.5453123); }
float noise(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); vec3 u=f*f*(3.0-2.0*f);
  return mix(mix(mix(dot(hash3(i+vec3(0,0,0)),f-vec3(0,0,0)),dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                 mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
             mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                 mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z); }
vec3 flow(vec3 p){ return vec3(noise(p), noise(p+vec3(31.4,7.1,2.9)), noise(p+vec3(-9.2,17.7,41.3))); }

void main(){
  float c = mod(uChapter, 7.0);
  int A = int(floor(min(c, 6.999)));
  int B = A + 1; if (B > 6) B = 0;
  float local = c - float(A);
  float t = smoothstep(0.5, 0.95, local);
  float tt = clamp(t * 1.45 - aRand.y * 0.45, 0.0, 1.0);
  tt = tt * tt * (3.0 - 2.0 * tt);
  vec3 pa = shapePos(A); vec3 pb = shapePos(B);
  vec3 p = mix(pa, pb, tt);
  float mid = sin(tt * 3.14159);
  p += flow(p * 0.32 + vec3(0.0, 0.0, uTime * 0.12 + aRand.w)) * (mid * 1.7);
  p += flow(p * 1.4 + uTime * 0.25) * 0.03;
  vec2 d = p.xy - uMouse; float dl = length(d);
  p.xy += (d / max(dl, 1e-3)) * smoothstep(1.35, 0.0, dl) * 0.42 * uMouseK;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float sz = uSize * (0.55 + aRand.z * 0.9) * (1.0 + mid * 0.6);
  gl_PointSize = sz * uPR * (12.5 / -mv.z);
  int ci = int(aRand.x * 2.999);
  vec3 ca = uPal[A * 3 + ci]; vec3 cb = uPal[B * 3 + ci];
  vCol = mix(ca, cb, tt) * (0.85 + aRand.z * 0.75);
  float tw = 0.72 + 0.28 * sin(uTime * (1.2 + aRand.w * 2.0) + aRand.x * 30.0);
  vAlpha = min(1.0, uOpacity * tw * (0.8 + 0.6 * aRand.z) * (1.0 - mid * 0.2) * 1.35);
}`

const FRAG = /* glsl */ `
varying vec3 vCol; varying float vAlpha;
void main(){
  vec2 q = gl_PointCoord - 0.5; float r = length(q);
  if (r > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, r), 1.6) * vAlpha;
  gl_FragColor = vec4(vCol * a, a);
}`

/**
 * The hologram: a particle field that re-forms through seven figures (the mark, a website,
 * a dashboard, a viewfinder, an aperture, a phone, a film reel) on an 18 second loop.
 * It plays by itself. Scrolling never drives it and never waits for it.
 */
export default function ScopeMorph({ onStage, className }: { onStage?: (i: number) => void; className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const cb = useRef(onStage)
  useEffect(() => {
    cb.current = onStage
  }, [onStage])

  useEffect(() => {
    const el = host.current!
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const count = mobile ? 16000 : 42000
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return
    }
    const pr = Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75)
    renderer.setPixelRatio(pr)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80)

    const shapes = sampleShapes(count, 7)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(shapes[0], 3))
    for (let i = 1; i < shapes.length; i++) geo.setAttribute(`aPos${i}`, new THREE.BufferAttribute(shapes[i], 3))
    const rnd = new Float32Array(count * 4)
    for (let i = 0; i < rnd.length; i++) rnd[i] = Math.random()
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20)

    const uniforms = {
      uTime: { value: 0 },
      uChapter: { value: 0 },
      uSize: { value: mobile ? 2.7 : 3.1 },
      uPR: { value: pr },
      uOpacity: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uMouseK: { value: 0 },
      uPal: { value: PAL.flat().map((h) => new THREE.Color(h)) },
    }
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    const rig = new THREE.Group()
    rig.add(points)
    scene.add(rig)

    const size = { w: 1, h: 1 }
    const resize = () => {
      const r = el.getBoundingClientRect()
      size.w = Math.max(1, r.width)
      size.h = Math.max(1, r.height)
      renderer.setSize(size.w, size.h, false)
      camera.aspect = size.w / size.h
      // pull back until the whole 16:9 figure fits the frame with a little air
      const half = Math.tan((camera.fov * Math.PI) / 360)
      const worldH = (WORLD_W * CH) / CW
      camera.position.z = Math.max(worldH / 2 / half, WORLD_W / 2 / (half * camera.aspect)) * 1.08
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)

    let raf = 0
    let last = performance.now()
    let stage = -1
    const mouse = new THREE.Vector2(99, 99)
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(now - last, 50) / 1000
      last = now
      if (!visible || document.hidden) return
      uniforms.uTime.value += dt
      uniforms.uOpacity.value += (1 - uniforms.uOpacity.value) * 0.04
      // start on the website figure, end each loop back on the mark
      const c = ((uniforms.uTime.value / SCOPE_LOOP) * 7 + 1) % 7
      uniforms.uChapter.value = c
      const s = Math.floor(c + 0.28) % 7
      if (s !== stage) {
        stage = s
        cb.current?.(s)
      }
      // pointer in the figure's own plane
      const r = el.getBoundingClientRect()
      const inside = pointer.px >= r.left && pointer.px <= r.right && pointer.py >= r.top && pointer.py <= r.bottom
      const half = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
      const mx = (((pointer.px - r.left) / r.width) * 2 - 1) * half * camera.aspect
      const my = -(((pointer.py - r.top) / r.height) * 2 - 1) * half
      if (inside) mouse.lerp(new THREE.Vector2(mx, my), 0.14)
      uniforms.uMouse.value.copy(mouse)
      uniforms.uMouseK.value += ((inside ? 1 : 0) - uniforms.uMouseK.value) * 0.06
      rig.rotation.y = Math.sin(uniforms.uTime.value * 0.25) * 0.22 + (inside ? (mx / (half * camera.aspect)) * 0.12 : 0)
      rig.rotation.x = Math.sin(uniforms.uTime.value * 0.19) * 0.06
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className={className} style={{ position: 'absolute', inset: 0 }} aria-hidden />
}
