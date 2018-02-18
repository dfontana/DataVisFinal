

function generateGraph(interest, decade) {

  d3.queue()
    .defer(d3.json, `http://localhost:8000/tSNE/${decade}/nodes`)
    .defer(d3.json, `http://localhost:8000/tSNE/${decade}/coords`)
    .awaitAll(function(err, results){
      console.log(results)
      let nodes = results[0];
      let coords = results[1];

      let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      d3.select('#network').selectAll('*').remove();
      let dropdown = document.getElementById("networkDropdown");
      let section = dropdown.options[dropdown.selectedIndex].value;

      let svg = d3.select("#network");
      let nodeGroup = svg.append('g').attr("class", "nodes")
      let width = svg.attr("width") - 50;
      let height = svg.attr("height") - 50;

      const zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[0, 0],[width, height]])
      .extent([[0, 0],[width, height]])
      .on("zoom", () => {
        nodeGroup.attr("transform", d3.event.transform)
      });
      svg.call(zoom)


      let xScale = d3.scaleLinear()
        .domain(d3.extent(coords, c => c[0]))
        .range([0, width])
      let yScale = d3.scaleLinear()
        .domain(d3.extent(coords, c => c[1]))
        .range([0, height])
      let rScale = d3.scaleLinear()
        .domain(d3.extent(nodes, n => n[3]))
        .range([4, 10])
      let cScale = d3.scaleSequential(d3.interpolateCool)
        .domain(d3.extent(coords, c => c[2]));
          

      let circles = nodeGroup.selectAll("circle")
        .data(coords)
        .enter().append("circle")
        .attr("r", (d,i) => rScale(nodes[i][3]))
        .attr('fill', d => cScale(d[2]))
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
        .on('mouseover', function (d, i) {
          let m = nodes[i]

          div.transition()
            .duration(200)
            .style("opacity", .9);
  
          let text = m.join('<br>')
          div.html(text)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on('mouseout', function () {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        })

      d3.forceSimulation(coords)
        .force('collision', d3.forceCollide().radius((d, i) => 3))
        .force('home', function(alpha) {
          coords.map(c => {
            c.x += alpha * (xScale(c[0]) - c.x)
            c.y += alpha * (yScale(c[1]) - c.y)
          })
        })
        .on('tick', function(){
          circles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        })

    })
}

window.onload = function () {
  generateGraph(getCurrentSelected(), '1950')
  d3.select('#networkDropdown')
    .on("change", function () {
      generateGraph(getCurrentSelected(), 1950);
    });
};

function getCurrentSelected() {
  let dropdown = document.getElementById("networkDropdown");
  let section = dropdown.options[dropdown.selectedIndex].value;
  return section;
}