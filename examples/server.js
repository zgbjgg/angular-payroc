var express = require('express')
var fs = require('fs')
var path = require('path')
var bodyParser = require('body-parser')
var payroc = require('node-payroc')
var app = express()

payroc.configure({
  apiKey: '2F822Rw39fx762MaV7Yy86jXGTC7sCDy',
  url: 'https://payroc.transactiongateway.com/api/v2/three-step',
  redirectUrl: 'http://127.0.0.1:8000/token'
})

var angularStr = fs.readFileSync(path.resolve(__dirname, '../bower_components/angular/angular.js'), 'utf8')
var payrocAngularStr = fs.readFileSync(path.resolve(__dirname, '../dist/payroc-angular.js'), 'utf8')

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json({
  limit: '50mb', 
  extended: true
}));

app.post('/step-one-path', function (req, res) {
  /* recover body (json) */
  var jsonBody = req.body;

  payroc.step_one(jsonBody, function(err, result) {
    if ( err ) {
      res.send({error: 'error'});
    } else {
      res.send(result);
    }
  });
})

app.post('/step-two-path', function(req, res) {
  /* recover body in url encoded */
  var urlEncoded = req.body;

  payroc.step_two(urlEncoded, function(err, result) {
    if ( err ) {
      res.send({error: 'error'});
    } else {
      res.send(result);
    }
  });
})

app.get('/token', function (req, res) {
  res.send('PAYMENT SUCCESS')
});

app.get('/angular.js', function (req, res) {
  res.send(angularStr)
})

app.get('/payroc-angular.js', function (req, res) {
  res.send(payrocAngularStr)
})

app.use(express.static(__dirname))

var port = 8000
app.listen(port) /*, '0.0.0.0', () => {
  console.log('Running at 0.0.0.0:' + port)
  console.log('Check out these examples:')
  fs.readdirSync(__dirname)
    .filter((fileName) => fileName.match(/\.html$/))
    .map((fileName) => console.log('- http://localhost:' + port + '/' + fileName))
})*/
