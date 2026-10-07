/**
 * Particle target shapes for the home "scope film". Each shape is drawn as line-art on a
 * 1600×900 canvas; particles are sampled from the drawn pixels. The red channel encodes a
 * depth layer (0..1 → back..front) so flat drawings gain parallax when the field rotates.
 */
import mark from './nmyt-mark.json';
const MARK_PATH = (mark as { parts: string[] }).parts.join(' ');

export const CW = 1600;
export const CH = 900;
export const WORLD_W = 11; // canvas width in world units

type Draw = (g: CanvasRenderingContext2D) => void;

const layer = (g: CanvasRenderingContext2D, depth: number, a = 1) => {
  const r = Math.round(depth * 255);
  g.strokeStyle = `rgba(${r},255,255,${a})`;
  g.fillStyle = `rgba(${r},255,255,${a})`;
};

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

const logo: Draw = (g) => {
  const p = new Path2D(MARK_PATH);
  const s = 1150 / 1000;
  g.save();
  g.translate((CW - 1150) / 2, (CH - 365.93 * s) / 2);
  g.scale(s, s);
  layer(g, 0.5, 0.42);
  g.fill(p);
  layer(g, 0.75, 1);
  g.lineWidth = 3.2 / s;
  g.stroke(p);
  g.restore();
};

const website: Draw = (g) => {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  layer(g, 0.35);
  g.lineWidth = 3;
  rr(g, 250, 130, 1100, 650, 24);
  g.stroke();
  g.beginPath();
  g.moveTo(250, 182);
  g.lineTo(1350, 182);
  g.stroke();
  [284, 308, 332].forEach((x) => {
    g.beginPath();
    g.arc(x, 156, 6, 0, Math.PI * 2);
    g.fill();
  });
  g.lineWidth = 2;
  rr(g, 580, 144, 440, 24, 12);
  g.stroke();
  // nav
  layer(g, 0.55, 0.9);
  g.fillRect(300, 214, 70, 12);
  [1020, 1090, 1160].forEach((x) => g.fillRect(x, 216, 48, 8));
  rr(g, 1236, 206, 76, 28, 14);
  g.stroke();
  // hero headline blocks
  layer(g, 0.9, 0.55);
  g.fillRect(300, 290, 500, 34);
  g.fillRect(300, 338, 430, 34);
  g.fillRect(300, 386, 300, 34);
  layer(g, 0.7, 0.5);
  g.fillRect(300, 446, 380, 8);
  g.fillRect(300, 464, 330, 8);
  layer(g, 1, 0.95);
  g.lineWidth = 2.5;
  rr(g, 300, 500, 170, 46, 23);
  g.stroke();
  // image block
  layer(g, 0.6);
  g.lineWidth = 3;
  rr(g, 860, 270, 440, 290, 18);
  g.stroke();
  g.beginPath();
  g.arc(1210, 340, 30, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(880, 530);
  g.lineTo(990, 410);
  g.lineTo(1070, 480);
  g.lineTo(1130, 430);
  g.lineTo(1280, 540);
  g.stroke();
  // cards
  layer(g, 0.8);
  [300, 650, 1000].forEach((x, i) => {
    g.lineWidth = 2.5;
    rr(g, x, 600, 300, 140, 16);
    g.stroke();
    g.fillRect(x + 24, 628, 60, 60);
    g.fillRect(x + 104, 634, 150 - i * 20, 9);
    g.fillRect(x + 104, 656, 120, 7);
    g.fillRect(x + 104, 674, 90 + i * 20, 7);
  });
};

const dashboard: Draw = (g) => {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  layer(g, 0.3);
  g.lineWidth = 3;
  rr(g, 200, 120, 1200, 670, 26);
  g.stroke();
  g.beginPath();
  g.moveTo(400, 120);
  g.lineTo(400, 790);
  g.stroke();
  layer(g, 0.45, 0.9);
  g.fillRect(232, 156, 110, 14);
  for (let i = 0; i < 7; i++) {
    g.fillRect(232, 214 + i * 44, i === 1 ? 140 : 96 + ((i * 37) % 50), 8);
  }
  // KPI tiles
  layer(g, 0.75);
  [430, 750, 1070].forEach((x, i) => {
    g.lineWidth = 2.5;
    rr(g, x, 150, 300, 124, 18);
    g.stroke();
    g.fillRect(x + 24, 176, 80, 8);
    g.fillRect(x + 24, 204, 120 + i * 18, 26);
    g.beginPath();
    for (let k = 0; k <= 10; k++) {
      const px = x + 176 + k * 10;
      const py = 236 - Math.sin(k * 0.8 + i) * 12 - k * (i === 2 ? -1.2 : 2);
      if (k === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.stroke();
  });
  // bar chart
  layer(g, 0.95, 0.85);
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(440, 310);
  g.lineTo(440, 600);
  g.lineTo(1000, 600);
  g.stroke();
  const bars = [0.35, 0.5, 0.42, 0.66, 0.58, 0.74, 0.62, 0.86, 0.78, 0.93, 0.88, 1];
  bars.forEach((h, i) => {
    const bh = h * 250;
    g.fillRect(470 + i * 43, 600 - bh, 24, bh);
  });
  // donut
  layer(g, 0.65);
  g.lineWidth = 18;
  const cx = 1205;
  const cy = 455;
  const segs: [number, number][] = [
    [-1.57, 1.1],
    [1.25, 3.1],
    [3.25, 4.56],
  ];
  segs.forEach(([a, b]) => {
    g.beginPath();
    g.arc(cx, cy, 108, a, b);
    g.stroke();
  });
  g.lineWidth = 2;
  g.beginPath();
  g.arc(cx, cy, 72, 0, Math.PI * 2);
  g.stroke();
  // line chart
  layer(g, 0.85);
  g.lineWidth = 3;
  g.beginPath();
  for (let k = 0; k <= 60; k++) {
    const px = 440 + k * 15.3;
    const py = 720 - (Math.sin(k * 0.23) * 22 + Math.sin(k * 0.61) * 10 + k * 0.9);
    if (k === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.stroke();
  layer(g, 0.4, 0.5);
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(440, 760);
  g.lineTo(1360, 760);
  g.stroke();
};

const viewfinder: Draw = (g) => {
  g.lineCap = 'square';
  const x0 = 180;
  const y0 = 196;
  const w = 1240;
  const h = 518;
  layer(g, 0.9);
  g.lineWidth = 6;
  const L = 90;
  const corners: [number, number, number, number][] = [
    [x0, y0, 1, 1],
    [x0 + w, y0, -1, 1],
    [x0, y0 + h, 1, -1],
    [x0 + w, y0 + h, -1, -1],
  ];
  corners.forEach(([x, y, sx, sy]) => {
    g.beginPath();
    g.moveTo(x + sx * L, y);
    g.lineTo(x, y);
    g.lineTo(x, y + sy * L);
    g.stroke();
  });
  // thirds
  layer(g, 0.3, 0.5);
  g.lineWidth = 1.5;
  g.setLineDash([8, 14]);
  [1, 2].forEach((k) => {
    g.beginPath();
    g.moveTo(x0 + (w * k) / 3, y0 + 20);
    g.lineTo(x0 + (w * k) / 3, y0 + h - 20);
    g.stroke();
    g.beginPath();
    g.moveTo(x0 + 20, y0 + (h * k) / 3);
    g.lineTo(x0 + w - 20, y0 + (h * k) / 3);
    g.stroke();
  });
  g.setLineDash([]);
  // centre reticle
  layer(g, 1);
  g.lineWidth = 3;
  const cx = CW / 2;
  const cy = y0 + h / 2;
  g.beginPath();
  g.arc(cx, cy, 34, 0, Math.PI * 2);
  g.stroke();
  [
    [cx - 70, cy, cx - 44, cy],
    [cx + 44, cy, cx + 70, cy],
    [cx, cy - 70, cx, cy - 44],
    [cx, cy + 44, cx, cy + 70],
  ].forEach(([a, b, c, d]) => {
    g.beginPath();
    g.moveTo(a, b);
    g.lineTo(c, d);
    g.stroke();
  });
  // REC + timecode
  layer(g, 1);
  g.beginPath();
  g.arc(x0 + 44, y0 - 50, 13, 0, Math.PI * 2);
  g.fill();
  g.font = '700 34px ui-monospace, Consolas, monospace';
  g.fillText('REC', x0 + 70, y0 - 38);
  g.fillText('00:00:12:08', CW / 2 - 110, y0 - 38);
  g.fillText('4K  24FPS', x0 + w - 190, y0 - 38);
  // audio meters
  layer(g, 0.7, 0.9);
  for (let i = 0; i < 2; i++) {
    for (let k = 0; k < 16; k++) {
      g.fillRect(x0 + 20 + k * 22, y0 + h + 40 + i * 20, 16, 10);
    }
  }
  // battery + focus
  layer(g, 0.6);
  g.lineWidth = 3;
  rr(g, x0 + w - 110, y0 + h + 38, 90, 36, 6);
  g.stroke();
  g.fillRect(x0 + w - 102, y0 + h + 46, 58, 20);
  g.fillRect(x0 + w - 18, y0 + h + 48, 6, 16);
  g.font = '600 26px ui-monospace, Consolas, monospace';
  g.fillText('ƒ 2.8   1/48   ISO 800', CW / 2 - 170, y0 + h + 66);
};

const aperture: Draw = (g) => {
  const cx = CW / 2;
  const cy = CH / 2;
  g.lineCap = 'round';
  layer(g, 0.2);
  g.lineWidth = 5;
  g.beginPath();
  g.arc(cx, cy, 330, 0, Math.PI * 2);
  g.stroke();
  layer(g, 0.35);
  g.lineWidth = 2;
  g.beginPath();
  g.arc(cx, cy, 300, 0, Math.PI * 2);
  g.stroke();
  // focus scale ticks
  layer(g, 0.45, 0.9);
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    const r1 = 305;
    const r2 = i % 5 === 0 ? 276 : 290;
    g.lineWidth = i % 5 === 0 ? 3 : 1.6;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    g.stroke();
  }
  // iris blades
  const n = 8;
  const R = 250;
  const r = 96;
  layer(g, 0.85);
  g.lineWidth = 3;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    const a2 = a + 1.25;
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(cx + Math.cos(a2) * R, cy + Math.sin(a2) * R);
    g.stroke();
  }
  layer(g, 1);
  g.lineWidth = 3.5;
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.stroke();
  layer(g, 0.6);
  g.lineWidth = 2;
  g.beginPath();
  g.arc(cx, cy, 250, 0, Math.PI * 2);
  g.stroke();
  // flare dots along the diagonal
  layer(g, 1, 0.8);
  [
    [cx + 420, cy - 250, 16],
    [cx + 520, cy - 310, 9],
    [cx - 440, cy + 270, 22],
    [cx - 560, cy + 345, 8],
  ].forEach(([x, y, s]) => {
    g.beginPath();
    g.arc(x, y, s, 0, Math.PI * 2);
    g.stroke();
  });
};

const heart = (g: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  g.beginPath();
  g.moveTo(x, y + s * 0.3);
  g.bezierCurveTo(x, y - s * 0.2, x - s * 0.9, y - s * 0.2, x - s * 0.9, y + s * 0.3);
  g.bezierCurveTo(x - s * 0.9, y + s * 0.75, x - s * 0.2, y + s * 0.95, x, y + s * 1.25);
  g.bezierCurveTo(x + s * 0.2, y + s * 0.95, x + s * 0.9, y + s * 0.75, x + s * 0.9, y + s * 0.3);
  g.bezierCurveTo(x + s * 0.9, y - s * 0.2, x, y - s * 0.2, x, y + s * 0.3);
  g.stroke();
};

const social: Draw = (g) => {
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const x = 612;
  const y = 70;
  const w = 376;
  const h = 770;
  layer(g, 0.5);
  g.lineWidth = 5;
  rr(g, x, y, w, h, 56);
  g.stroke();
  rr(g, x + 138, y + 22, 100, 24, 12);
  g.fill();
  // stories bar
  layer(g, 0.8);
  for (let i = 0; i < 4; i++) g.fillRect(x + 30 + i * 82, y + 70, 72, 5);
  // media
  layer(g, 0.65);
  g.lineWidth = 3;
  rr(g, x + 26, y + 100, w - 52, 470, 24);
  g.stroke();
  layer(g, 1);
  g.beginPath();
  g.moveTo(x + w / 2 - 34, y + 290);
  g.lineTo(x + w / 2 + 44, y + 335);
  g.lineTo(x + w / 2 - 34, y + 380);
  g.closePath();
  g.stroke();
  // side actions
  layer(g, 0.95);
  g.lineWidth = 3.2;
  heart(g, x + w - 62, y + 598, 22);
  g.beginPath();
  g.arc(x + w - 62, y + 668, 20, 0.3, Math.PI * 2 - 0.3);
  g.stroke();
  g.beginPath();
  g.moveTo(x + w - 80, y + 724);
  g.lineTo(x + w - 44, y + 710);
  g.lineTo(x + w - 58, y + 742);
  g.stroke();
  // caption
  layer(g, 0.7, 0.85);
  g.fillRect(x + 30, y + 606, 170, 12);
  g.fillRect(x + 30, y + 632, 230, 8);
  g.fillRect(x + 30, y + 650, 190, 8);
  // floating hearts & reach bars outside the phone
  layer(g, 1);
  g.lineWidth = 3;
  [
    [x - 160, y + 180, 26],
    [x - 250, y + 360, 16],
    [x - 120, y + 520, 20],
    [x + w + 170, y + 220, 20],
    [x + w + 260, y + 420, 30],
  ].forEach(([a, b, s]) => heart(g, a, b, s));
  layer(g, 0.35, 0.9);
  [0.3, 0.45, 0.4, 0.62, 0.75, 0.9].forEach((v, i) => g.fillRect(x + w + 110 + i * 34, y + 700 - v * 170, 20, v * 170));
};

const reel: Draw = (g) => {
  g.lineCap = 'round';
  const cx = 470;
  const cy = 420;
  layer(g, 0.45);
  g.lineWidth = 5;
  g.beginPath();
  g.arc(cx, cy, 230, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.beginPath();
    g.arc(cx + Math.cos(a) * 128, cy + Math.sin(a) * 128, 52, 0, Math.PI * 2);
    g.stroke();
  }
  g.beginPath();
  g.arc(cx, cy, 30, 0, Math.PI * 2);
  g.stroke();
  // strip leaving the reel
  const pts: [number, number][] = [];
  for (let k = 0; k <= 160; k++) {
    const t = k / 160;
    const px = cx + 40 + t * 1060;
    const py = cy + 230 - Math.sin(t * Math.PI * 1.4) * 120 * t - t * 60;
    pts.push([px, py]);
  }
  const off = (k: number, d: number): [number, number] => {
    const a = pts[Math.max(0, k - 1)];
    const b = pts[Math.min(pts.length - 1, k + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [pts[k][0] - (dy / l) * d, pts[k][1] + (dx / l) * d];
  };
  layer(g, 0.8);
  g.lineWidth = 3;
  [-70, 70].forEach((d) => {
    g.beginPath();
    pts.forEach((_, k) => {
      const [px, py] = off(k, d);
      if (k === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    });
    g.stroke();
  });
  // sprockets + frame dividers
  layer(g, 1, 0.95);
  for (let k = 4; k < pts.length - 2; k += 4) {
    [-54, 54].forEach((d) => {
      const [px, py] = off(k, d);
      g.fillRect(px - 5, py - 5, 10, 10);
    });
  }
  g.lineWidth = 2;
  for (let k = 20; k < pts.length - 4; k += 28) {
    const [ax, ay] = off(k, -40);
    const [bx, by] = off(k, 40);
    g.beginPath();
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    g.stroke();
  }
  // play mark at the end frame
  layer(g, 1);
  g.lineWidth = 4;
  const [ex, ey] = pts[132];
  g.beginPath();
  g.moveTo(ex - 18, ey - 26);
  g.lineTo(ex + 26, ey);
  g.lineTo(ex - 18, ey + 26);
  g.closePath();
  g.stroke();
};

export const SHAPES: Draw[] = [logo, website, dashboard, viewfinder, aperture, social, reel];

/** Sample `count` points (xyz) from each shape. Weighted by drawn alpha. */
export function sampleShapes(count: number, seed = 1): Float32Array[] {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const canvas = document.createElement('canvas');
  canvas.width = CW;
  canvas.height = CH;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  const k = WORLD_W / CW;
  return SHAPES.map((draw) => {
    g.clearRect(0, 0, CW, CH);
    g.save();
    draw(g);
    g.restore();
    const { data } = g.getImageData(0, 0, CW, CH);
    // collect candidate pixels on a 2px lattice for speed
    const xs: number[] = [];
    const ys: number[] = [];
    const ws: number[] = [];
    const ds: number[] = [];
    let total = 0;
    for (let y = 0; y < CH; y += 2) {
      for (let x = 0; x < CW; x += 2) {
        const i = (y * CW + x) * 4;
        const a = data[i + 3];
        if (a > 8) {
          xs.push(x);
          ys.push(y);
          ds.push(data[i] / 255);
          total += a;
          ws.push(total);
        }
      }
    }
    const out = new Float32Array(count * 3);
    for (let n = 0; n < count; n++) {
      const r = rnd() * total;
      let lo = 0;
      let hi = ws.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (ws[mid] < r) lo = mid + 1;
        else hi = mid;
      }
      const px = xs[lo] + (rnd() - 0.5) * 2.2;
      const py = ys[lo] + (rnd() - 0.5) * 2.2;
      out[n * 3] = (px - CW / 2) * k;
      out[n * 3 + 1] = -(py - CH / 2) * k;
      out[n * 3 + 2] = (ds[lo] - 0.5) * 1.6 + (rnd() - 0.5) * 0.12;
    }
    return out;
  });
}
