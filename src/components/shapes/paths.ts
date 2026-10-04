/** Deterministic randomness so every item keeps its own silhouette. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Pt = [number, number];
const f = (n: number) => n.toFixed(1);

/** Points on a rounded-rectangle-ish superellipse, spaced evenly by arc length. */
function superellipse(cx: number, cy: number, a: number, b: number, exp: number, count: number, jitter: number, rand: () => number): Pt[] {
  const dense: Pt[] = [];
  const samples = 360;
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2 - Math.PI / 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    dense.push([cx + a * Math.sign(c) * Math.abs(c) ** (2 / exp), cy + b * Math.sign(s) * Math.abs(s) ** (2 / exp)]);
  }
  const lengths = [0];
  for (let i = 1; i <= samples; i++) {
    const [x0, y0] = dense[i - 1];
    const [x1, y1] = dense[i % samples];
    lengths.push(lengths[i - 1] + Math.hypot(x1 - x0, y1 - y0));
  }
  const total = lengths[samples];
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = ((k + (rand() - 0.5) * jitter) / count) * total;
    while (j < samples - 1 && lengths[j + 1] < target) j++;
    out.push(dense[Math.max(0, j) % samples]);
  }
  return out;
}

/** Scalloped thought-cloud outline that fits inside w×h. */
export function cloudPath(w: number, h: number, seed: number, bump = 20): string {
  const rand = rng(seed);
  const p = Math.min(bump, h * 0.22, w * 0.18);
  const a = w / 2 - p;
  const b = h / 2 - p;
  const approxPerimeter = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  const count = Math.max(9, Math.round(approxPerimeter / (p * 1.75)));
  const pts = superellipse(w / 2, h / 2, a, b, 3.2, count, 0.35, rand);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const r = Math.hypot(x1 - x0, y1 - y0) * (0.55 + rand() * 0.12);
    d += ` A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y1)}`;
  }
  return `${d}Z`;
}

/** Smooth, slightly lumpy pebble outline (Catmull-Rom through jittered points). */
export function blobPath(w: number, h: number, seed: number, points = 9, wobble = 0.05): string {
  const rand = rng(seed);
  const m = 5;
  const raw = superellipse(w / 2, h / 2, w / 2 - m, h / 2 - m, 4.2, points, 0.25, rand);
  const pts: Pt[] = raw.map(([x, y]) => {
    const k = 1 - rand() * wobble;
    return [w / 2 + (x - w / 2) * k, h / 2 + (y - h / 2) * k];
  });
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}
