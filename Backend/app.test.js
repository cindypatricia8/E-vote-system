const { kmeans } = require("ml-kmeans");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const docs = [
  { voterId: "1", counter: 0 },
  { voterId: "2", counter: 0 },
  { voterId: "3", counter: 1 },
  { voterId: "4", counter: 1 },
  { voterId: "5", counter: 2 },
  { voterId: "6", counter: 2 },
];

async function runTestAndGraph() {
  const votes = docs.map(doc => [doc.counter]);
  const k = 3;
  const result = kmeans(votes, k);

  // Create chart
  const width = 600;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const data = {
    labels: docs.map(d => d.voterId),
    datasets: [{
      label: "Votes",
      data: votes.map((v, i) => ({ x: i+1, y: v[0], cluster: result.clusters[i] })),
      backgroundColor: votes.map((_, i) => {
        const colors = ["red", "green", "blue"];
        return colors[result.clusters[i]];
      }),
      type: 'scatter'
    }]
  };

  const configuration = {
    type: "scatter",
    data: data,
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { title: { display: true, text: "Voter Index" } },
        y: { title: { display: true, text: "Vote Counter" } }
      }
    }
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  require("fs").writeFileSync("clusters.png", image);
  console.log("Graph saved as clusters.png");
}

runTestAndGraph();
