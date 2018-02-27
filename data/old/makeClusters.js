/** 
 * Builds the maps necessary for the clustering graph.
 */
const TopKeywords = require('./final/topkeywords.json')
const studioMaps = require('./final/studioMaps.json')
const actorMaps = require('./final/actorMaps.json')
const movieMaps = require('./final/movieMaps.json')
const fs = require('fs')

let partOfMovie = (keywordmap, movie) => {
  return Object.keys(keywordmap).filter(a => {
    return keywordmap[a].map(e => parseInt(e.id)).includes(movie)
  })
}

let flattenKeywordMaps = (map) => {
  return Object.keys(map).reduce((acc, bin) => { return {...acc, ...map[bin].keywordmap} }, {})
}

/**
 * TopKeyword -> [{MovieID, [StudioIDs], [ActorIDs]}]
 */
function cluster(){
  return [].concat(...Object.values(TopKeywords)).reduce((acc, key) => {

    // Movies with Key(word) in their list.
    let mergedMovies = flattenKeywordMaps(movieMaps)
    let movies = Object.keys(mergedMovies).filter(k => mergedMovies[k].includes(key))
    acc[key] = movies.map(m => {
      let id = parseInt(m)
      return {
        id: id,
        studios: partOfMovie(flattenKeywordMaps(studioMaps), id),
        actors: partOfMovie(flattenKeywordMaps(actorMaps), id)
      }
    })

    return acc;
  }, {})
}

/**
 * TopKeyword -> [ActorId]
 */
function reshapeToActors(clusterMap){
  return Object.keys(clusterMap).reduce((acc, key) => {
    acc[key] = clusterMap[key].reduce((acc, e) => [...acc, ...e.actors], [])
    return acc;
  }, {})
}

/**
 * TopKeyword -> [StudioID]
 */
function reshapeToStudios(clusterMap){
  return Object.keys(clusterMap).reduce((acc, key) => {
    acc[key] = clusterMap[key].reduce((acc, e) => [...acc, ...e.studios], [])
    return acc;
  }, {})
}

let clusters = cluster();
fs.writeFile(__dirname+'/final/movieClusters.json', JSON.stringify(clusters), 'utf8', ()=>{});
fs.writeFile(__dirname+'/final/actorClusters.json', JSON.stringify(reshapeToActors(clusters)), 'utf8', ()=>{});
fs.writeFile(__dirname+'/final/studioClusters.json', JSON.stringify(reshapeToStudios(clusters)), 'utf8', ()=>{});