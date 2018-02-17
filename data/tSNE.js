/**
 * Builds the tSNE style data for each bin.
 * This data should be an array of array.
 * It may or may not need to be string indexed.
 */
const Bin = require('./buildBin')
const Keywords = require('./makeTopKeywords')
const tSNE = require('../deps/tsnejs/tsne')
const d3 = require('d3')
const fs = require('fs')

/** 
 * Reformats the array of movie JSON into a feature table for running tSNE.
 * Should not have a header column.
 */
function prepData(movies, keywords) {
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

function run(data, binLabel) {
  console.log('Starting tSNE Training for', binLabel)
  console.log('Features: ', data[0].length)
  console.log('Examples: ', data.length)
  console.time("tSNE")
  let model = new tSNE.tSNE() // Default vals are right
  model.initDataRaw(data)

  for(let i = 0; i < 500; i++){
    model.step();
    if(i % 10 === 0){
      process.stdout.write(".");
    }
  }
  process.stdout.write("\n");

  let out = model.getSolution();
  console.timeEnd("tSNE")
  fs.writeFileSync(`${__dirname}/final/tSNE/${binLabel}-out.json`, JSON.stringify(out), 'utf8', ()=>{});
}

// Build the tSNE files for each bin if we call from commandline, otherwise we want to use this as an import.
if(require.main === module){
  const bins = [[1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
  bins.map(bin =>{ 
    console.log('Building Bin', bin[1])
    let binned = Bin(bin[0], bin[1]);
    let keywords = Keywords(binned, 50)
    let tSNEBin = prepData(binned, keywords)
    run(tSNEBin, bin[1])
    fs.writeFileSync(`${__dirname}/final/tSNE/${bin[1]}.json`, JSON.stringify(tSNEBin), 'utf8', ()=>{});
  })
}
