/**
 * Builds the links for each bin based on the maps built by networkNodes.
 * That means you must run networkNodes first to use this module.
 */
const studioMaps = require('./final/studioMaps.json')
const actorMaps = require('./final/actorMaps.json')
const movieMaps = require('./final/movieMaps.json')
const fs = require('fs')


function buildMovieFrontier(maps) {
  return Object.keys(maps.namemap).map((id) => {
    return {
      id: parseInt(id),
      keywords: maps.keywordmap[id]
    }
  })
}

/**
 * Makes the list of nodes to traverse in the case of 
 * actors and studios. This essentially uses the given maps
 * and reduces the movie references in the keyword map down
 * to the unique keywords related to the given map.
 */
function buildActorStudioFrontier(maps, movieMaps) {
  return Object.keys(maps.namemap).map((id) => {
    return {
      id: parseInt(id),
      keywords: maps.keywordmap[id].reduce((acc, a) => {
        movieMaps.keywordmap[a.id].map((keyword) => {
          if(!(acc.includes(keyword))) acc.push(keyword)
        })
        return acc
      }, [])
    }
  })
}

/**
 * Builds a mapping of ID to a list of {ID, SharedWords}
 * representing its neighbors. Uses the given frontier list
 * as the nodes to traverse.
 */
function findLinks(frontier){
  let output = {}
  while(frontier.length !== 0){
    let node = frontier.shift()
    frontier.map((other) => {

      // Find shared words between node and other.
      let sharedWords = node.keywords.reduce((acc, wordID) => {
        if(other.keywords.filter(kID => kID === wordID).length === 1){
          acc.push(wordID)
        }
        return acc
      }, [])

      // Add Neighbor if it's a neighbor
      if(sharedWords.length > 0){
        if(!(node.id in output)){
          output[node.id] = [];
        }

        output[node.id].push({
          id: other.id,
          words: sharedWords
        })
      }
    })
  }

  return output;
}

/**
 * Builds links for each bin, serializing to disk
 */
let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
let Links = bins.reduce((acc, bin) =>{ 

  // Movie Map by bin
  acc[0][bin[1]] = findLinks(buildMovieFrontier(movieMaps[bin[1]]));

  // Actors Map by bin
  acc[1][bin[1]] = findLinks(buildActorStudioFrontier(actorMaps[bin[1]], movieMaps[bin[1]]))
  
  // Studios Map by bin
  acc[2][bin[1]] = findLinks(buildActorStudioFrontier(studioMaps[bin[1]], movieMaps[bin[1]]))

  return acc
}, [{}, {}, {}])

fs.writeFileSync(__dirname+'/final/movieLinks.json', JSON.stringify(Links[0]), 'utf8');
fs.writeFileSync(__dirname+'/final/actorLinks.json', JSON.stringify(Links[1]), 'utf8');
fs.writeFileSync(__dirname+'/final/studioLinks.json', JSON.stringify(Links[2]), 'utf8');