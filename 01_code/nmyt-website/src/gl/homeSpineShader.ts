/**
 * "Convergence Spine" — Full-page living light field for NMYT Home.
 *
 * Family A: precise royal/sky threads (Tech Studio)
 * Family B: silky acid/emerald ribbons (Creative Studio)
 * Convergence: white-hot where they cross (NMYT)
 *
 * Evolving seamlessly with scroll:
 * - 0.0 - 0.2: Signature Hero crossing behind "Where code meets cinema"
 * - 0.2 - 0.4: Diagonal cascade framing Manifesto & cradling the 3 studio pillars
 * - 0.4 - 0.65: Ambient neon underglow framing Selected Work bento grid with pointer pull
 * - 0.65 - 0.85: Streamlined energy conduits aligning with Approach vertical process rail
 * - 0.85 - 1.0: Re-convergence into the Footer monogram seal
 */

export const HOME_SPINE_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntro;
uniform float uHeroScroll;
uniform float uPageScroll;
varying vec2 vUv;

#define NA 28
#define NB 22

vec3 royal = vec3(0.086, 0.22, 1.0);
vec3 deep  = vec3(0.035, 0.09, 0.52);
vec3 sky   = vec3(0.086, 0.706, 1.0);
vec3 ice   = vec3(0.81, 0.94, 1.0);
vec3 acid  = vec3(0.486, 1.0, 0.227);
vec3 emer  = vec3(0.0, 0.878, 0.541);

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smoothVal(float a, float b, float x) {
  float t = clamp((x - a) / (b - a), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

// Base curves with scroll travel and harmonic breathing
float baseA(float x, float t, float s) {
  float phase = s * 7.5;
  return 0.16 * sin(1.25 * x + 0.9 * t - phase) + 0.07 * sin(2.6 * x - 0.7 * t + 1.3 + phase * 0.7) + 0.10;
}

float baseB(float x, float t, float s) {
  float phase = s * 6.8;
  return -0.14 * sin(1.1 * x + 0.8 * t + 0.6 - phase) + 0.08 * sin(2.2 * x + 0.6 * t + 2.4 + phase * 0.6) + 0.08;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = (fc - 0.5 * uRes) / uRes.y;

  float s = clamp(uPageScroll, 0.0, 1.0);
  float hs = clamp(uHeroScroll, 0.0, 1.0);

  // Dynamic rotation angle: -0.16 at hero, tilting gracefully with scroll journey
  float ang = -0.16 - 0.14 * sin(s * 3.14159) + 0.05 * sin(s * 6.28318);
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

  // Zoom: subtle dynamic zoom curve that keeps filaments crisp throughout scroll
  float zoom = 1.0 + hs * 0.22 + sin(s * 3.14159) * 0.12;

  // Viewport vertical drift: strands travel organically across the viewport as you scroll
  vec2 pOffset = p;
  pOffset.y += sin(s * 3.14159 * 2.0) * 0.14 + (s - 0.5) * 0.22;
  pOffset.x += sin(s * 3.14159) * 0.08;

  vec2 q = (R * pOffset) / zoom;
  vec2 mq = (R * (uMouse * 0.5 * vec2(aspect, 1.0))) / zoom;

  float t = uTime * 0.16;
  float x = q.x;

  // Mouse interaction lens with smooth distance falloff
  vec2 dm = q - mq;
  float mk = exp(-dot(dm, dm) * 6.0);
  q -= dm * mk * 0.12;

  // Intro wipe reveal from left (hero initial entrance)
  float reveal = smoothstep(-0.25, 0.0, mix(-aspect, aspect * 0.6 + 0.4, uIntro) - x * 0.8);

  // Section-aware modulation:
  // 1. Separation in Manifesto (s: ~0.08 - 0.38): Tech moves left, Creative moves right
  float mfBand = smoothVal(0.08, 0.22, s) * (1.0 - smoothVal(0.38, 0.52, s));
  // 2. Selected Work width expansion (s: ~0.30 - 0.65)
  float swBand = smoothVal(0.30, 0.45, s) * (1.0 - smoothVal(0.65, 0.78, s));
  // 3. Approach process rail focus (s: ~0.62 - 0.85): gather toward left
  float apBand = smoothVal(0.62, 0.74, s) * (1.0 - smoothVal(0.85, 0.94, s));
  // 4. Footer convergence (s: > 0.82)
  float ftBand = smoothVal(0.82, 0.98, s);

  vec3 col = vec3(0.0);

  // ---------- Family A: Tech Threads (Royal / Sky / Ice) ----------
  float spreadA = (0.012 + 0.20 * smoothstep(-0.9, 1.1, x)) * (1.0 + swBand * 0.35);
  float bA = baseA(x, t, s) + mfBand * 0.22 - apBand * 0.10 + ftBand * 0.06;

  for (int i = 0; i < NA; i++) {
    float fi = float(i) / float(NA - 1);
    float y = bA + (fi - 0.5) * spreadA * 2.0 + 0.012 * sin(3.1 * x + fi * 9.0 + 1.3 * t);
    y += (mq.y - y) * 0.22 * mk;
    float d = abs(q.y - y);
    float w = mix(0.0007, 0.0019, hash(vec2(fi, 3.1)));
    float g = w / (d + 0.0016) * exp(-d * 10.0);
    vec3 c = mix(royal, sky, smoothstep(0.0, 1.0, fi * 0.6 + 0.4 * smoothstep(-0.6, 1.2, x)));
    c = mix(c, ice, 0.25 * smoothstep(0.7, 1.0, fi));
    col += c * g * 0.38;
  }
  // Soft bloom sheet along A
  float dA = q.y - bA;
  col += mix(deep, royal, 0.6) * 0.35 * exp(-dA * dA * (90.0 / (spreadA * 12.0 + 0.4))) * 0.22;

  // ---------- Family B: Creative Silk (Emerald / Acid) ----------
  float spreadB = (0.014 + 0.26 * smoothstep(1.0, -1.1, x)) * (1.0 + swBand * 0.35);
  float bB = baseB(x, t, s) - mfBand * 0.22 - apBand * 0.15 - ftBand * 0.04;

  for (int i = 0; i < NB; i++) {
    float fi = float(i) / float(NB - 1);
    float y = bB + (fi - 0.5) * spreadB * 2.0 + 0.018 * sin(2.3 * x + fi * 7.0 - 1.1 * t);
    y += (mq.y - y) * 0.22 * mk;
    float d = abs(q.y - y);
    float w = mix(0.0009, 0.0026, hash(vec2(fi, 7.7)));
    float g = w / (d + 0.0022) * exp(-d * 9.0);
    vec3 c = mix(emer, acid, smoothstep(0.0, 1.0, fi * 0.7 + 0.3 * smoothstep(0.8, -1.0, x)));
    col += c * g * 0.28;
  }
  // Soft bloom sheet along B
  float dB = q.y - bB;
  col += mix(emer, acid, 0.3) * 0.08 * exp(-dB * dB * (90.0 / (spreadB * 12.0 + 0.4)));

  // ---------- Convergence: White-Hot Cross ----------
  float crossDist = abs(bA - bB);
  float cross = exp(-crossDist * 14.0) * exp(-dA * dA * 130.0);
  
  // Hero retains 100% original brilliance; other sections soften the white-hot cross
  float heroFactor = 1.0 - smoothVal(0.0, 0.14, hs);
  float crossGain = mix(0.16, 0.65, heroFactor);
  crossGain = mix(crossGain, 0.38, ftBand);
  col += ice * cross * crossGain;

  // Intro reveal gating
  col *= reveal;

  // Pointer illumination boost (gentler outside the hero)
  col *= (1.0 + mk * mix(0.18, 0.38, heroFactor));

  // Global brightness: Full 1.0 in hero, elegantly dimmed to ~0.30 in all other sections
  // so text, headlines, and bento cards maintain maximum contrast and readability
  float sectionDim = mix(0.30, 1.0, heroFactor);
  sectionDim = mix(sectionDim, 0.40, ftBand);
  col *= sectionDim;

  // Text comfort attenuation in the central column outside the hero
  float textComfort = 1.0 - (1.0 - heroFactor) * 0.22 * exp(-p.x * p.x * 2.8);
  col *= textComfort;

  // Ambient atmospheric falloff & vignette
  float v = smoothstep(1.35, 0.25, length(p * vec2(0.85, 1.1)));
  col *= mix(0.60, 1.0, v);

  // Filmic tonemap: maintain deep saturation without blowing out
  col = 1.0 - exp(-col * 1.1);
  col = pow(col, vec3(0.95));

  // Anti-banding dither
  col += (hash(fc + fract(uTime) * 97.0) - 0.5) / 255.0 * 1.2;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`
