const keywords = require('./final/topkeywords.json')
const Bin = require('./buildBin')
const fs = require('fs')

/**
 * Helper.
 * Filter the movies in the bin for those containing the top
 * 3 keywords from the bin.
 */
function filterRelevant(movies, binWords){
  let relevant = movies.filter((m) => {
    for(let i = 0; i < m.keywords.length; i++){
      if(binWords.includes(m.keywords[i])){
        return true;
      }  
    }
    return false;
  })

  return relevant.sort((a,b) => b.vote_average*b.vote_count - a.vote_average*a.vote_count).slice(0,500)
}

/**
 * Build the movie sizing from all movies.
 * That's going to be a Map movie ID -> Movie rating * Vote Count
 */
function movieMaps(movies){
  return movies.reduce((acc, m) => {
    acc[0][m.id] = m.vote_average * m.vote_count;
    acc[1][m.id] = m.title;
    acc[2][m.id] = m.keywords;
    return acc
  }, [{}, {}, {}])
}

/**
* Build the actor sizing from FILTERED movies. Use 1st 3 actors
* from cast to choose which actors for aggregation.
* At the same time you will make two other maps:
* - Actor ID -> occurance frequency
* - Actor ID -> actor name
* - Actor ID -> { Movie ID, Movie Revenue} (Use movie maps to find title and keywords)
*/
function actorMaps(movies){
  return movies.reduce((acc, m) => {
    let actors = m.cast.sort((a,b) => a.order - b.order).slice(0, 3);
    actors.map((a) => {
      // Increase occurance frequency
      acc[0][a.id] = (acc[0][a.id] || 0) + 1;

      // Add to name map
      if(!(a.id in acc[1])){
        acc[1][a.id] = a.name
      }

      // Add the keyword/movie map
      acc[2][a.id] = (acc[2][a.id] || [])
      acc[2][a.id].push({id: parseInt(m.id), revenue: m.revenue})
    })
    return acc
  }, [{}, {}, {}])
}

/**
* Build the studio sizing from FILTERED movies. Use production_companies.
* At the same time you will make two other maps:
* - Studio ID -> occurance frequency
* - Studio ID -> studio name
* - Studio ID -> { Movie ID, Movie Revenue} (Use movie maps to find title and keywords)
*/
function studioMaps(movies) {
  return movies.reduce((acc, m) => {
    m.production_companies.map((s) => {
      // Increase occurance frequency
      acc[0][s.id] = (acc[0][s.id] || 0) + 1;

      // Add to name map
      if(!(s.id in acc[1])){
        acc[1][s.id] = s.name
      }

      // Add the keyword/movie map
      acc[2][s.id] = (acc[2][s.id] || [])
      acc[2][s.id].push({id: parseInt(m.id), revenue: m.revenue})
    })
    return acc
  }, [{}, {}, {}])
}

/**
 * Builds maps for each bin, serializing to disk
 */
let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
let Maps = bins.reduce((acc, bin) =>{ 
  let binned = Bin(bin[0], bin[1]);

  // Movie Map by bin
  let movies = movieMaps(filterRelevant(binned, keywords[bin[1]]));
  acc[0][bin[1]] = {
    nodemap: movies[0],
    namemap: movies[1],
    keywordmap: movies[2]
  }

  // Actors Map by bin
  let actors = actorMaps(filterRelevant(binned, keywords[bin[1]]))
  acc[1][bin[1]] = {
    nodemap: actors[0],
    namemap: actors[1],
    keywordmap: actors[2]
  }
  
  // Studios Map by bin
  let studios = studioMaps(filterRelevant(binned, keywords[bin[1]]))
  acc[2][bin[1]] = {
    nodemap: studios[0],
    namemap: studios[1],
    keywordmap: studios[2]
  }

  return acc
}, [{}, {}, {}])
fs.writeFile(__dirname+'/final/movieMaps.json', JSON.stringify(Maps[0]), 'utf8', ()=>{});
fs.writeFile(__dirname+'/final/actorMaps.json', JSON.stringify(Maps[1]), 'utf8', ()=>{});
fs.writeFile(__dirname+'/final/studioMaps.json', JSON.stringify(Maps[2]), 'utf8', ()=>{});