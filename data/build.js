const d3 = require('d3')
const fs = require('fs')


const metadata = d3.csvParse(fs.readFileSync(__dirname+'/movies_metadata.csv', 'utf8'), function(d) {
  console.log(d.genres)
  console.log(JSON.stringify(d.genres))

  d.genres = JSON.parse(d.genres),
  d.production_companies = JSON.parse(d.production_companies),
  d.production_countries = JSON.parse(d.production_countries),
  d.belongs_to_collection = JSON.parse(d.belongs_to_collection), 
  d.spoken_languages = JSON.parse(d.spoken_languages)
  return d;
});

console.log(metadata)