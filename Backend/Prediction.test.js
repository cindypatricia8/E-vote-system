const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");

// --- Step 1: Past election data ---
const elections = [
  { candidateA: 120, candidateB: 90, candidateC: 60, winner: "A" },
  { candidateA: 150, candidateB: 180, candidateC: 100, winner: "B" },
  { candidateA: 200, candidateB: 190, candidateC: 210, winner: "C" },
  { candidateA: 90, candidateB: 140, candidateC: 130, winner: "B" },
  { candidateA: 300, candidateB: 280, candidateC: 250, winner: "A" },
  { candidateA: 170, candidateB: 150, candidateC: 100, winner: "A" },
  { candidateA: 130, candidateB: 160, candidateC: 180, winner: "C" },
  { candidateA: 220, candidateB: 200, candidateC: 210, winner: "C" },
];

// --- Step 2: Calculate average performance ---
const totals = { A: 0, B: 0, C: 0 };
const counts = { A: 0, B: 0, C: 0 };

for (const e of elections) {
  totals.A += e.candidateA;
  totals.B += e.candidateB;
  totals.C += e.candidateC;
  counts.A++;
  counts.B++;
  counts.C++;
}

const averages = {
  A: totals.A / counts.A,
  B: totals.B / counts.B,
  C: totals.C / counts.C,
};

// --- Step 3: Predict based on new election data ---
const newElection = { candidateA: 180, candidateB: 200, candidateC: 170 };

// We'll assume the winner is whoever performs best relative to their average
const performanceRatios = {
  A: newElection.candidateA / averages.A,
  B: newElection.candidateB / averages.B,
  C: newElection.candidateC / averages.C,
};

const predictedWinner = Object.keys(performanceRatios).reduce((a, b) =>
  performanceRatios[a] > performanceRatios[b] ? a : b
);

console.log(`✅ Predicted Winner: Candidate ${predictedWinner}`);

// --- Step 4: Create chart ---
async function createChart() {
  const width = 700;
  const height = 450;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const candidates = Object.keys(newElection);
  const votes = Object.values(newElection);

  const colors = candidates.map(c =>
    c === `candidate${predictedWinner}` ? "rgba(255, 99, 132, 0.8)" : "rgba(54, 162, 235, 0.6)"
  );

  const data = {
    labels: candidates,
    datasets: [{
      label: "Vote Counts (Predicted Election)",
      data: votes,
      backgroundColor: colors,
      borderWidth: 2,
      borderColor: "black"
    }]
  };

  const configuration = {
    type: "bar",
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: `Predicted Winner: Candidate ${predictedWinner}`,
          font: { size: 20 }
        },
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Votes" } },
        x: { title: { display: true, text: "Candidates" } }
      }
    }
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync("predicted_winner_chart.png", image);
  console.log("📊 Chart saved as predicted_winner_chart.png");
}

createChart();
