const { spawnSync } = require("child_process");
const KMeans = require('skmeans')
const Bin = require('../buildBin')
const Keywords = require('../makeTopKeywords')
const fs = require('fs')
let WordMap;

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
  console.log(coords.length, movies.length)
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
  
  // Reduces the keywords related to a cluster down to the top 3 by frequency
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
    let directors = m.crew.filter(c => c.job === 'Director');
    let node = {
      id: parseInt(m.id) || 0,
      title: m.title,
      runtime: parseInt(m.runtime) || 0,
      weighted_vote: (parseInt(m.vote_average) || 0) * (parseInt(m.vote_count) || 0),
      studio: m.production_companies[0] ? m.production_companies[0].name : "",
      lead1: m.cast[0] ? m.cast[0].name : "",
      lead2: m.cast[1] ? m.cast[1].name : "",
      lead3: m.cast[2] ? m.cast[2].name : "",
      director: directors[0] ? directors[0].name : "",
      genre: m.genres[0] ? m.genres[0].name : "",
      keywords: m.keywords.slice(0, 3).map(k => WordMap[k]),
      cluster: clusters.idxs[i],
      clusterwords: ClusterKeyword[clusters.idxs[i]]
    }
    return node
  })
}

function runBHTSNE(bin) {
  const bhTSNE = spawnSync('python',["../../deps/bhtsne-master/bhtsne.py", '-d', '3', '-p', '30', '-i', `../buffer/${bin}-features.tsv`]);
  console.log(String(bhTSNE.stderr))
  let coords = String(bhTSNE.stdout).split('\n').map(pair => pair.split('\t').map(n => Number(n)))
  coords.pop() // The extra newline at the end builds a bad coordinate, trim it.
  return coords
}

const bins = [[0,1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
bins.map(bin =>{
  console.log('Starting Bin: ', bin[1])
  console.time("tSNE")

  let binned = Bin(bin[0], bin[1])
  let keywords = Keywords(binned, 3)
  WordMap = require('../final/wordMap.json')
  // let features = makeFeatures(binned, keywords)
  // features = require(`./final/tSNE/${bin[1]}-features.json`)
  // let test = features.map(row => row.join('\t')).join('\n')
  let coords = runBHTSNE(bin[1])
  let nodeDetails = buildDetails(binned, keywords, coords)

  fs.writeFileSync(`../final/tSNE/coords/${bin[1]}.json`, JSON.stringify(coords), 'utf8', ()=>{});
  fs.writeFileSync(`../final/tSNE/details/${bin[1]}.json`, JSON.stringify(nodeDetails), 'utf8', ()=>{});
  console.timeEnd("tSNE")
})