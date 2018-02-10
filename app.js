const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
var path = require('path')

app.get('/networkdata', (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.sendFile(path.join(__dirname + '/data_shapes/network_links.json'));
  });

  app.get('/networksize', (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.sendFile(path.join(__dirname + '/data_shapes/network_sizes.json'));
  });

  app.get('/networksummary', (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.sendFile(path.join(__dirname + '/data_shapes/network_summary.json'));
  });

app.listen(port, (err) => {
    if(err) {
        return console,log('something bad has happened', err)
    }
    console.log(`server is listening on ${port}`)
})