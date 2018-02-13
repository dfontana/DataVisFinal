/**
 * Builds the links for each bin based on the maps built by networkNodes.
 * That means you must run networkNodes first to use this module.
 */
const studioMaps = require('./final/studioMaps.json')
const actorMaps = require('./final/actorMaps.json')
const movieMaps = require('./final/movieMaps.json')

/**
 * Builds a mapping of MovieID to a list of {MovieID, MovieName, SharedWords}
 * representing its neighbors. The given mapsForBin parameter represents the
 * expected object containing the maps for the desired bin.
 */
function movieLinks(mapsForBin){

}

/**
 * Builds a mapping of ActorID to a list of {ActorID, ActorName, SharedWords}
 * representing its neighbors. The given mapsForBin parameter represents the
 * expected object containing the maps for the desired bin.
 */
function actorLinks(mapsForBin){

}

/**
 * Builds a mapping of StudioID to a list of {StudioID, StudioName, SharedWords}
 * representing its neighbors. The given mapsForBin parameter represents the
 * expected object containing the maps for the desired bin.
 */
function studioLinks(mapsForBin){

}

/**
 * Builds links for each bin, serializing to disk
 */
let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
let Links = bins.reduce((acc, bin) =>{ 

  // Movie Map by bin
  acc[0][bin[1]] = movieLinks(movieMaps[bin[1]]);

  // Actors Map by bin
  acc[1][bin[1]] = actorLinks(actorMaps[bin[1]])
  
  // Studios Map by bin
  acc[2][bin[1]] = studioLinks(studioMaps[bin[1]])

  return acc
}, [{}, {}, {}])
fs.writeFileSync(__dirname+'/final/movieLinks.json', JSON.stringify(Links[0]), 'utf8');
fs.writeFileSync(__dirname+'/final/actorLinks.json', JSON.stringify(Links[1]), 'utf8');
fs.writeFileSync(__dirname+'/final/studioLinks.json', JSON.stringify(Links[2]), 'utf8');