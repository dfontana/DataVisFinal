const fs = require('fs')
const metadata = require('./buffer/raw_json/movies_metadata.json')
let credits = require('./buffer/raw_json/credits.json')
let keywords = require('./buffer/raw_json/keywords.json')


function makeBin(binLow, binHigh) {
  // Filter movies for those only within the bin
  let movies = metadata.filter((m) => { 
    if(m.release_date == undefined || m.release_date == null || m.release_date == "") return false;
    let year = parseInt(m.release_date.substring(0,4))
    return year >= binLow && year < binHigh
  })

  // Find the keywords and credits for the movie, movie them to
  // that movie's entry in metadata. Notice the splice mutating
  // the arrays, shrinking search space.
  let filterFurther = []
  movies.forEach(e => {
    let c,k;
    for(k = 0; k < keywords.length; k++){
      if(keywords[k].id == e.id){
        e.keywords = keywords[k].keywords
        keywords.splice(k,1)
        break;
      }
    }
    if(e.keywords == undefined){
      filterFurther.push(e.id)
    }

    for(c = 0; c < credits.length; c++){
      if(credits[c].id == e.id){
        e.cast = credits[c].cast
        e.crew = credits[c].crew
        credits.splice(c,1)
        break;
      }
    }
  });
  return movies.filter(m => !filterFurther.includes(m.id));
}


function top3ForBin(movies){
  // Get frequency mapping of keyword -> count for all movies supplied.
  let frequencies = movies.reduce((acc, m) => {
    m.keywords.forEach((k) => {
      if(k.name in acc){
        acc[k.name]++;
      }else{
        acc[k.name] = 1;
      }
    })
    return acc
  }, {})

  // Reduce the frequency mapping to just top 3 keywords in an array form
  return Object.entries(frequencies).sort((a,b) => b[1] - a[1]).map(k => k[0]).slice(2)
}

let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
let KeywordMap = bins.reduce((acc, bin) =>{
  let binned = makeBin(bin[0], bin[1]);
  acc[bin[1]] = top3ForBin(binned)
  return acc
}, {})
fs.writeFileSync(__dirname+'/final/topkeywords.json', JSON.stringify(KeywordMap), 'utf8');