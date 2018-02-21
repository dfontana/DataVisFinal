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
let validBin = (bin) => ['1950','1960','1970','1980','1990','2000','2010','2020'].includes(bin)
let validInterest = (interest) => ['studio', 'actor', 'movie'].includes(interest)

/**
 * Network Endpoints
 *  /:bin
 *    /summary
 *    /:interest
 *      /size
 *      /link
 */
app.get('/:bin/summary', (req, res) => {
  const bin = req.params.bin;
  if(!validBin(bin)) {
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  }

  let keywords = require(DATA_DIR+'topkeywords.json')
  res.status(200).send(keywords[bin]);
})
app.get('/:bin/:interest/size', (req, res) => {
  const bin = req.params.bin;
  const interest = req.params.interest;
  if(!validBin(bin)){
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  } 
  if(!validInterest(interest)){
    res.status(400).send({ error: `Invalid interest provided: ${interest}` });
    return
  }

  let sizes = require(`${DATA_DIR}${interest}Maps.json`)
  res.status(200).send(sizes[bin]);
})
app.get('/:bin/:interest/link', (req, res) => {
  const bin = req.params.bin;
  const interest = req.params.interest;
  if(!validBin(bin)){
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  } 
  if(!validInterest(interest)){
    res.status(400).send({ error: `Invalid interest provided: ${interest}` });
    return
  } 

  let links = require(`${DATA_DIR}${interest}Links.json`)
  res.status(200).send(links[bin]);
})

app.get('/tSNE/:bin/coords', (req, res) => {
  const bin = req.params.bin;
  if(!validBin(bin)){
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  } 

  let links = require(`${DATA_DIR}tSNE/${bin}-coords.json`)
  res.status(200).send(links);
})
app.get('/tSNE/:bin/nodes', (req, res) => {
  const bin = req.params.bin;
  if(!validBin(bin)){
    res.status(400).send({ error: `Invalid bin provided: ${bin}` });
    return
  } 

  let links = require(`${DATA_DIR}tSNE/${bin}-details.json`)
  res.status(200).send(links);
})

/**
 * Bottom Half
 *  /clusters
 *    /:interest
 * 
 *  /bar
 *    /actors
 *    /studios
 * 
 *  /line
 *    /:interest
 */
app.get('/clusters/:interest', (req, res) => {
  const interest = req.params.interest;
  if(!validInterest(interest)) {
    res.status(400).send({ error: `Invalid interest provided: ${interest}` });
    return
  } 
  res.status(200).send(`${DATA_DIR}${interest}Clusters.json`);
})
app.get('/line/:interest', (req, res) => {
  const interest = req.params.interest;
  if(!validInterest(interest)){
    res.status(400).send({ error: `Invalid interest provided: ${interest}` });
    return
  }
  res.status(200).sendFile(`${DATA_DIR}${interest}Lines.json`);
})
app.get('/bar/actor', (req, res) => {
  res.status(200).sendFile(`${DATA_DIR}actorBars.json`);
})
app.get('/bar/studio', (req, res) => {
  res.status(200).sendFile(`${DATA_DIR}studioBars.json`);
})

/**
 * General purpose
 *  /wordMap
 */
app.get('/wordMap', (req, res) => {
  res.status(200).sendFile(`${DATA_DIR}wordMap.json`);
})

app.listen(port, (err) => {
    if(err) console.error(err)
    console.log(`RESTing on ${port}`)
})