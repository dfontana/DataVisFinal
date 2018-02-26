/**
 * Series of helper functions used to coordinate layout related items,
 * scrollytelling.
 */

// Will jump forward to the given decade when triggered.
function fastForwardDecade(decade) {
  dispatch.call('stop-force', null)
  SCROLLINGTO = decade == 2020 ? 'conclusion_container' : 'graph' + (decade+10);
  document.querySelector('#' + SCROLLINGTO).scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Will return to a decade earlier on the page when triggered
function returnToDecade(decade){
  SCROLLINGTO = 'graph' + decade
  document.querySelector('#'+SCROLLINGTO).scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Will jump to conclusion
function goToConclusion() {
  dispatch.call('stop-force', null)
  SCROLLINGTO = 'conclusion_container'
  document.querySelector('#'+SCROLLINGTO).scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Sets the progress bar fill to the necessary amount
function setProgress(i){
  switch(i % 3){
    case 0:
      d3.select('#p1').classed('progress-made', true)
      d3.select('#p2').classed('progress-made', true)
      d3.select('#p3').classed('progress-made', true)
      break;
    case 1:
      d3.select('#p1').classed('progress-made', true)
      d3.select('#p2').classed('progress-made', false)
      d3.select('#p3').classed('progress-made', false)
      break;
    case 2:
      d3.select('#p1').classed('progress-made', true)
      d3.select('#p2').classed('progress-made', true)
      d3.select('#p3').classed('progress-made', false)
      break;
  }
}

// Sets up the next decade
function transitionDecade(decade, keywords) {
  if(keywords === undefined) { return }
  let sliced = Object.entries(keywords)
    .reduce((acc, e) => {
      if(parseInt(e[0]) <= decade) { acc.push(...e[1]) } 
      return acc;
    }, [])

  keywordSummary = d3.select("#keywordSummary").selectAll('.summary-keyword').data(sliced)
  keywordSummary.exit().remove()

  let entered = keywordSummary.enter()
    .append('li')
    .attr('class', 'summary-keyword')
    .text(d => d)

  keywordSummary = entered.merge(keywordSummary)

  document.getElementById("next_decade").removeEventListener("click", fastForwardDecade);
  document.getElementById("next_decade").addEventListener("click", () => fastForwardDecade(decade));
  dispatch.call('stop-force', null)
  dispatch.call('decade-update', this, decade)
}