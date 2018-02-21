let buildTSNE = (svgroot) => {
  const margins = { left: 100, right: 100, top: 50}
  const width = svgroot.node().getBoundingClientRect().width - margins.left;
  const height = svgroot.node().getBoundingClientRect().height - margins.right;
  let circles, xScale, yScale, rScale, cScale;

  // Attach a tooltip div to the DOM
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Place all nodes inside a group in the SVG, for centering
  const g = svgroot.append('g')
    .attr("class", "nodes")
    .style('transform', `translate(${margins.top}px, ${margins.left/2}px)`)

  // Build the zooming effect for the page
  const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([[0, 0],[width, height]])
    .extent([[0, 0],[width, height]])
    .on("zoom", () => {
      g.attr("transform", d3.event.transform)
    });
  svgroot.call(zoom)

  // Declare the Force
  const force = d3.forceSimulation()
    .force('collision', d3.forceCollide().radius((d, i) => 3).strength(0.9))
    .on('tick', function(){
      circles
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    })
    .stop()

  /**
   * When executed, will merge the existing DOM elements with new data,
   * updating their backing structure rather than rebuilding them from 
   * scratch. Will execute the Join, Exit, Update, Enter pattern.
   * 
   * @param {Array} nodes Data with details about each index in coords
   * @param {Array} coords Array of points in space
   */
  const update = (nodes, coords) => {
    // Join & Exit the old data
    circles = g.selectAll(".node").data(coords)
    circles.exit().remove()

    // Update existing nodes
    let setAttrs = (selection) => {
      selection.attr('class', (d, i) => `group-${nodes[i][10]} node`)
        .attr("r", (d,i) => rScale(nodes[i][3]))
        .attr('fill', d => cScale(d[2]))
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
    };
    setAttrs(circles)

    // Enter the new datapoints
    let enterCircles = g.selectAll("circle")
      .data(coords)
      .enter().append("circle")
      .on('mouseover', function (d, i) {
        d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`).style('stroke', 'black')

        let text = nodes[i].join('<br>')
        tooltip.html(text)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .transition()
          .duration(200)
          .style("opacity", .9)
      })
      .on('mouseout', function () {
        d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`).style('stroke', 'white')
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
    setAttrs(enterCircles)

    // Update + Enter
    circles = enterCircles.merge(circles)
  }

  /**
   * When executed, will redefine the Vis's scales based on the new
   * data, update the DOM, and then rekindle the force to resolve 
   * collisions and positioning.
   * 
   * @param {Array} nodes Data with details about each index in coords
   * @param {Array} coords Array of points in space
   */
  let newDecade = (nodes, coords) => {
    // Set the new position, radius, and color scales
    xScale = d3.scaleLinear()
      .domain(d3.extent(coords, c => c[0]))
      .range([0, width])
    yScale = d3.scaleLinear()
      .domain(d3.extent(coords, c => c[1]))
      .range([0, height])
    rScale = d3.scaleLinear()
      .domain(d3.extent(nodes, n => n[3]))
      .range([4, 10])
    cScale = d3.scaleSequential(d3.interpolateCool)
      .domain(d3.extent(coords, c => c[2]));

    // Update the DOM
    update(nodes, coords)

    // Rekindle the Force
    force.nodes(coords)
    force.force('home', function(alpha) {
      coords.map(c => {
        c.x += alpha * (xScale(c[0]) - c.x)
        c.y += alpha * (yScale(c[1]) - c.y)
      })
    })
    force.alpha(1).restart()
  }

  /**
   * When the decade changes, will request next set of data and swap the Vis over
   * for the newly found data.
   */
  dispatch.on('decade-update.tSNE', (decade) => {
    console.log("Changing decade!", decade)
    d3.queue()
    .defer(d3.json, `http://localhost:8000/tSNE/${decade}/nodes`)
    .defer(d3.json, `http://localhost:8000/tSNE/${decade}/coords`)
    .awaitAll(function(err, data){
      if(err) return
      let [nodes, coords] = data;
      newDecade(nodes, coords)
    })
  })
}
