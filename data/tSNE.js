/**
 * Builds the tSNE style data for each bin.
 * This data should be an array of array.
 * It may or may not need to be string indexed.
 */
const Bin = require('./buildBin')
const Keywords = require('./makeTopKeywords')
const fs = require('fs')

/** 
 * Reformats the array of movie JSON into a feature table for running tSNE.
 * Should not have a header column.
 */
function tSNE(movies, keywords) {
  return movies.map(m => {
    let features = []
    features.push(parseInt(m.runtime))
    features.push(parseInt(m.vote_average))
    features.push(parseInt(m.vote_count))

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

// Build the tSNE files for each bin.
const bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
bins.map(bin =>{ 
  console.log('Building Bin', bin[1])
  let binned = Bin(bin[0], bin[1]);
  let keywords = Keywords(binned, 50)
  let tSNEBin = tSNE(binned, keywords)
  fs.writeFileSync(`${__dirname}/final/tSNE/${bin[1]}.json`, JSON.stringify(tSNEBin), 'utf8', ()=>{});
})