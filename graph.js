const svg = d3.select("svg");
const width = window.innerWidth;
const height = window.innerHeight;

const svgGroup = svg.append("g");

const zoom = d3.zoom()
  .scaleExtent([0.5, 4])
  .on("zoom", (event) => {
    svgGroup.attr("transform", event.transform);
  });

svg.call(zoom);

let link;
let node;

d3.json("angkor-knowledge.json").then(data => {

  const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.id).distance(130))
    .force("charge", d3.forceManyBody().strength(-350))
    .force("center", d3.forceCenter(width / 2, height / 2));

  link = svgGroup.append("g")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("class", "link");

  node = svgGroup.append("g")
    .selectAll(".node")
    .data(data.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    );

  node.append("circle")
    .attr("r", 18);

  node.append("text")
    .attr("x", 22)
    .attr("y", 4)
    .text(d => d.id);

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
  });

  // default route
  showRoute("equinox");

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

});

window.showRoute = function(route) {

  document.querySelectorAll("button").forEach(btn => {
    btn.classList.remove("active");
  });

  event.target.classList.add("active");

  link
    .style("opacity", d => d.route === route ? 1 : 0.1);

  node
    .style("opacity", d => {
      const connected = link
        .filter(l => l.route === route)
        .data()
        .some(l => l.source.id === d.id || l.target.id === d.id);

      return connected ? 1 : 0.2;
    });
};
