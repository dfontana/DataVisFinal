// Must run with --max-old-space-size=4096 to increase heap... 
/**
 * Converts the Credits, Metadata, and Keyword CSVS into jsons for easier
 * operations. This will clean the data of escape codes from the latin-1 encoding.
 */
const d3 = require('d3')
const fs = require('fs')
const JSON5 = require('json5');

const DATA_ROOT = __dirname+'/buffer';

let credits = d3.csvParse(fs.readFileSync(DATA_ROOT+'/raw_csv/credits.csv', 'utf8'), function(d) {
  d.cast = JSON5.parse(d.cast.replace(/None\b/g, '""').replace(/\\xad|\\xa0|\\x92/g, ''));
  d.crew = JSON5.parse(d.crew.replace(/None\b/g, '""').replace(/\\xad|\\xa0|\\x92/g, ''));
  return d
})
fs.writeFileSync(DATA_ROOT+'/raw_json/credits.json', JSON.stringify(credits), 'utf8');

// Ingest the Metadata file
let metadata = d3.csvParse(fs.readFileSync(DATA_ROOT+'/raw_csv/movies_metadata.csv', 'utf8'), function(d) {
  if(d.genres){
    d.genres = JSON5.parse(d.genres)
  }

  if(d.production_companies){
    d.production_companies = JSON5.parse(d.production_companies.replace(/\\xa0/g, ' '))
  }

  if(d.production_countries){
    d.production_countries = JSON5.parse(d.production_countries)
  }

  if(d.belongs_to_collection) {
    d.belongs_to_collection = JSON5.parse(d.belongs_to_collection.replace(/None\b/g, '""')) 
  }

  if(d.spoken_languages) {
    d.spoken_languages = JSON5.parse(d.spoken_languages.replace("\\x9a", 's'))
  }
  return d;
});
fs.writeFileSync(DATA_ROOT+'/raw_json/movies_metadata.json', JSON.stringify(metadata), 'utf8');

// Ingest the keywords file
let keywords = d3.csvParse(fs.readFileSync(DATA_ROOT+'/raw_csv/keywords.csv', 'utf8'), function(d) {
  d.keywords = JSON5.parse(d.keywords.replace(/\\xa0/g, ' '))
  return d
})
fs.writeFileSync(DATA_ROOT+'/raw_json/keywords.json', JSON.stringify(keywords), 'utf8');