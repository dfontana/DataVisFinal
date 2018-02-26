/**
 * Builds the Top 3 Keyword Map by bin, saving it to disk as the final JSON.
 */
const fs = require('fs')
const Bin = require('./buildBin')

function topNForBin(movies, N){
  // Get frequency mapping of keyword -> count for all movies supplied.
  let frequencies = movies.reduce((acc, m) => {
    m.keywords.forEach((k) => {
      if(k === 179431 || k.name == 179430){ return } // 'duringcreditstinger' and 'aftercreditstringer'
      acc[k] = (acc[k] || 0) + parseFloat(m.vote_average) * parseFloat(m.vote_count); 
    })
    return acc
  }, {})

  // Reduce the frequency mapping to just top 3 keywords in an array form
  return Object.entries(frequencies).sort((a,b) => b[1] - a[1]).map(k => parseInt(k[0])).slice(0, N)
}

// Only build the maps if we call from commandline, otherwise we want to use this as an import.
if(require.main === module){
  let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
  let KeywordMap = bins.reduce((acc, bin) =>{ 
    let binned = Bin(bin[0], bin[1]);
    acc[bin[1]] = topNForBin(binned, 3)
    WordMap = require('./final/wordMap.json')
    acc[bin[1]] = acc[bin[1]].map(k => WordMap[k]) // Translate ID => Word
    return acc
  }, {})
  fs.writeFile(__dirname+'/final/topkeywords.json', JSON.stringify(KeywordMap), 'utf8', ()=>{});
}

module.exports = topNForBin;