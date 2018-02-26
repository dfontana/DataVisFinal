const express = require('express')
const app     = express();
const path    = require('path')
const port    = process.env.PORT || 8000;

const DATA_DIR = __dirname+'/data/final/'

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Validators
let validBin = (bin) => ['1950','1960','1970','1980','1990','2000','2010','2020'].includes(bin.substring(0,4))
let validInterest = (interest) => ['studio', 'actor', 'movie'].includes(interest)

/**
 * Network Endpoints
 *  /:bin
 *    /summary
 *    /:interest
 *      /size
 *      /link
 */
app.get('/topkeywords.json', (req, res) => {
  let keywords = require(DATA_DIR+'topkeywords.json')
  res.status(200).send(keywords);
})

app.get('/tSNE/coords/:bin', (req, res) => {
  const bin = req.params.bin;
  if(!validBin(bin)){
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  } 

  let links = require(`${DATA_DIR}tSNE/coords/${bin}`)
  res.status(200).send(links);
})

app.get('/tSNE/colors/:bin', (req, res) => {
  const bin = req.params.bin;
  if(!validBin(bin)){
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  } 

  let links = require(`${DATA_DIR}tSNE/colors/${bin}`)
  res.status(200).send(links);
})

app.get('/tSNE/nodes/:bin', (req, res) => {
  const bin = req.params.bin;
  if(!validBin(bin)){
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  } 

  let links = require(`${DATA_DIR}tSNE/details/${bin}`)
  res.status(200).send(links);
})

app.listen(port, (err) => {
    if(err) console.error(err)
    console.log(`RESTing on ${port}`)
})