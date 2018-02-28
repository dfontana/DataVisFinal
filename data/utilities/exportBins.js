const Bin = require('../buildBin')
const fs = require('fs')
const path = require('path')

const DATA_ROOT = path.join(__dirname, '../buffer');

let bins = [[0, 1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
let filtered = bins.reduce((acc, bin) =>{ 
  let binned = Bin(bin[0], bin[1]);
  return [...acc, ...binned]
}, [])

fs.writeFile(DATA_ROOT+'/filteredData.json', JSON.stringify(filtered), 'utf8', ()=>{});