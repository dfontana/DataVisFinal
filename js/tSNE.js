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
    .force('collision', d3.forceCollide().radius(3).strength(0.9))
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
   */
  const update = (stitched) => {

    // Join & Exit the old data
    circles = g.selectAll(".node").data(stitched)
    circles.exit()
    .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1)
        .transition()
            .duration(500)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0).remove()

    // Update existing nodes
    let setAttrs = (selection) => {
      selection.attr('class', d => `group-${d[2].cluster} node`)
        .attr("r", d => radiusScale(d[2].weighted_vote))
        .attr('fill', d => `rgb(${rScale(d[1][0])},${gScale(d[1][1])},${bScale(d[1][2])})`)
        .attr("stroke", d => 'rgb(255,255,255)')
        .attr("cx", d => xScale(d[0][0]))
        .attr("cy", d => yScale(d[0][1]))
    };
    setAttrs(circles)

    // Enter the new datapoints
    let enterCircles = circles
      .enter().append("circle")
      .on('mouseover', function (d) {
        let cluster = d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`)
        d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`)
          .attr('stroke', function() { return `rgba(0,0,0,${d3.color(d3.select(this).attr('stroke')).opacity})` })

        d[2].clusterwords.forEach(d => {
          if(d != ""){
            keywordGroup.append('span')
                        .attr('class', 'keywordForGroup')
                        .html(d)
                        .append('br')
          }
        })
        
        tooltip.html(`Title: ${d[2].title}<br>\
        Genre: ${d[2].genre}<br>\
        Lead 1: ${d[2].lead1}<br>\
        Lead 2: ${d[2].lead2}<br>\
        Lead 3: ${d[2].lead3}<br>\
        Rating: ${d[2].weighted_vote}<br>\
        Studio: ${d[2].studio}<br>\
        Runtime: ${d[2].runtime}<br>\
        Keywords: ${d[2].keywords}<br>`)

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
        d3.selectAll(`.${this.className.baseVal.split(" ")[0]}`)
          .attr('stroke', function(){ return `rgba(255,255,255,${d3.color(d3.select(this).attr('stroke')).opacity})` });
          
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
  let newDecade = (stitched) => {
    // Set the new position, radius, and color scales
    xScale = d3.scaleLinear()
      .domain(d3.extent(stitched, c => c[0][0]))
      .range([0, width])
    yScale = d3.scaleLinear()
      .domain(d3.extent(stitched, c => c[0][1]))
      .range([0, height])

    radiusScale = d3.scaleLinear()
      .domain(d3.extent(stitched, n => n[2].weighted_vote))
      .range([4, 10])

    rScale = d3.scaleLinear()
      .domain(d3.extent(stitched, c => c[1][0]))
      .rangeRound([0, 255])
    gScale = d3.scaleLinear()
      .domain(d3.extent(stitched, c => c[1][1]))
      .rangeRound([0, 255])
    bScale = d3.scaleLinear()
      .domain(d3.extent(stitched, c => c[1][2]))
      .rangeRound([0, 255])

    // Update the DOM
    update(stitched)

    // Rekindle the Force
    force.nodes(stitched)
    force.force('home', function(alpha) {
      stitched.map(s => {
        s.x += alpha * (xScale(s[0][0]) - s.x)
        s.y += alpha * (yScale(s[0][1]) - s.y)
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
    .defer(d3.json, `${DOMAIN}data/final/tSNE/details/${decade}.json`)
    .defer(d3.json, `${DOMAIN}data/final/tSNE/coords/${decade}.json`)
    .defer(d3.json, `${DOMAIN}data/final/tSNE/colors/${decade}.json`)
    .awaitAll(function(err, data){
      if(err) return
      let [nodes, coords, colors] = data;
      let stitched = coords.map((coor,i) => [coor, colors[i], nodes[i]])
      newDecade(stitched)
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
    let {points, classed} = items;
    // Join
    pointers = g.selectAll(`.${classed}`).data(points)

    // Exit
    pointers.exit().remove()

    // Update
    pointers.attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)

    // Enter
    pointers.enter()
      .append('circle')
      .attr('class', classed)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .style('opacity', 0)
      .transition()
      .duration(300)
      .style('opacity', 1)
  })

  /**
   * Filters the tSNE plot for the given term. Will inspect all fields
   */
  dispatch.on('filter.tSNE', (term) => {
    // Always clear pointers, and clear the filter if null.
    if(term === null){
      d3.selectAll('.node')
        .attr('fill', d => `rgba(${rScale(d[1][0])},${gScale(d[1][1])},${bScale(d[1][2])},1)`)
        .attr('stroke', d => `rgba(255,255,255,1)`)
      return
    }

    // Filter & raise / focus
    let filtered = d3.selectAll('.node')
      .attr('fill', d => `rgba(${rScale(d[1][0])},${gScale(d[1][1])},${bScale(d[1][2])},0.3)`)
      .attr('stroke', d => `rgba(255,255,255,0.3)`)
      .filter(d => {
        // Exploits short circuits to stop eval early
        return d[2].title.toLowerCase().includes(term) || 
            d[2].director.toLowerCase().includes(term) || 
            d[2].lead1.toLowerCase().includes(term) ||
            d[2].lead2.toLowerCase().includes(term) ||
            d[2].lead3.toLowerCase().includes(term) ||
            d[2].studio.toLowerCase().includes(term) ||
            d[2].keywords.filter(k => k.toLowerCase().includes(term)).length > 0
      })
      .raise()
      .attr('fill', d => `rgba(${rScale(d[1][0])},${gScale(d[1][1])},${bScale(d[1][2])},1)`)
      .attr('stroke', d => `rgba(255,255,255,1)`)

    // Nothing found in filter? Clear existing filter & stop.
    if(filtered.empty()){
      d3.selectAll('.node')
        .attr('fill', d => `rgba(${rScale(d[1][0])},${gScale(d[1][1])},${bScale(d[1][2])},1)`)
        .attr('stroke', d => `rgba(255,255,255,1)`)
      return
    }
  })

  /**
   * When invoked, will stop the current force simulation.
   */
  dispatch.on('stop-force', () => {
    force.stop();
  })
}
