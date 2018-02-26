let buildHex = (svgroot, coords, colors) => {
  const rootbounds = svgroot.node().getBoundingClientRect()
  const width = rootbounds.width;
  const height = rootbounds.height;
  const g = svgroot.append('g')

  // Set the new position, radius, and color scales
  let xScale = d3.scaleLinear()
    .domain(d3.extent(coords, c => c[0]))
    .range([0, width])
  let yScale = d3.scaleLinear()
    .domain(d3.extent(coords, c => c[1]))
    .range([0, height])

  let rScale = d3.scaleLinear()
    .domain(d3.extent(colors, c => c[0]))
    .rangeRound([0, 255])
  let gScale = d3.scaleLinear()
    .domain(d3.extent(colors, c => c[1]))
    .rangeRound([0, 255])
  let bScale = d3.scaleLinear()
    .domain(d3.extent(colors, c => c[2]))
    .rangeRound([0, 255])

  let hexbin = d3.hexbin()
    .radius(2)
    .x(d => xScale(d[0][0]))
    .y(d => yScale(d[0][1]))
    .extent([[0, 0], [width, height]]);

  svgroot.selectAll("path").remove();

  let stitched = coords.map((c, i) => [c, colors[i]])

  g.selectAll("path")
    .data(hexbin(stitched))
    .enter().append("path")
      .attr("d", hexbin.hexagon())
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .attr("fill", d => {
        let colors = d.slice(0, d.length).map(e => e[1])
        let avgX = d3.mean(colors, c => c[0])
        let avgY = d3.mean(colors, c => c[1])
        let avgZ = d3.mean(colors, c => c[2])
        return `rgb(${rScale(avgX)},${gScale(avgY)},${bScale(avgZ)})`
      });
}