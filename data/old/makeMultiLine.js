/** 
 * Builds the maps necessary for plotting the multiline graph.
 */
const TopKeywords = require('./final/topkeywords.json')
const studioMaps = require('./final/studioMaps.json')
const actorMaps = require('./final/actorMaps.json')
const movieMaps = require('./final/movieMaps.json')
const fs = require('fs')

function moviesPop(){
  let bins = Object.keys(TopKeywords)

  // For each X value (bin)
  return bins.reduce((acc, bin) => {

    // Get Y Values from movies of the current X-Value (bin)
    let lineSlice = Object.keys(movieMaps[bin].keywordmap).reduce((acc, mID) => {
      let keywords = movieMaps[bin].keywordmap[mID]

      // For each year's theme, if the movie has part of the theme
      // increase the frequency of that theme.
      bins.map(year => {
        let hasTheme = keywords.filter(k => TopKeywords[year].includes(k)).length > 0;
        if(hasTheme){
          acc[year] = (acc[year] || 0) + 1;
        }
      })
      
    return acc;
    }, {})

    // X (bin) => Y Values of each Years_Theme.
    acc[bin] = lineSlice;
    return acc;
  }, {})
}

function popularity(maps){
  let bins = Object.keys(TopKeywords)

  // For each X value (bin)
  return bins.reduce((acc, bin) => {

    // Get Y Values from movies of the current X-Value (bin)
    let lineSlice = Object.keys(maps[bin].keywordmap).reduce((acc, mapID) => {

      // For each movie of the Bin the actor/studio is in, if the movie has a theme increase
      // its frequency. An actor/studio, however, cannot be counted more than three times
      // per theme as we want to look at actors/studios, not movies, portraying the theme.
      let limiter = {}
      maps[bin].keywordmap[mapID].map(movie => {
        let keywords = movieMaps[bin].keywordmap[movie.id]
        for(let crtYear = 0; crtYear < bins.length; crtYear++){
          let year = bins[crtYear];
          if(limiter[year] == 3) continue;

          let hasTheme = keywords.filter(k => TopKeywords[year].includes(k)).length > 0;
          if(hasTheme){
            acc[year] = (acc[year] || 0) + 1;
            limiter[year] = (limiter[year] || 0) + 1; 
          }
        }
      })
      return acc;
    }, {})

    // X (bin) => Y Values of each Years_Theme.
    acc[bin] = lineSlice;
    return acc;
  }, {})
}

fs.writeFile(__dirname+'/final/movieLines.json', JSON.stringify(moviesPop()), 'utf8', ()=>{});
fs.writeFile(__dirname+'/final/actorLines.json', JSON.stringify(popularity(actorMaps)), 'utf8', ()=>{});
fs.writeFile(__dirname+'/final/studioLines.json', JSON.stringify(popularity(studioMaps)), 'utf8', ()=>{});