const keywords = require('./final/topkeywords.json')
const Bin = require('./buildBin')
const fs = require('fs')

/**
 * Helper.
 * Filter the movies in the bin for those containing the top
 * 3 keywords from the bin.
 */
function filterRelevant(movies){

}

/**
 * Build the movie sizing from all movies.
 * That's going to be a Map movie ID -> Movie rating * Vote Count
 */
function movieMap(movies){

}

/**
* Build the actor sizing from FILTERED movies. Use 1st 3 actors
* from cast to choose which actors for aggregation.
* At the same time you will make two other maps:
* - Actor ID -> occurance frequency
* - Actor ID -> actor name
* - Actor ID -> { Movie Name, Movie ID, Movie Revenue, Movie Keywords}
*/
function actorMaps(movies){

}

/**
* Build the studio sizing from FILTERED movies. Use production_companies.
* At the same time you will make two other maps:
* - Studio ID -> occurance frequency
* - Studio ID -> studio name
* - Studio ID -> { Movie Name, Movie ID, Movie Revenue, Movie Keywords}
*/
function studioMaps(movies) {

}

/**
 * Builds maps for each bin, serializing to disk
 */
let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
let Maps = bins.reduce((acc, bin) =>{ 
  let binned = Bin.makeBin(bin[0], bin[1]);

  // Movie Map by bin
  acc[0][bin[1]] = moviesMap(binned);

  // Actors Map by bin
  let actors = actorsMap(filterRelevent(binned))
  acc[1][bin[1]] = {
    nodemap: actors[0],
    keywordmap: actors[1],
    namemap: actors[2]
  }
  
  // Studios Map by bin
  let studios = studiosMap(filterRelevent(binned))
  acc[2][bin[1]] = {
    nodemap: studios[0],
    keywordmap: studios[1],
    namemap: studios[2]
  }

  return acc
}, [{}, {}, {}])
fs.writeFileSync(__dirname+'/final/movieMaps.json', JSON.stringify(Maps[0]), 'utf8');
fs.writeFileSync(__dirname+'/final/actorMaps.json', JSON.stringify(Maps[1]), 'utf8');
fs.writeFileSync(__dirname+'/final/studioMaps.json', JSON.stringify(Maps[2]), 'utf8');