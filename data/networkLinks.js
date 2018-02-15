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
function findLinksCompact(frontier){
  let output = {}
  while(frontier.length !== 0){
    let node = frontier.shift()
    node.keywords.map((kID) => {
      output[kID] = output[kID] || []
      output[kID].push(node.id)
    })
  }
  
  return Object.keys(output).reduce((acc, kID) => {
    if(output[kID].length > 1){
      acc[kID] = output[kID]
    }
    return acc
  }, {})
}

/**
 * Alternate means to build the links within the graph, storing node
 * to node links and the words that connect them. This is inefficient
 * with space.
 */
function findLinksExpressive(frontier){
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
        output[node.id] = (output[node.id] || [])
        output[node.id].push({
          id: other.id,
          words: sharedWords
        })
      }
    })
  }

  return output;
}

function contains(array, item){
  if(array === undefined) return false
  return array.filter(e => e === item).length > 0
}

/**
 * Computes a diff between the expressive version of the
 * link finding algorithm and the compact version of the
 * link finding algorithm. Evaluates accuracy of compact
 * storage.
 */
function rawDiff(expressiveLinks, compactLinks){
  let diff = {}
  Object.keys(expressiveLinks).map(bin => {
    diff[bin] = []
    Object.keys(expressiveLinks[bin]).map(mID => {
      expressiveLinks[bin][mID].map(link => {
        let oID = link.id;
        link.words.map(w => {
          let hasmID = compactLinks[bin][w].filter(id => id == mID).length != 0
          let hasoID = compactLinks[bin][w].filter(id => id == oID).length != 0
          if(!hasmID || !hasoID){
            diff[bin].push({mID, w, oID})
          }
        })
      })
    })
  })
  return diff
}

/**
 * Computes a diff between the expressive link algorithm
 * and the rebuilt compact link algorithm, evaluating the
 * accuracy of the reconstructed links.
 */
function reformedDiff(expressiveLinks, reformedLinks){
  let diff = {}
  Object.keys(expressiveLinks).map(bin => {
    diff[bin] = []
    Object.keys(expressiveLinks[bin]).map(mID => {
      expressiveLinks[bin][mID].map(link => {
        let oID = link.id;
        if(contains(reformLinks[bin][mID], oID) || contains(reformLinks[bin][oID], mID)){
          if(diff[bin].filter(l => l.mID === mID && l.oID === oID).length > 0){
            console.error("DUPLICATE DETECTED", {mID, oID})
          }
        }else{
          diff[bin].push({mID, oID})
        }
      })
    })
  })
  return diff
}

/**
 * Reconstructs the links backed by the compact link
 * storage algorithm.
 */
function reformLinks(altLink){
  return Object.keys(altLink).reduce((links,bin) => {
    links[bin] = {}
    Object.keys(altLink[bin]).map(kID => {
      let nodes = altLink[bin][kID]
      for(let i = 0; i < nodes.length; i++){
        let movieID = nodes[i]
        for(let j = i+1; j < nodes.length; j++){
          let otherID = nodes[j]
          if(!contains(links[bin][movieID], otherID) && !contains(links[bin][otherID], movieID)){
            links[bin][movieID] = (links[bin][movieID] || [])
            links[bin][movieID].push(otherID)
          }
        }
      }
    })
    return links
  }, {})
}

/** 
 * Function used to validate link creation algorithms. Does so by looking
 * at the expressive vs the compact means, in both the difference of stored
 * data and difference of reformed data from its compact form.
 */
function validateLinks(expressiveLinks, compactLinks, skipDiff){
  if(!skipDiff){
    // Check the diffs of the big links against the compact links, ensuring the storage
    // system contains the links expressed by the big links.
    let actorDiff = rawDiff(expressiveLinks[1], compactLinks[1]);
    let studioDiff = rawDiff(expressiveLinks[2], compactLinks[2]);
    let movieDiff = rawDiff(expressiveLinks[0], compactLinks[0]);

    // If any of the diffs are not empty, a link was missed in storage.
    let diffEmpty = (diff) => Object.keys(diff).reduce((acc, bin) => diff[bin].length === 0 && acc, true)
    if(!diffEmpty(movieDiff)){
      console.error("[ERROR] STORED MOVIE links mismatch.")
    }
    if(!diffEmpty(actorDiff)){
      console.error("[ERROR] STORED ACTOR links mismatch.")
    }
    if(!diffEmpty(studioDiff)){
      console.error("[ERROR] STORED STUDIO links mismatch.")
    }
  }

  // Then do a simplified reverse-diff, ensuring the number of links
  // in the reformed links matches the expressive version. This should
  // catch an obvious error where the reformed has too many links. 
  function linkSum(links){
    return Object.keys(links).reduce((acc, bin) => {
      return acc + Object.keys(links[bin]).reduce((acc, mID) => {
        return acc + links[bin][mID].length
      }, 0)
    }, 0)
  }
  if(linkSum(expressiveLinks[0]) !== linkSum(reformLinks(compactLinks[0]))){
    console.error("[ERROR] Reformed MOVIE links mismatch.")
  }
  if(linkSum(expressiveLinks[1]) !== linkSum(reformLinks(compactLinks[1]))){
    console.error("[ERROR] Reformed ACTOR links mismatch.")
  }
  if(linkSum(expressiveLinks[2]) !== linkSum(reformLinks(compactLinks[2]))){
    console.error("[ERROR] Reformed STUDIO links mismatch.")
  }
}

/**
 * Builds links for each bin, serializing to disk
 */
let Links = Object.keys(movieMaps).reduce((acc, bin) =>{ 

  // Movie, Actor, Studio maps respectively.
  acc[0][bin] = findLinksCompact(buildMovieFrontier(movieMaps[bin]));
  acc[1][bin] = findLinksCompact(buildActorStudioFrontier(actorMaps[bin], movieMaps[bin]))
  acc[2][bin] = findLinksCompact(buildActorStudioFrontier(studioMaps[bin], movieMaps[bin]))

  return acc
}, [{}, {}, {}])

fs.writeFileSync(__dirname+'/final/movieLinks.json', JSON.stringify(Links[0]), 'utf8', ()=>{});
fs.writeFileSync(__dirname+'/final/actorLinks.json', JSON.stringify(Links[1]), 'utf8', ()=>{});
fs.writeFileSync(__dirname+'/final/studioLinks.json', JSON.stringify(Links[2]), 'utf8', ()=>{});


let bigLinks = Object.keys(movieMaps).reduce((acc, bin) =>{ 

  // Movie, Actor, Studio maps respectively.
  acc[0][bin] = findLinksExpressive(buildMovieFrontier(movieMaps[bin]));
  acc[1][bin] = findLinksExpressive(buildActorStudioFrontier(actorMaps[bin], movieMaps[bin]))
  acc[2][bin] = findLinksExpressive(buildActorStudioFrontier(studioMaps[bin], movieMaps[bin]))

  return acc
}, [{}, {}, {}])

validateLinks(bigLinks, Links, false)
