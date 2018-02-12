/**
 * 1. Load keywords.JSON & movies_metadata.json
 * 
 * OPTION A:
 * 2. Loop over movies_metadata:
 *  a. Loop over keywords -> find ID of movie. 
 *  b. Add keywords to movie entry. 
 *  c. Delete entry from keywords & break
 * 3. Reduce movies into groupings by bin:
 *  a. Reduce into Object
 *  b. Switch statement to determine bin.
 * 4. Store and operate
 * 
 * OPTION B:
 * 1b. Load credits.
 * 2. Filter movies_metadata by bin (so repeat for each bin)
 * 3. Reduce Keywords to be only those whose IDs are in the filtered metadata
 * 4. Join.
 * 5. Reduce credits to only those whose IDs are in the filtered metadata
 * 6. Join.
 * 7. Save each bin to file.
 */

 const credits = require('./data/buffer/credits.json')
 const keywords = require('./data/buffer/keywords.json')
 const metadata = require('./data/buffer/movies_metadata.json')

 function filter(binLow, binMax) {
   metadata.filter((m) => { m.})
 }