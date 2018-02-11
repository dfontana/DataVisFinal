function getNetworkData() {
  return new Promise( (resolve, reject) => {
    d3.json('http://localhost:8000/networkdata', function(data) {
      resolve(data);
    });
  });
}

function getNetworkSize() {
  return new Promise( (resolve, reject) => {
    d3.json('http://localhost:8000/networksize', function(data) {
      resolve(data);
    });
  })
}

function getNetworkSummary(){
  return new Promise( (resolve, reject) => {
    d3.json('http://localhost:8000/networksummary', function(data) {
      resolve(data);
    });
  })
}

var links = getNetworkData().then((data => {
  return data;
}))

var nodes = getNetworkSize().then((data) => {
  return data;
})

Promise.all([nodes, links]).then((values) => {
  var nodes = values[0];
  var links = values[1];
  var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  
  var decade = 2020;
  console.log(nodes[decade]);
  console.log(links[decade]);

  var testLink = [{source: 1, target: 9},{source: 1, target: 10}, {source: 10, target: 11},{source: 11, target: 8} ]
 

  
  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

    var link = 
    svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links[decade])
    .enter()
    .append("line")
    .attr("stroke-width", function(d) {
      return d.keywords.length || 0; 
    })

    var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes[decade])
    .enter().append("circle")
      .attr("r", function(d) { return d.value; })
      .attr("fill", function(d) { return color(d.id); })
      // .call(d3.drag()
      //     .on("start", dragstarted)
      //     .on("drag", dragged)
      //     .on("end", dragended));

    node.append("title")
    .text(function(d) { return d.id; });
    
    simulation
    .nodes(nodes[decade])
    .on("tick", ticked);

    simulation
    .force("link")
    .links(links[decade]);
      
    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    
      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }
})



function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}