// cluster_elections.js — CommonJS, no ml-kmeans needed
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
require('chart.js/auto');
const fs = require('fs/promises');
const path = require('path');

/* ---------- helpers ---------- */
const dist2 = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
};

function mean(points) {
  if (points.length === 0) return null;
  const d = points[0].length;
  const c = new Array(d).fill(0);
  for (const p of points) for (let i = 0; i < d; i++) c[i] += p[i];
  for (let i = 0; i < d; i++) c[i] /= points.length;
  return c;
}

/** Simple k-means with k-means++ init. Works for n-D points. */
function kmeans(points, k, { maxIters = 100 } = {}) {
  if (points.length < k) throw new Error('k > number of points');
  const D = points[0].length;

  // k-means++ initialization
  const centers = [];
  centers.push(points[Math.floor(Math.random() * points.length)]);
  while (centers.length < k) {
    const d2 = points.map(p => {
      let min = Infinity;
      for (const c of centers) {
        const dx = dist2(p, c);
        if (dx < min) min = dx;
      }
      return min ** 2;
    });
    const sum = d2.reduce((a, b) => a + b, 0);
    const r = Math.random() * sum;
    let acc = 0, idx = 0;
    for (; idx < d2.length; idx++) { acc += d2[idx]; if (acc >= r) break; }
    centers.push(points[Math.min(idx, points.length - 1)]);
  }

  let labels = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIters; iter++) {
    // assign
    let changed = false;
    for (let i = 0; i < points.length; i++) {
      let best = 0, bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist2(points[i], centers[c]);
        if (d < bestD) { bestD = d; best = c; }
      }
      if (labels[i] !== best) { labels[i] = best; changed = true; }
    }
    // recompute centers
    const buckets = Array.from({ length: k }, () => []);
    for (let i = 0; i < points.length; i++) buckets[labels[i]].push(points[i]);

    const newCenters = centers.map((_, c) => mean(buckets[c]) || centers[c]);

    // check movement
    let moved = 0;
    for (let c = 0; c < k; c++) moved += dist2(centers[c], newCenters[c]);
    centers.splice(0, k, ...newCenters);

    if (!changed || moved < 1e-6) break;
  }

  return { labels, centers };
}

/* ---------- your data ---------- */
const elections = [
  { candidateA: 120, candidateB:  90, candidateC:  60, winner: 'A' },
  { candidateA: 150, candidateB: 180, candidateC: 100, winner: 'B' },
  { candidateA: 200, candidateB: 190, candidateC: 210, winner: 'C' },
  { candidateA:  90, candidateB: 140, candidateC: 130, winner: 'B' },
  { candidateA: 300, candidateB: 280, candidateC: 250, winner: 'A' },
  { candidateA: 170, candidateB: 150, candidateC: 100, winner: 'A' },
  { candidateA: 130, candidateB: 160, candidateC: 180, winner: 'C' },
  { candidateA: 220, candidateB: 200, candidateC: 210, winner: 'C' },
];
const newElection = { candidateA: 180, candidateB: 200, candidateC: 170 };

const X = elections.map(e => [e.candidateA, e.candidateB, e.candidateC]);
const xNew = [newElection.candidateA, newElection.candidateB, newElection.candidateC];

/* ---------- run k-means in 3D ---------- */
const k = 3;
const { labels, centers } = kmeans(X, k);
let newCluster = 0, bestD = Infinity;
for (let c = 0; c < centers.length; c++) {
  const d = dist2(xNew, centers[c]);
  if (d < bestD) { bestD = d; newCluster = c; }
}
console.log(`Assigned new election → Cluster ${newCluster + 1}`);

/* ---------- plot A vs B (2D view) ---------- */
const palette = [
  'rgba(99,102,241,0.9)',   // Cluster 1
  'rgba(16,185,129,0.9)',   // Cluster 2
  'rgba(244,114,182,0.9)',  // Cluster 3
  'rgba(251,146,60,0.9)',   // extra
];

// datasets by cluster
const datasets = Array.from({ length: k }, (_, ci) => {
  const pts = X
    .map((p, i) => ({ i, p }))
    .filter(({ i }) => labels[i] === ci)
    .map(({ i, p }) => ({
      x: p[0], y: p[1],
      _label: `Election ${i + 1} (A:${p[0]}, B:${p[1]}, C:${p[2]}, win:${elections[i].winner})`
    }));
  return {
    type: 'scatter',
    label: `Cluster ${ci + 1}`,
    data: pts,
    pointRadius: 5,
    pointHoverRadius: 6,
    backgroundColor: palette[ci % palette.length]
  };
});

// new election point
datasets.push({
  type: 'scatter',
  label: `New Election (→ Cluster ${newCluster + 1})`,
  data: [{ x: xNew[0], y: xNew[1], _label: `New (A:${xNew[0]}, B:${xNew[1]}, C:${xNew[2]})` }],
  pointRadius: 7,
  pointHoverRadius: 8,
  backgroundColor: 'rgba(239,68,68,0.95)',
  borderColor: 'rgba(0,0,0,0.6)',
  borderWidth: 1
});

// centroids (project to A,B plane)
datasets.push({
  type: 'scatter',
  label: 'Centroids (A,B)',
  data: centers.map((c, i) => ({ x: c[0], y: c[1], _label: `Centroid ${i + 1}` })),
  pointRadius: 8,
  pointHoverRadius: 9,
  backgroundColor: 'rgba(0,0,0,0.85)',
  pointStyle: 'triangle'
});

/* ---------- render chart ---------- */
(async () => {
  const width = 860, height = 560;
  const canvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

  const config = {
    type: 'scatter',
    data: { datasets },
    options: {
      plugins: {
        title: {
          display: true,
          text: `K-means Clusters (A vs B) · New → Cluster ${newCluster + 1}`,
          font: { size: 18 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.raw?._label ??
              `(${ctx.parsed.x.toFixed(1)}, ${ctx.parsed.y.toFixed(1)})`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Candidate A votes' }, grid: { color: 'rgba(0,0,0,0.08)' } },
        y: { title: { display: true, text: 'Candidate B votes' }, grid: { color: 'rgba(0,0,0,0.08)' } }
      }
    }
  };

  const buffer = await canvas.renderToBuffer(config);
  const outPath = path.resolve(__dirname, 'election_clusters.png');
  await fs.writeFile(outPath, buffer);
  console.log('✅ Saved chart:', outPath);
})().catch(err => console.error('❌ Failed:', err));
