/**
 * Creative Studio shaders.
 *  - CREATIVE_FRAG : "Signal" — acid / emerald light-streak ribbons sweeping in wide arcs over
 *                    deep navy → black, with brand-coloured chromatic fringe, CRT scanlines,
 *                    glitch slices and grain.
 *  - PORTRAIT_FRAG : halftone + scanline duotone (black → navy → emerald → acid) with RGB-split
 *                    ghosts, row-slice glitch and a pointer "tear" that smears rows sideways.
 *  - WARP_FRAG     : liquid-warped, variably blurred giant type (rendered to a canvas texture)
 *                    that swirls around the pointer — sits behind frosted glass cards.
 */

const COMMON = /* glsl */ `
const vec3 ACID  = vec3(0.486, 1.0, 0.227);
const vec3 EMER  = vec3(0.0, 0.878, 0.541);
const vec3 NAVY  = vec3(0.016, 0.071, 0.247);
const vec3 ROYD  = vec3(0.039, 0.102, 0.549);
const vec3 ROYAL = vec3(0.086, 0.22, 1.0);

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float a = 0.5; float s = 0.0;
  for (int i = 0; i < 4; i++){ s += a*noise(p); p = p*2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return s;
}
`

export const CREATIVE_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntro;
uniform float uScroll;
uniform float uGlitch;
varying vec2 vUv;
${COMMON}

// One silk ribbon = N strands around a circular arc, a soft body sheet and a white-hot spine
// with a brand-coloured chromatic fringe (acid outside, royal inside).
vec3 ribbon(vec2 p, vec2 c, float r, float w, float twist, float sp, vec3 cA, vec3 cB, float gain, float t){
  vec2 d0 = p - c;
  float ang = atan(d0.y, d0.x);
  float rad = length(d0);
  float tw = 0.5 + 0.5*sin(ang*twist + t*sp);
  float width = w*(0.18 + 1.0*tw);
  float travel = 0.6 + 0.4*sin(ang*5.0 - t*sp*2.6);
  vec3 col = vec3(0.0);
  for (int i = 0; i < 16; i++){
    float fi = float(i)/15.0;
    float off = (fi - 0.5)*width + 0.005*sin(ang*11.0 + fi*13.0 + t*1.9);
    float d = abs(rad - (r + off));
    float th = mix(0.0005, 0.0019, hash(vec2(fi, r)));
    float g = th/(d + 0.0017)*exp(-d*16.0);
    col += mix(cA, cB, fi)*g*0.5;
  }
  float db = rad - r;
  col += mix(cA, cB, 0.4)*0.38*exp(-db*db/(width*width*0.3 + 0.0002));
  // spine on the outer edge + fringe
  float e = db - width*0.5;
  float f = 0.006 + 0.004*tw;
  col += vec3(0.86, 1.0, 0.8)*0.0022/(abs(e) + 0.0018)*tw;
  col += ACID*0.0016/(abs(e - f) + 0.0022)*tw;
  col += ROYAL*0.0026/(abs(e + f*1.6) + 0.0026)*tw;
  return col*gain*travel;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  float aspect = uRes.x/uRes.y;

  // glitch: horizontal slice offsets (burst from UI + rare idle blip)
  float rowH = uRes.y*0.028;
  float row = floor(frag.y/rowH);
  float gh = hash(vec2(row, floor(uTime*28.0)));
  float idle = step(0.992, hash(vec2(floor(uTime*2.0), 3.0)))*0.35;
  float gAmt = max(uGlitch, idle);
  frag.x += (gh - 0.5)*uRes.x*0.09*gAmt*step(0.55, gh);

  vec2 p = (frag - 0.5*uRes)/uRes.y;
  float zoom = 1.0 + uScroll*0.3;
  float ca = cos(-0.22); float sa = sin(-0.22);
  vec2 q = mat2(ca, -sa, sa, ca)*p/zoom;

  // pointer lens
  vec2 m = uMouse*0.5*vec2(aspect, 1.0);
  m = mat2(ca, -sa, sa, ca)*m/zoom;
  vec2 dm = q - m;
  float infl = exp(-dot(dm, dm)*6.0);
  q -= dm*infl*0.07;

  float t = uTime*0.35;
  vec2 drift = vec2(sin(t*0.37), cos(t*0.29))*0.05;

  vec3 col = vec3(0.0);
  col += ribbon(q, vec2(-0.35, -1.62) + drift, 2.0 + 0.02*sin(t*0.5), 0.13, 3.0, 0.9, ACID, EMER, 1.0, t);
  col += ribbon(q, vec2(0.45, -2.62) - drift*1.3, 2.86, 0.09, 2.2, -0.7, EMER, ACID, 0.62, t + 3.0);
  col += ribbon(q, vec2(-1.25, 1.95) + drift.yx, 2.32, 0.05, 4.0, 1.2, EMER, ROYAL, 0.34, t + 7.0);

  // brighten near the pointer
  col *= 1.0 + infl*0.55;

  // light writes on left → right during intro
  float reveal = smoothstep(-0.25, 0.05, mix(-aspect*0.7, aspect*0.7 + 0.35, uIntro) - q.x);
  col *= reveal;

  // sparks on the light
  vec2 gp = floor(gl_FragCoord.xy/3.0);
  float s = hash(gp + floor(uTime*7.0));
  col += vec3(0.8, 1.0, 0.7)*step(0.9975, s)*smoothstep(0.05, 0.5, length(col))*0.9;

  // atmosphere: deep navy top → black bottom, faint royal pool bottom-right
  vec3 bg = mix(vec3(0.004, 0.006, 0.014), NAVY*0.95, smoothstep(-0.55, 0.55, p.y + p.x*0.15));
  bg += ROYD*0.22*exp(-dot(p - vec2(aspect*0.45, -0.5), p - vec2(aspect*0.45, -0.5))*3.0);
  float v = smoothstep(1.3, 0.25, length(p*vec2(0.8, 1.05)));

  col = 1.0 - exp(-col*1.35);
  col = bg*mix(0.55, 1.0, v) + col;

  // CRT: fine scanlines + slow rolling band
  float sl = 0.975 + 0.025*sin(gl_FragCoord.y*3.14159/1.5);
  float roll = exp(-pow((fract(vUv.y - uTime*0.045) - 0.5)*12.0, 2.0));
  col *= sl*(1.0 + roll*0.025);

  // grain
  col += (hash(gl_FragCoord.xy + fract(uTime)*91.0) - 0.5)*0.012;

  col *= 1.0 - uScroll*0.7;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

export const PORTRAIT_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uTex;
uniform float uHasTex;
uniform float uImgAspect;
uniform float uReveal;
uniform float uGlitch;
uniform float uHover;
varying vec2 vUv;
${COMMON}

vec2 coverUv(vec2 uv){
  float boxA = uRes.x/uRes.y;
  vec2 s = boxA > uImgAspect ? vec2(1.0, uImgAspect/boxA) : vec2(boxA/uImgAspect, 1.0);
  return (uv - 0.5)*s + 0.5;
}
float lum(vec2 uv){
  uv = clamp(uv, 0.001, 0.999);
  if (uHasTex > 0.5) return dot(texture2D(uTex, coverUv(uv)).rgb, vec3(0.299, 0.587, 0.114));
  // no image yet: an abstract lit silhouette so the frame never looks broken
  vec2 h = (uv - vec2(0.56, 0.64))*vec2(1.0, 0.78);
  float head = smoothstep(0.24, 0.02, length(h));
  vec2 b = (uv - vec2(0.5, 0.05))*vec2(0.8, 1.6);
  float body = smoothstep(0.5, 0.1, length(b));
  float rim = smoothstep(0.4, 0.9, uv.x);
  return (head*0.85 + body*0.55)*(0.35 + 0.65*rim) + fbm(uv*6.0 + uTime*0.1)*0.12;
}

void main(){
  vec2 uv = vUv;
  float t = uTime;
  vec2 px = gl_FragCoord.xy;

  // row-slice glitch
  float rows = 54.0;
  float row = floor(uv.y*rows);
  float gk = hash(vec2(row, floor(t*16.0)));
  float blip = 0.0;
  float burst = max(uGlitch, blip);
  uv.x += (hash(vec2(row, floor(t*24.0))) - 0.5)*0.16*step(0.7, gk)*burst;

  // static streak rows: pixels left of the face copy the face edge → long horizontal streaks
  float sr = hash(vec2(floor(uv.y*140.0), floor(t*0.5)));
  float streak = step(0.994, sr);
  float edge = 0.34 + 0.12*hash(vec2(floor(uv.y*140.0), 2.0));
  uv.x = mix(uv.x, max(uv.x, edge), streak);

  // pointer tear: rows near the pointer smear to the right from the pointer x
  vec2 m = uMouse*0.5 + 0.5;
  float near = exp(-pow((uv.y - m.y)*14.0, 2.0))*uHover;
  float band = step(0.45, hash(vec2(floor(uv.y*110.0), floor(t*9.0))));
  uv.x = mix(uv.x, min(uv.x, m.x), near*band);

  float l = lum(uv);
  float split = 0.004 + 0.018*burst + 0.01*near;
  float lA = lum(uv + vec2(split, 0.0));
  float lB = lum(uv - vec2(split*1.4, 0.0));

  // levels: the source is a low-key photograph — lift shadows so the halftone reads
  #define LV(x) smoothstep(0.012, 0.5, pow(max(x, 0.0), 0.72))
  l = LV(l);

  // halftone (rotated grid, dot radius from luminance)
  float cell = max(4.0, uRes.y/150.0);
  vec2 hp = mat2(0.7071, -0.7071, 0.7071, 0.7071)*px/cell;
  vec2 gv = fract(hp) - 0.5;
  float r = sqrt(l)*0.64;
  float dotm = smoothstep(r + 0.09, r - 0.09, length(gv));
  float tone = mix(dotm*l*1.25, l, smoothstep(0.5, 0.95, l)*0.55);

  // scanlines
  float scan = 0.82 + 0.18*step(0.45, fract(px.y/3.0));
  tone *= scan;

  // duotone ramp: black → navy → emerald → acid → pale
  vec3 col = mix(vec3(0.0), ROYD*0.7, smoothstep(0.0, 0.18, tone));
  col = mix(col, EMER*0.85, smoothstep(0.12, 0.45, tone));
  col = mix(col, ACID, smoothstep(0.4, 0.8, tone));
  col = mix(col, vec3(0.9, 1.0, 0.82), smoothstep(0.88, 1.1, tone)*0.6);

  // RGB-split ghosts in brand hues
  float ga = max(LV(lA) - l, 0.0);
  float gb = max(LV(lB) - l, 0.0);
  col += ACID*ga*1.3 + ROYAL*gb*1.6;

  float alpha = clamp(tone*1.6 + ga + gb, 0.0, 1.0);

  // scan-in reveal from the top with a bright write line
  float y0 = 1.0 - uReveal*1.12;
  alpha *= smoothstep(y0 - 0.004, y0 + 0.004, vUv.y);
  float line = exp(-abs(vUv.y - y0)*160.0)*step(uReveal, 0.999);
  col += ACID*line*1.5; alpha = max(alpha, line*0.9);

  // soft edges so it composites into the scene
  alpha *= smoothstep(0.0, 0.2, vUv.x)*smoothstep(0.0, 0.16, vUv.y)*smoothstep(1.0, 0.94, vUv.y)*smoothstep(1.0, 0.96, vUv.x);

  gl_FragColor = vec4(col, alpha);
}
`

export const WARP_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uText;
uniform float uTextAspect;
uniform float uReady;
uniform float uVel;
uniform float uCalm;
varying vec2 vUv;
${COMMON}

float txt(vec2 uv){
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  return texture2D(uText, uv).r;
}

void main(){
  float aspect = uRes.x/uRes.y;
  vec2 p = (vUv - 0.5)*vec2(aspect, 1.0);
  vec2 m = uMouse*0.5*vec2(aspect, 1.0);
  float t = uTime*0.11;

  // liquid warp field
  vec2 w = vec2(fbm(p*1.5 + vec2(t, -t*0.7)), fbm(p*1.5 + vec2(-t*0.8, t) + 7.3)) - 0.5;

  // pointer swirl + bulge
  vec2 dm = p - m;
  float infl = exp(-dot(dm, dm)*4.5)*(1.0 - uCalm*0.6);
  float ang = infl*(0.8 + uVel*2.2);
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 pw = m + rot*dm*(1.0 - 0.22*infl);
  pw += w*(0.12 + 0.16*uVel);

  vec2 tuv = pw/vec2(aspect, 1.0) + 0.5;
  vec2 s = aspect > uTextAspect ? vec2(1.0, uTextAspect/aspect) : vec2(aspect/uTextAspect, 1.0);
  tuv = (tuv - 0.5)*s + 0.5;

  // variable blur: parts sharp, parts melted
  float bl = 0.0015 + 0.012*smoothstep(0.35, 0.75, fbm(p*0.9 + t*0.6)) + 0.01*infl;
  float a = 0.0;
  for (int i = 0; i < 14; i++){
    float fi = float(i);
    float an = fi*2.39996;
    float rr = sqrt((fi + 0.5)/14.0)*bl;
    a += txt(tuv + vec2(cos(an), sin(an))*rr*vec2(1.0, aspect/uTextAspect));
  }
  a /= 14.0;
  float ghost = txt(tuv + vec2(0.014, -0.01) + w*0.03);

  vec3 col = mix(vec3(0.004, 0.008, 0.02), NAVY*0.55, smoothstep(0.7, -0.4, p.y));
  // faint grid
  vec2 g = abs(fract(gl_FragCoord.xy/(uRes.y/7.0)) - 0.5);
  float grid = smoothstep(0.497, 0.5, max(g.x, g.y));
  col += vec3(0.5, 1.0, 0.6)*grid*0.025;

  vec3 ink = mix(EMER, ACID, smoothstep(0.2, 0.75, a));
  col += ink*a*0.5*uReady;
  col += ROYAL*0.22*ghost*(1.0 - a)*uReady;
  col += ACID*infl*0.06;

  float v = smoothstep(1.25, 0.3, length(p*vec2(0.75, 1.0)));
  col *= mix(0.5, 1.0, v);
  col = 1.0 - exp(-col*1.4);
  col += (hash(gl_FragCoord.xy + fract(uTime)*57.0) - 0.5)*0.04;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`
