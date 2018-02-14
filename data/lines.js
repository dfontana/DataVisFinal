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
    let moviesInBin = Object.keys(movieMaps[bin].keywordmap)
    let lineSlice = moviesInBin.reduce((acc, mID) => {
      let keywords = movieMaps[bin].keywordmap[mID]

      // For each year's theme
      bins.map(year => {
        let theme = TopKeywords[year]

        // If the current movie's keywords has the theme
        // Increase the frequency for that theme
        theme.map(term => {
          if(keywords.includes(term)){
            acc[year] = (acc[year] || 0) + 1;
          }
        })
      })
      
    return acc;
    }, {})

    // X (bin) => Y Values of each Years_Theme.
    acc[bin] = lineSlice;
    return acc;
  }, {})
}

fs.writeFile(__dirname+'/final/movieLines.json', JSON.stringify(moviesPop()), 'utf8', ()=>{});