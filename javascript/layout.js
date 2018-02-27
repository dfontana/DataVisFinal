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
function transitionDecade(decade, keywords, cb) {
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

  setTimeout(() => cb(), 500)
}

function search(ele) {
  if(event.key === 'Enter') {
    let term = ele.value.toLowerCase();
    filterByTerm(term);
  }
}

function filterByTerm(term) {
  if(term === "") {
    // Clear the filter
    dispatch.call('filter', null, null)
  }else{
    // Set the filter
    dispatch.call('filter', null, term)
  }
}

function searchForUser(term) {
  document.getElementById('searchbox').value = term;
  let finalWord = term.toLowerCase();
  filterByTerm(finalWord);
}

function findCoordinatesOf(title){
  let node = d3.selectAll('.node')
    .filter(m => {
      return m[2].title.toLowerCase().includes(title.toLowerCase())
    })
  return {x: node.attr('cx'), y: node.attr('cy'), r: 20}  
}

function takeAction(i, callback){
  // Dispatch pointer and search events (clear old ones)
  d3.selectAll('.story-pointer').remove()
  searchForUser("");
  let points;
  switch(i){
    case 2:
      points = [ findCoordinatesOf("Arrival of a Train") ]
      dispatch.call('point-to', this, {points: points, classed:"story-pointer"})
      break;
    case 5:
      searchForUser('World War');
      break;
    case 9:
      searchForUser('Spaghetti Western');
      break;
    case 11:
      points = [ findCoordinatesOf("The Conversation") ]
      points[0].r = 60;
      dispatch.call('point-to', this, {points: points, classed:"story-pointer"})
      break;
    case 14:
      searchForUser('Space');
      break;
    case 17:
      points = [ findCoordinatesOf("Men In Black") ]
      points[0].r = 40;
      dispatch.call('point-to', this, {points: points, classed:"story-pointer"})
      break;
    case 19:
      searchForUser("Harry Potter and the Philosopher's stone");
      break;
    case 20:
      searchForUser('Harry Potter');
      break;
    case 21:
      searchForUser('The fellowship of the ring')
      break;
    case 22:
      searchForUser('Hero');
      break;
    case 24:
      points = [ findCoordinatesOf("Fury Road"), findCoordinatesOf("gravity") ]
      dispatch.call('point-to', this, {points: points, classed:"story-pointer"})
      break;
  }
  callback(null);
}