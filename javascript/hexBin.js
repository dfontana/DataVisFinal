let buildHex = (svgroot, coords) => {
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
  let cScale = d3.scaleSequential(d3.interpolateCool)
    .domain(d3.extent(coords, c => c[2]));

  let hexbin = d3.hexbin()
    .radius(2)
    .x(d => xScale(d[0])).y(d => yScale(d[1]))
    .extent([[0, 0], [width, height]]);

  svgroot.selectAll("path").remove();

  g.selectAll("path")
    .data(hexbin(coords))
    .enter().append("path")
      .attr("d", hexbin.hexagon())
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .attr("fill", d => cScale(d.length));
}