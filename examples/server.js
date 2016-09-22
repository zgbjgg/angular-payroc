var express = require('express')
var fs = require('fs')
var path = require('path')
var bodyParser = require('body-parser')
var request = require('request')
var js2xmlparser = require("js2xmlparser");
var parseString = require('xml2js').parseString;
var app = express()

var gateway = {
  apiKey: '2F822Rw39fx762MaV7Yy86jXGTC7sCDy',
  url: 'https://payroc.transactiongateway.com/api/v2/three-step',
  redirectUrl: 'http://127.0.0.1:8000/token'
}

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

  /* add api key and redirect url */
  jsonBody['api-key'] = gateway.apiKey;
  jsonBody['redirect-url'] = gateway.redirectUrl;

  // to xml
  var xmlRequest = js2xmlparser.parse("sale", jsonBody);

  // send request
  request.post({
    url: gateway.url,
    body : xmlRequest,
    headers: {'Content-Type': 'text/xml'}
  }, function (error, response, body) {        
    if (!error && response.statusCode == 200) {
      parseString(body, function(err, result) {
        res.send(result);
      });
    } else {
      console.log(error);
    }
  });
})

app.post('/step-two-path', function(req, res) {
  /* recover body in url encoded */
  var urlEncoded = req.body;
  var formUrl = urlEncoded['form-url'];
  delete urlEncoded['form-url'];

  // send request
  request.post({
    url: formUrl, 
    form: urlEncoded
  }, function(error, response, body) { 
    if (!error && response.statusCode === 302) {
      // send redirect location back to client
      res.send({location: response.headers.location});
    } else {
      console.log(error);
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
