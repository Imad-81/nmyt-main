/**
 * "Convergence" — the NMYT hero light field.
 * Family A: precise royal/sky threads (Tech Studio).
 * Family B: silky acid/emerald ribbons (Creative Studio).
 * They cross and burn white where they meet — NMYT.
 * The curve maths is mirrored in TS (heroCurve) so DOM labels can ride the strands.
 */

export const HERO_ANGLE = -0.16
export const HERO_LIFT = 0.1

export function heroBaseA(x: number, t: number) {
  return 0.16 * Math.sin(1.25 * x + 0.9 * t) + 0.07 * Math.sin(2.6 * x - 0.7 * t + 1.3) + HERO_LIFT
}
export function heroBaseB(x: number, t: number) {
  return -0.14 * Math.sin(1.1 * x + 0.8 * t + 0.6) + 0.08 * Math.sin(2.2 * x + 0.6 * t + 2.4) + HERO_LIFT - 0.02
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
export function heroStrandY(family: 'A' | 'B', fi: number, x: number, t: number, mx: number, my: number, zoom: number) {
  let y: number
  if (family === 'A') {
    const spread = 0.012 + 0.2 * smooth(-0.9, 1.1, x)
    y = heroBaseA(x, t) + (fi - 0.5) * spread * 2 + 0.012 * Math.sin(3.1 * x + fi * 9 + 1.3 * t)
  } else {
    const spread = 0.014 + 0.26 * smooth(1.0, -1.1, x)
    y = heroBaseB(x, t) + (fi - 0.5) * spread * 2 + 0.018 * Math.sin(2.3 * x + fi * 7 - 1.1 * t)
  }
  const k = Math.exp(-(x - mx) * (x - mx) * 5)
  y += (my - y) * 0.22 * k
  void zoom
  return y
}

/** strand point (in shader q-space) → CSS pixels */
export function heroToScreen(x: number, y: number, w: number, h: number, zoom: number) {
  // shader: q = Rot(-HERO_ANGLE)·p / zoom  (GLSL mat2 is column-major) → p = Rot(HERO_ANGLE)·q·zoom
  const a = HERO_ANGLE
  const qx = x * zoom
  const qy = y * zoom
  const px = Math.cos(a) * qx - Math.sin(a) * qy
  const py = Math.sin(a) * qx + Math.cos(a) * qy
  return { sx: px * h + w / 2, sy: h / 2 - py * h }
}

export const HERO_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntro;
uniform float uScroll;
varying vec2 vUv;

#define NA 30
#define NB 22

vec3 royal = vec3(0.086, 0.22, 1.0);
vec3 deep  = vec3(0.04, 0.10, 0.55);
vec3 sky   = vec3(0.086, 0.706, 1.0);
vec3 ice   = vec3(0.81, 0.94, 1.0);
vec3 acid  = vec3(0.486, 1.0, 0.227);
vec3 emer  = vec3(0.0, 0.878, 0.541);

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }

float baseA(float x, float t){ return 0.16*sin(1.25*x + 0.9*t) + 0.07*sin(2.6*x - 0.7*t + 1.3) + ${HERO_LIFT.toFixed(3)}; }
float baseB(float x, float t){ return -0.14*sin(1.1*x + 0.8*t + 0.6) + 0.08*sin(2.2*x + 0.6*t + 2.4) + ${(HERO_LIFT - 0.02).toFixed(3)}; }

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float ang = ${HERO_ANGLE.toFixed(3)};
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  float zoom = 1.0 + uScroll*0.35;
  vec2 q = (R * p) / zoom;
  vec2 mq = (R * (uMouse*0.5*vec2(aspect, 1.0))) / zoom;

  float t = uTime * 0.16;
  float x = q.x;
  float mk = exp(-(x-mq.x)*(x-mq.x)*5.0);

  // light "writes in" from the left during intro
  float reveal = smoothstep(-0.25, 0.0, mix(-aspect, aspect*0.6 + 0.4, uIntro) - x*0.8);

  vec3 col = vec3(0.0);

  // ---------- family A: tech threads ----------
  float spreadA = 0.012 + 0.2*smoothstep(-0.9, 1.1, x);
  float bA = baseA(x, t);
  for (int i = 0; i < NA; i++) {
    float fi = float(i) / float(NA - 1);
    float y = bA + (fi - 0.5)*spreadA*2.0 + 0.012*sin(3.1*x + fi*9.0 + 1.3*t);
    y += (mq.y - y) * 0.22 * mk;
    float d = abs(q.y - y);
    float w = mix(0.0007, 0.0019, hash(vec2(fi, 3.1)));
    float g = w / (d + 0.0016) * exp(-d*10.0);
    vec3 c = mix(royal, sky, smoothstep(0.0, 1.0, fi*0.6 + 0.4*smoothstep(-0.6, 1.2, x)));
    c = mix(c, ice, 0.25*smoothstep(0.7, 1.0, fi));
    col += c * g * 0.55;
  }
  // soft bloom sheet along A
  float dA = q.y - bA;
  col += mix(deep, royal, 0.6) * 0.5 * exp(-dA*dA*(90.0/(spreadA*12.0+0.4))) * 0.3;

  // ---------- family B: creative silk ----------
  float spreadB = 0.014 + 0.26*smoothstep(1.0, -1.1, x);
  float bB = baseB(x, t);
  for (int i = 0; i < NB; i++) {
    float fi = float(i) / float(NB - 1);
    float y = bB + (fi - 0.5)*spreadB*2.0 + 0.018*sin(2.3*x + fi*7.0 - 1.1*t);
    y += (mq.y - y) * 0.22 * mk;
    float d = abs(q.y - y);
    float w = mix(0.0009, 0.0026, hash(vec2(fi, 7.7)));
    float g = w / (d + 0.0022) * exp(-d*9.0);
    vec3 c = mix(emer, acid, smoothstep(0.0, 1.0, fi*0.7 + 0.3*smoothstep(0.8, -1.0, x)));
    col += c * g * 0.42;
  }
  float dB = q.y - bB;
  col += mix(emer, acid, 0.3) * 0.12 * exp(-dB*dB*(90.0/(spreadB*12.0+0.4)));

  // ---------- convergence: white-hot where they cross ----------
  float cross = exp(-abs(bA - bB)*16.0) * exp(-dA*dA*140.0);
  col += ice * cross * 0.9;

  // sparse sparkles riding the light
  vec2 gp = floor(gl_FragCoord.xy / 3.0);
  float s = hash(gp + floor(uTime*6.0));
  float near = exp(-min(abs(dA), abs(dB))*14.0);
  col += vec3(0.8, 0.95, 1.0) * step(0.9965, s) * near * 0.8;

  col *= reveal;

  // ambient atmosphere (very low) + vignette
  float v = smoothstep(1.25, 0.2, length(p*vec2(0.85, 1.1)));
  col *= mix(0.55, 1.0, v);

  // filmic tonemap, keep saturation
  col = 1.0 - exp(-col * 1.25);
  col = pow(col, vec3(0.95));
  col *= 1.0 - uScroll*0.65;

  gl_FragColor = vec4(col, 1.0);
}
`
