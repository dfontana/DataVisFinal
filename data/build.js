const d3 = require('d3')
const fs = require('fs')
const JSON5 = require('json5');


const metadata = d3.csvParse(fs.readFileSync(__dirname+'/movie_data/movies_metadata_cleaned.csv', 'utf8'), function(d) {
  if(d.genres){
    d.genres = JSON5.parse(d.genres)
  }

  if(d.production_companies){
    d.production_companies = JSON5.parse(d.production_companies.replace(/\\xa0/g, ''))
  }

  if(d.production_countries){
    d.production_countries = JSON5.parse(d.production_countries)
  }

  if(d.belongs_to_collection) {
    d.belongs_to_collection = JSON5.parse(d.belongs_to_collection.replace(/None/g, '""')) 
  }

  if(d.spoken_languages) {
    d.spoken_languages = JSON5.parse(d.spoken_languages.replace("\\x9a", 's'))
  }
  return d;
});

console.log(metadata)