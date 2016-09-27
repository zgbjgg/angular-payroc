(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

module.exports = require('./lib/angular-payroc.js')

},{"./lib/angular-payroc.js":3}],2:[function(require,module,exports){
function payrocFactory ( ) {
  return function payrocAngular ($http) {
    var $payroc = {};

    /* step one: send non sensitive data to server path */
    $payroc.stepOne = function ( path, nonSensitiveData ) {
      return $http({
        method: 'POST',
        url: path,
        data: JSON.stringify(nonSensitiveData),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    /* step two: send sensitive data to server path to redirect url */
    $payroc.stepTwo = function ( path, sensitiveData ) {
      var config = {
        method: 'POST',
        url: path,
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: sensitiveData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      };
      return $http(config);
    }

    /* step three: consume location redirection url with token */
    $payroc.stepThree = function ( path ) {
      /* since location url is the redirection url, 
         then we must parse the full URL */
      var parser = document.createElement('a');
      parser.href = path;
      return $http({
        method: 'GET',
        url: parser.pathname + parser.search
      });
    }

    return $payroc;
  }
}

module.exports = payrocFactory;

},{}],3:[function(require,module,exports){
var payrocFactory = require('./angular-payroc-factory');
var payrocngular = window.angular.module('angular-payroc', []);

payrocngular.factory('$payroc', [
  '$http',
  payrocFactory()
])

payrocngular.provider('Payroc', function( ) {
  var options = {
    stepOnePath: null,
    stepTwoPath: null
  };

  this.setStepOnePath = function(path) {
    options.stepOnePath = path;
  }

  this.setStepTwoPath = function(path) {
    options.stepTwoPath = path;
  } 

  this.$get = [ '$payroc', function( $payroc ) {
    var svc = {
      payment: function(nonSensitiveData, sensitiveData, callback) {
        var stepOnePath = options.stepOnePath;
        var stepTwoPath = options.stepTwoPath;
	
        var stepOne = $payroc.stepOne(stepOnePath, nonSensitiveData);
        
        /* execute step one */
        stepOne.then(function ( result ) {
         
          var formUrl = result.data.response['form-url'][0];

          /* maybe set to invalid endpoint then return error */
          if ( typeof formUrl === 'undefined' ) {
            callback({error: 1, log: 'form-url invalid'});
          } else {
            
            sensitiveData['form-url'] = formUrl;
      
            var stepTwo = $payroc.stepTwo(stepTwoPath, sensitiveData);
 
            /* execute step two */
            stepTwo.then( function ( result ) {
              
              var locationUrl = result.data.location;
              
               /* maybe set to invalid location then return error */
               if ( typeof locationUrl === 'undefined' ) {
                 callback({error: 2, log: 'location url invalid'});
               } else {
                 var stepThree = $payroc.stepThree(locationUrl);
               
                 stepThree.then( function ( result ) {
                   callback(result);
                 }, function errorCallback ( response ) {
                   callback({error: 3, log: response});
                 });
               }
            }, function errorCallback ( response ) {
              callback({error: 2, log: response});
            });
          }
        }, function errorCallback ( response ) {
          callback({error: 2, log: response});
        });
      }
    };
    return svc;
    }
  ];
});

},{"./angular-payroc-factory":2}]},{},[1]);
