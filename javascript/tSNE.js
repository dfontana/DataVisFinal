let buildTSNE = (svgroot) => {
  const margins = { left: 100, right: 100, top: 50}
  const rootbounds = svgroot.node().getBoundingClientRect()
  const width = rootbounds.width - margins.left;
  const height = rootbounds.height - margins.right;
  let circles, pointers, xScale, yScale, rScale, cScale;

  // Keyword for Cluster Group
  let keywordGroup = svgroot.append('g')
    .style('transform', `translate(${width-50}px, 30px)`)

  // Attach a tooltip div to the DOM
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Place all nodes inside a group in the SVG, for centering
  const nodecenter = svgroot.append('g')
    .style('transform', `translate(${margins.top}px, ${margins.left/2}px)`)

  const g = nodecenter.append('g')
    .attr("class", "nodes")

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
      selection.attr('class', (d, i) => `group-${nodes[i].cluster} node`)
        .attr("r", (d,i) => rScale(nodes[i].weighted_vote))
        .attr('fill', d => cScale(d[2]))
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
    };
    setAttrs(circles)

    // Enter the new datapoints
    let enterCircles = circles
      .enter().append("circle")
      .on('mouseover', function (d, i) {
        d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`).style('stroke', 'black')

        nodes[i].clusterwords.forEach((d, i) => {
          if(d != ""){
            keywordGroup.append('text')
                        .attr('class', 'keywordForGroup')
                        .attr('y', `${i * 23}px`)
                        .text(d)
          }
        })
        
        tooltip.html(`Title: ${nodes[i].title}<br>\
        Genre: ${nodes[i].genre}<br>\
        Lead 1: ${nodes[i].lead1}<br>\
        Lead 2: ${nodes[i].lead2}<br>\
        Lead 3: ${nodes[i].lead3}<br>\
        Rating: ${nodes[i].weighted_vote}<br>\
        Studio: ${nodes[i].studio}<br>\
        Runtime: ${nodes[i].runtime}<br>\
        Keywords: ${nodes[i].keywords}<br>`)


        let bounds = tooltip.node().getBoundingClientRect()
        let spillX = (d3.event.pageX + bounds.width) > rootbounds.right
        let spillY = (d3.event.pageY - 28 + bounds.height) > rootbounds.bottom
        let x =  spillX ? d3.event.pageX - bounds.width : d3.event.pageX
        let y =  spillY ? d3.event.pageY - bounds.height :  d3.event.pageY - 28
        
        tooltip.style("left", x + "px")
          .style("top", y + "px")
          .transition()
          .duration(200)
          .style("opacity", .9)
      })
      .on('mouseout', function () {
        d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`).style('stroke', 'white')

        d3.selectAll('.keywordForGroup').remove()

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
      .domain(d3.extent(nodes, n => n.weighted_vote))
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

  /**
   * When invoke, place a pointer at the given locations. Will clear current pointers.
   * 
   * Items is expected to be an array of objects, each item representing a seperate
   * pointer. Each pointer, then, is an object such that:
   * {
   *  x: x location of the pointer,
   *  y: y location of the pointer,
   *  r: Radius the pointer, centered around (x,y)
   * }
   */
  dispatch.on('point-to.tSNE', (items) => {
    // Join
    pointers = nodecenter.selectAll('.pointer').data(items)

    // Exit
    pointers.exit().remove()

    // Update
    pointers.attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)

    // Enter
    pointers.enter()
      .append('circle')
      .attr('class', 'pointer')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
  })
}
