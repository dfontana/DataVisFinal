const { spawnSync } = require("child_process");
const fs = require('fs')

const bins = [[0,1950], [1951, 1960], [1961,1970], [1971, 1980], [1981, 1990], [1991, 2000], [2001, 2010], [2011, 2020]]
bins.map(bin =>{
  console.log('Starting Bin: ', bin[1])
  console.time("tSNE")

  const bhTSNE = spawnSync('python',["../../deps/bhtsne-master/bhtsne.py", '-d', '2', '-p', '5', '-i', `../buffer/${bin[1]}-features.tsv`]);
  let out = String(bhTSNE.stdout).split('\n').map(pair => pair.split('\t').map(n => Number(n)))
  fs.writeFileSync(`../final/tSNE/${bin[1]}-coords.json`, JSON.stringify(out), 'utf8', ()=>{});

  console.timeEnd("tSNE")
})