/**
* Builds the tSNE style data for each bin.
* This data should be an array of array.
* It may or may not need to be string indexed.
*/
const Bin = require('./buildBin')
const Keywords = require('./makeTopKeywords')
const tSNE = require('../deps/tsnejs/tsne')
const KMeans = require('skmeans')
const WordMap = require('./final/wordMap.json')
const fs = require('fs')

/**
* Makes the details for each node that corresponds to the coords.
* This includes:
*  - Movie ID
*  - Movie Title
*  - Size (rating * count)
*  - Cluster
*  - Cluster's Word or Theme
*/
function buildDetails(movies, keywords, coords) {
  let clusters = KMeans(coords.map(c => c[2]), 20)
  
  
  // Accumulates keywords for all movies related to the cluster
  let keywordsForAll = clusters.idxs.reduce((acc, c, i) => {
    acc[c] = acc[c] || []
    acc[c].push(...keywords.reduce((acc,k) => {
      if(movies[i].keywords.filter(mk => mk === k).length > 0){
        acc.push(k)
      }
      return acc
    }, []))
    return acc
  }, {})
  
  // Reduces the keywords for a cluster to the top one's string.
  let ClusterKeyword = Object.entries(keywordsForAll).reduce((acc, entry) => {
    //find most common keyword in entry[1]
    let frequencies = entry[1].reduce((acc, e) => {
      acc[e] = acc[e] || 0
      acc[e]++
      return acc
    }, {})
    
    let keywords = Object.entries(frequencies)
    .reduce((acc, e) => {
      if(e[1] > acc[0][1]) {
        acc[0] = e
      }else if(e[1] > acc[1][1]){
        acc[1] = e
      }else if(e[1] > acc[2][1]){
        acc[2] = e
      }
      return acc;
    }, [["", 0], ["", 0], ["", 0]])

    acc[entry[0]] = keywords.map(k => WordMap[k[0]]);
    return acc
  }, {})
  
  return movies.map((m, i) => {
    let node = []
    // In order: ID, Title, Runtime, Weighted Rating, Production Company, 
    // Top 3 Leads, Director, Genre, Cluster
    node.push(parseInt(m.id) || 0)
    node.push(m.title)
    node.push(parseInt(m.runtime) || 0)
    node.push((parseInt(m.vote_average) || 0) * (parseInt(m.vote_count) || 0))
    node.push(m.production_companies[0] ? m.production_companies[0].name : "")
    node.push(m.cast[0] ? m.cast[0].name : "")
    node.push(m.cast[1] ? m.cast[1].name : "")
    node.push(m.cast[2] ? m.cast[2].name : "")
    let directors = m.crew.filter(c => c.job === 'Director');
    node.push(directors[0] ? directors[0].name : "")
    node.push(m.genres[0] ? m.genres[0].name : "")
    
    // Define its cluster & cluster keyword(s)
    node.push(clusters.idxs[i])
    node.push(ClusterKeyword[clusters.idxs[i]])
    return node
  })
}

/** 
* Reformats the array of movie JSON into a feature table for running tSNE.
* Should not have a header column.
*/
function makeFeatures(movies, keywords) {
  return movies.map(m => {
    let features = []
    features.push(parseInt(m.runtime) || 0)
    features.push(parseInt(m.vote_average) || 0)
    features.push(parseInt(m.vote_count) || 0)
    
    // Genre, or -1 if it has none.
    features.push(m.genres[0] ? parseInt(m.genres[0].id) : -1)
    
    // Director, or -1 if they don't exist.
    let directors = m.crew.filter(c => c.job === 'Director');
    features.push(directors[0] ? parseInt(directors[0].credit_id) : -1)
    
    // Studio, or -1 if they don't exist
    let studios = m.production_companies
    features.push(studios[0] ? parseInt(studios[0].id) : -1) // Studio
    
    // Push 3 Leads, or -1 if they don't exist.
    features.push(m.cast[0] ? parseInt(m.cast[0].cast_id) : -1)
    features.push(m.cast[1] ? parseInt(m.cast[1].cast_id) : -1)
    features.push(m.cast[2] ? parseInt(m.cast[2].cast_id) : -1)
    
    // Push Keywords: 1 if its there, 0 if not.
    keywords.map(k => {
      if(m.keywords.filter(mk => mk === k).length > 0){
        features.push(1)
      }else{
        features.push(0)
      }
    })
    return features
  })
}

function runTSNE(data) {
  console.log('Features: ', data[0].length)
  console.log('Examples: ', data.length)
  let model = new tSNE.tSNE({dim:3}) // Default vals are right
  model.initDataRaw(data)
  
  for(let i = 0; i < 500; i++){
    model.step();
    if(i % 10 === 0){
      process.stdout.write(".");
    }
  }
  process.stdout.write("\n");
  
  return model.getSolution();
}

// Build the tSNE files for each bin if we call from commandline, otherwise we want to use this as an import.
if(require.main === module){
  const bins = [[0,1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
  bins.map(bin =>{
    console.log('Starting Bin: ', bin[1])
    console.time("tSNE")
    
    let binned = Bin(bin[0], bin[1]);
    let keywords = Keywords(binned, 50)
    let features = makeFeatures(binned, keywords)
    let coords = runTSNE(tSNEBin, bin[1])
    let nodeDetails = buildDetails(binned, keywords, coords)
    
    fs.writeFileSync(`${__dirname}/final/tSNE/${bin[1]}-coords.json`, JSON.stringify(coords), 'utf8', ()=>{});
    s.writeFileSync(`${__dirname}/final/tSNE/${bin[1]}-features.json`, JSON.stringify(features), 'utf8', ()=>{});
    fs.writeFileSync(`${__dirname}/final/tSNE/${bin[1]}-details.json`, JSON.stringify(nodeDetails), 'utf8', ()=>{});
    console.timeEnd("tSNE")
  })
}
