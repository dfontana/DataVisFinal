/**
 * Makes the list of movies and it's keywords, cast, and crew
 * for the given bin. This is returned as an array of Movie
 * Metadata records that have been updated to have a keywords,
 * cast, and crew field storing the respective data.
 * 
 * Use this as a starting point when inspecting a bin.
 */
const fs = require('fs')
const metadata = require('./buffer/raw_json/movies_metadata.json')
let credits = require('./buffer/raw_json/credits.json')
let keywords = require('./buffer/raw_json/keywords.json')

function loadWordMap(){
  try{
    return require('./final/wordMap.json')
  }catch(e){
    return {};
  }
}

function saveWordMap(map) {
  fs.writeFileSync(__dirname+'/final/wordMap.json', JSON.stringify(map), 'utf8');
}

function makeBin(binLow, binHigh) {
  let wordMap = loadWordMap();

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
        e.keywords = keywords[k].keywords.map((entry) => {
          if(!(entry.id in wordMap)){
            wordMap[entry.id] = entry.name;
          }
          return entry.id;
        })
        keywords.splice(k,1)
        break;
      }
    }
    if(e.keywords == undefined || e.keywords.length === 0){
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

  saveWordMap(wordMap)
  return movies.filter(m => !filterFurther.includes(m.id));
}

module.exports = makeBin;