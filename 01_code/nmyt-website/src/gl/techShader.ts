/**
 * "Horizon" — the Tech Studio hero light.
 * A huge dark disc whose upper limb glows: ice-white hairline, sky atmosphere,
 * royal falloff into the void. Noise-driven flow runs along the limb, the hot spot
 * follows the pointer. uScroll lifts the horizon, then floods the frame with light
 * from the apex until it resolves to exact paper white (#F6F9FF) — the page turns light.
 *
 * uIntro  0..1  horizon rises into frame after the loader
 * uScroll 0..1  0–.5 rise · .34–.84 bloom · ≥.84 paper
 */
export const TECH_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntro;
uniform float uScroll;
varying vec2 vUv;

const vec3 VOIDC = vec3(0.012, 0.016, 0.031);
const vec3 DEEP  = vec3(0.02, 0.06, 0.36);
const vec3 ROYAL = vec3(0.086, 0.22, 1.0);
const vec3 SKY   = vec3(0.086, 0.706, 1.0);
const vec3 ICE   = vec3(0.81, 0.94, 1.0);
const vec3 PAPER = vec3(0.965, 0.976, 1.0);

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = m*p; a *= 0.5; }
  return v;
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = (fc - 0.5*uRes) / uRes.y;
  float t = uTime * 0.1;
  float s = clamp(uScroll, 0.0, 1.0);
  float rise = smoothstep(0.0, 0.5, s);
  float bloom = smoothstep(0.34, 0.84, s);

  // ---------- the planet: a huge disc, its upper limb is the horizon ----------
  float R = max(1.05, aspect*0.72);
  float lift = mix(-0.78, -0.30, uIntro) + rise*0.30;     // y of the limb's apex
  vec2 m = uMouse * vec2(aspect*0.5, 0.5);
  vec2 c = vec2(m.x*0.06, lift - R);
  vec2 q = p - c;
  float r = length(q);
  float d = r - R;                                          // <0 inside the disc
  float ct = clamp(q.y / r, -1.0, 1.0);
  float arc = acos(ct) * R;                                 // arc length from apex
  float top = exp(-arc*arc*mix(1.6, 0.9, rise));
  float hx = p.x - m.x*0.6;
  float hot = exp(-hx*hx*3.0);

  // flowing atmosphere (polar domain warp)
  vec2 fp = vec2(arc*1.4, d*4.0);
  float n  = fbm(fp*1.3 + vec2(t, -t*0.6));
  float n2 = fbm(fp*2.4 + n*1.8 + vec2(-t*0.8, t*0.5));

  float inside = 1.0 - smoothstep(-0.004, 0.004, d);
  float depth = clamp(-d*1.8 + (n2 - 0.5)*0.05, 0.0, 1.0);

  vec3 col = VOIDC;

  // atmosphere just inside the limb: ice -> sky -> royal -> deep -> void
  vec3 atm = mix(ICE, SKY, smoothstep(0.0, 0.10, depth));
  atm = mix(atm, ROYAL, smoothstep(0.06, 0.32, depth));
  atm = mix(atm, DEEP, smoothstep(0.25, 0.6, depth));
  atm = mix(atm, VOIDC, smoothstep(0.5, 1.0, depth));
  float atmI = exp(d*mix(3.2, 2.2, rise)) * inside * (0.9 + 0.2*n2);
  col += atm * atmI * top * 1.1;

  // the limb itself: a white-hot hairline
  float rimW = 0.006 + 0.01*top + 0.002*n;
  float rim = exp(-abs(d)/rimW);
  col += mix(SKY, ICE, 0.75) * rim * top * (0.9 + 0.8*hot);

  // halo above the horizon
  float up = max(d, 0.0);
  float halo = exp(-up*mix(6.5, 3.8, rise)) * (1.0 - inside);
  vec3 haloC = mix(ROYAL, SKY, 0.55 + 0.45*top);
  col += haloC * halo * top * 0.55 * (0.96 + 0.08*n);
  col += ICE * pow(halo, 3.0) * top * 0.35 * (0.6 + hot);
  col += ROYAL * 0.06 * exp(-up*1.4) * (1.0 - inside) * exp(-p.x*p.x*0.8);

  // faint dot grid in the void — instrument, not decoration
  float cell = uRes.y / 34.0;
  vec2 g = (fract(fc / cell) - 0.5) * cell;
  float dotg = 1.0 - smoothstep(0.6, 1.4, length(g));
  float gm = (1.0 - inside) * smoothstep(0.02, 0.5, up) * smoothstep(0.8, 0.0, abs(p.y - 0.1));
  float near = exp(-length(p - m)*2.5);
  col += ICE * dotg * gm * (0.045 + 0.12*near);

  col *= mix(0.9, 1.35, rise);
  float v = smoothstep(1.3, 0.3, length(p*vec2(0.8, 1.0)));
  col *= mix(0.6, 1.0, v);

  // filmic, keep saturation
  col = 1.0 - exp(-col*1.35);

  // ---------- bloom: light floods out of the apex until the frame is paper ----------
  float on = step(0.0005, bloom);
  vec2 bp = (p - vec2(c.x, lift)) * vec2(0.62, 1.0);
  float e = length(bp) + (n - 0.5)*0.03;
  float fr = pow(bloom, 1.5) * 2.1;
  float flood = 1.0 - smoothstep(fr - 0.28, fr, e);
  vec3 fcol = mix(PAPER, ICE, smoothstep(fr - 0.7, fr, e));
  fcol = mix(fcol, SKY, smoothstep(fr - 0.2, fr, e) * 0.45);
  col = mix(col, fcol, flood * on);
  float fe = (e - fr + 0.06) * 9.0;
  float front = exp(-fe*fe) * on * (1.0 - smoothstep(0.8, 1.0, bloom));
  col += SKY * front * 0.35;
  col = mix(col, PAPER, smoothstep(0.93, 1.0, bloom));

  // dither against banding
  col += (hash(fc + fract(uTime)*97.0) - 0.5) / 255.0 * 1.5;
  gl_FragColor = vec4(col, 1.0);
}
`
