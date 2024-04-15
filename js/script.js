import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let season = 2024;
let team = "MIA";
let container = document.querySelector("#container");

let teams = [];
let games = [];

async function load(season, team) {
  teams = await d3.csv(`data/${season}-teams.csv`);
  games = await d3.csv(`data/${season}-${team}-viz.csv`);

  create();
}

load(season, team);

function create() {
  console.log(teams, games);

  // Chart dimensions and margins
  const width = 768;
  const height = 576;
  const marginTop = 48;
  const marginRight = 48;
  const marginBottom = 48;
  const marginLeft = 48;

  const svgWidth = width + marginLeft + marginRight;
  const svgHeight = height + marginTop + marginBottom;

  // Append the SVG element to the container
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${marginLeft},${marginTop})`);

  // Define scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max([3480, ...games.map((d) => +d.elapsedTime)])]) // Ensure the scale covers all necessary values
    .range([0, width]);

  const maxPointDiff = d3.max(games, (d) => Math.abs(+d.pointDifference));
  const yScale = d3
    .scaleLinear()
    .domain([-maxPointDiff, maxPointDiff])
    .range([height, 0]);

  // Define the stepped line generator
  const line = d3
    .line()
    .x((d) => xScale(+d.elapsedTime))
    .y((d) => yScale(+d.pointDifference))
    .curve(d3.curveStepAfter); // This creates a stepped appearance

  // Group data by the 'id' property
  const dataNest = d3.group(games, (d) => d.id);

  // Append a 'g' for each unique id and draw paths
  svg
    .selectAll(".line")
    .data(dataNest)
    .join("g")
    .attr("class", "line")
    .append("path")
    .attr("d", (d) => line(d[1]))
    .attr("fill", "none")
    .attr("stroke", () => `hsla(0, 0%, 0%, .1)`)
    .attr("stroke-width", 2);

  // Add X Axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues([0, 720, 1440, 2160, 2880, 3180, 3480])
    .tickFormat(d3.format("d")); // Display as integers
  svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

  // Add labels for quarters and overtimes
  const periodLabels = ["Q1", "Q2", "Q3", "Q4", "OT1", "OT2"];
  const tickPositions = [360, 1080, 1800, 2520, 3030, 3330]; // Midpoints for labels

  tickPositions.forEach((pos, i) => {
    svg
      .append("text")
      .attr("x", xScale(pos))
      .attr("y", height + 30) // Adjust as necessary
      .attr("text-anchor", "middle")
      .text(periodLabels[i]);
  });

  // Add Y Axis
  svg.append("g").call(d3.axisLeft(yScale));
}
