function getNetworkLinks(interest, decade) {
  return new Promise((resolve, reject) => {
    d3.json(`http://localhost:8000/${decade}/${interest}/link`, function (data) {
      resolve(reformLinks(data));
    });
  });
}

function findIndex(array, item) {
  if (array === undefined) return -1
  return array.indexOf(e => e.target === item)
}

/**
 * Reconstructs the links backed by the compact link
 * storage algorithm.
 */
function reformLinks(keywordLinks) {
  links = {}
  Object.keys(keywordLinks).map(kID => {
    let nodes = keywordLinks[kID]
    for (let i = 0; i < nodes.length; i++) {
      let movieID = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        let otherID = nodes[j]

        let oIDidx = findIndex(links[movieID], otherID)
        if (oIDidx !== -1) {
          links[movieID][oIDidx].keywords.push(kID)
          continue;
        }

        let mIDidx = findIndex(links[otherID], movieID)
        if (mIDidx !== -1) {
          links[otherID][mIDidx].keywords.push(kID)
          continue;
        }

        // Link doesn't exist yet, add it.
        links[movieID] = (links[movieID] || [])
        links[movieID].push({
          source: movieID,
          target: otherID,
          keywords: [kID]
        })
      }
    }
  })
  return Object.keys(links).reduce((acc, mID) => [...acc, ...links[mID]], [])
}

function getNetworkNodes(interest, decade) {
  return new Promise((resolve, reject) => {
    d3.json(`http://localhost:8000/${decade}/${interest}/size`, function (data) {

      console.log(Object.keys(data))
      let reshape = Object.keys(data.nodemap).reduce((acc, mID) => {
        acc.push({
          id: mID,
          value: data.nodemap[mID],
          name: data.namemap[mID]
        })
        return acc;
      }, [])

      data.nodemap = reshape;
      resolve(data.nodemap);
    });
  })
}

function getKeywordMap() {
  return new Promise((resolve, reject) => {
    d3.json('http://localhost:8000/wordmap', function (data) {
      resolve(data);
    });
  })
}

function generateGraph(interest, decade) {
  let links = getNetworkLinks(interest, decade);
  let nodes = getNetworkNodes(interest, decade);

  Promise.all([nodes, links]).then((values) => {
    console.log(values);
    d3.select('#network').selectAll('*').remove();
    let dropdown = document.getElementById("networkDropdown");
    let section = dropdown.options[dropdown.selectedIndex].value;

    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let nodes = values[0];
    let links = values[1];
    let svg = d3.select("#network");
    let width = svg.attr("width");
    let height = svg.attr("height");
    let color = d3.scaleOrdinal(d3.schemeCategory20);
    // let decade = decade;


    let simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("gravity", d3.forceManyBody(150))
      .force("x", d3.forceX().strength(.3))
      .force("y", d3.forceY().strength(.3))
      .stop();

    for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      simulation.tick();
    }

    let thickScale = d3.scaleLinear()
      .domain(d3.extent(links, n => n.keywords.length))
      .range([1, 5])

    let link =
      svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .style('stroke', 'black')
      .style("stroke-width", d => thickScale(d.keywords.length))
      .style('opacity', '0.1')
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .on('mouseover', function (d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);

        let text = d.keywords.join('<br>')
        div.html(text)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on('mouseout', function () {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })

    let rScale = d3.scaleLinear()
      .domain(d3.extent(nodes, n => n.value))
      .range([4, 10])

    let node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => rScale(d.value))
      .attr("fill", d => color(d.id))
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .style('stroke', 'black')
      .on('mouseover', function (d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);

        // let html = '';
        // Object.keys(d.toolTip).forEach((obj) => {
        //   let toShow = d.toolTip[obj];
        //   Object.keys(toShow).forEach((tool) => {
        //     html += capitalize(tool) + ": " + toShow[tool] + "</br>";
        //   });
        // });

        div.html(`Title: ${d.name}</br>`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on('mouseout', function () {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })

    // node.append("title")
    //   .text(d => d.id);

    //     simulation
    //     .nodes(nodes)
    //     .on("tick", ticked);

    //     simulation
    //     .force("link")
    //     .links(links);


    //     function ticked() {
    //       link
    //           .attr("x1", function(d) { return d.source.x; })
    //           .attr("y1", function(d) { return d.source.y; })
    //           .attr("x2", function(d) { return d.target.x; })
    //           .attr("y2", function(d) { return d.target.y; });

    //       node
    //           .attr("cx", function(d) { return d.x; })
    //           .attr("cy", function(d) { return d.y; });
    //     }
  })
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
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