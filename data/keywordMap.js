/**
 * Builds the Top 3 Keyword Map by bin, saving it to disk as the final JSON.
 */
const fs = require('fs')
const Bin = require('./buildBin')

function top3ForBin(movies){
  // Get frequency mapping of keyword -> count for all movies supplied.
  let frequencies = movies.reduce((acc, m) => {
    m.keywords.forEach((k) => {
      if(k.name == 'duringcreditsstinger' || k.name == 'aftercreditsstinger'){ return }
      if(k.name in acc){
        acc[k.name] += parseFloat(m.vote_average) * parseFloat(m.vote_count);
      }else{
        acc[k.name] = parseFloat(m.vote_average) * parseFloat(m.vote_count);
      }
    })
    return acc
  }, {})

  // Reduce the frequency mapping to just top 3 keywords in an array form
  return Object.entries(frequencies).sort((a,b) => b[1] - a[1]).map(k => k[0]).slice(0, 3)
}

let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
let KeywordMap = bins.reduce((acc, bin) =>{ 
  let binned = Bin(bin[0], bin[1]);
  acc[bin[1]] = top3ForBin(binned)
  return acc
}, {})
fs.writeFileSync(__dirname+'/final/topkeywords.json', JSON.stringify(KeywordMap), 'utf8');