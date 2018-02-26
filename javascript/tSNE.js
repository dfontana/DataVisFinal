let buildTSNE = (svgroot) => {
  const margins = { left: 100, right: 100, top: 50}
  const rootbounds = svgroot.node().getBoundingClientRect()
  const width = rootbounds.width - margins.left;
  const height = rootbounds.height - margins.right;
  const depth = 1000;
  let circles, pointers, xScale, yScale, radiusScale, rScale, gScale, bScale;

  // Keyword for Cluster Group
  let keywordGroup = d3.select('#middle').append('div').attr('id', 'keywordGroup')

  // Attach a tooltip div to the DOM
  const tooltip = d3.select("#middle").append("div")
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
    .force('collision', d3.forceCollide().radius(3.5).strength(0.9))
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
  const update = (nodes, coords, colors) => {
    // Join & Exit the old data
    circles = g.selectAll(".node").data(coords)
    circles.exit()
    .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1)
        .transition()
            .duration(500)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0).remove()

    // Update existing nodes
    let setAttrs = (selection) => {
      selection.attr('class', (d, i) => `group-${nodes[i].cluster} node`)
        .attr("r", (d,i) => radiusScale(nodes[i].weighted_vote))
        .attr('fill', (d, i) => `rgb(${rScale(colors[i][0])},${gScale(colors[i][1])},${bScale(colors[i][2])})`)
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
        .attr("stroke", '#fff')
    };
    setAttrs(circles)

    // Enter the new datapoints
    let enterCircles = circles
      .enter().append("circle")
      .on('mouseover', function (d, i) {
        d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`).style('stroke', 'black')

        nodes[i].clusterwords.forEach((d, i) => {
          if(d != ""){
            keywordGroup.append('span')
                        .attr('class', 'keywordForGroup')
                        .html(d)
                        .append('br')
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

        // Positions are relative to the MIDDLE element in MainVis.
        let [mouseX, mouseY] = d3.mouse(d3.select('#middle').node())
        let bounds = tooltip.node().getBoundingClientRect()
        let spillX = (mouseX + bounds.width) > rootbounds.width
        let spillY = (mouseY - 28 + bounds.height) > rootbounds.height
        let x =  spillX ? mouseX - bounds.width : mouseX
        let y =  spillY ? mouseY - bounds.height :  mouseY - 28

        
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
  let newDecade = (nodes, coords, colors) => {
    // Set the new position, radius, and color scales
    xScale = d3.scaleLinear()
      .domain(d3.extent(coords, c => c[0]))
      .range([0, width])
    yScale = d3.scaleLinear()
      .domain(d3.extent(coords, c => c[1]))
      .range([0, height])

    radiusScale = d3.scaleLinear()
      .domain(d3.extent(nodes, n => n.weighted_vote))
      .range([4, 10])

    rScale = d3.scaleLinear()
      .domain(d3.extent(colors, c => c[0]))
      .rangeRound([0, 255])
    gScale = d3.scaleLinear()
      .domain(d3.extent(colors, c => c[1]))
      .rangeRound([0, 255])
    bScale = d3.scaleLinear()
      .domain(d3.extent(colors, c => c[2]))
      .rangeRound([0, 255])

    // Update the DOM
    update(nodes, coords, colors)

    // Rekindle the Force
    force.nodes(coords)
    force.force('home', function(alpha) {
      coords.map(c => {
        c.x += alpha * (xScale(c[0]) - c.x)
        c.y += alpha * (yScale(c[1]) - c.y)
      })
    })
    force.alpha(1).alphaDecay(0.2).restart()
  }

  /**
   * When the decade changes, will request next set of data and swap the Vis over
   * for the newly found data.
   */
  dispatch.on('decade-update.tSNE', (decade) => {
    console.log("Changing decade!", decade)
    d3.queue()
    .defer(d3.json, `${DOMAIN}tSNE/nodes/${decade}.json`)
    .defer(d3.json, `${DOMAIN}tSNE/coords/${decade}.json`)
    .defer(d3.json, `${DOMAIN}tSNE/colors/${decade}.json`)
    .awaitAll(function(err, data){
      if(err) return
      let [nodes, coords, colors] = data;
      newDecade(nodes, coords, colors)
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
    pointers = g.selectAll('.pointer').data(items)

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

  /**
   * When invoked, will stop the current force simulation.
   */
  dispatch.on('stop-force', () => {
    force.stop();
  })
}
