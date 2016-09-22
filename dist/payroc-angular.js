(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

module.exports = require('./lib/angular-payroc.js')

},{"./lib/angular-payroc.js":3}],2:[function(require,module,exports){
function payrocFactory ( ) {
  return function payrocAngular ($http) {
    var $payroc = {};

    /* step one: recover non sensitive data and retrieve form url */
    $payroc.stepOne = function ( path, nonSensitiveData ) {
      return $http({
        method: 'POST',
        url: path,
        data: JSON.stringify(nonSensitiveData),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    /* step two: send form url and sensitive data to retirve token id */
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

    $payroc.stepThree = function ( path ) {
      return $http({
        method: 'GET',
        url: path
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

payrocngular.provider('payrocConfig', function () {  
  this.setStepOnePath = function(stepOnePath) {
    this.stepOnePath = stepOnePath;
  }

  this.setStepTwoPath = function(stepTwoPath) {
    this.stepTwoPath = stepTwoPath;
  }

  this.$get =  function() {
    return this;
  }
});

payrocngular.directive('btfFormPayroc', ['$payroc', 'payrocConfig', function($payroc, payrocConfig) {
  return {
    scope: {},
    controller: function($scope) { },
    link: function(scope, element, attr) { },
    compile: function(element) {
      element.on('submit', function(e) {
        // Execute step-one and step-two to send non sensitive and sensitive info 
        var nonSensitiveData = {
          'amount': '12.00',
          'currency': 'USD',
          'order-id': '1234',
          'order-description': 'Small Order',
          'merchant-defined-field-1': 'Red',
          'merchant-defined-field-2': 'Medium',
          'tax-amount': '0.00',
          'shipping-amount': '0.00'  
        };
 
        var stepOne = $payroc.stepOne(payrocConfig.stepOnePath, nonSensitiveData);
          stepOne.then(function ( result ) {
            console.log('step one result', result.status);
            var formUrl = result.data.response['form-url'][0];
            var sensitiveData = {
              'billing-cc-number': '4111111111111111',
              'billing-cc-exp': '1012',
              'cvv': '2001',
              'form-url': formUrl 
            };

            var stepTwo = $payroc.stepTwo(payrocConfig.stepTwoPath, sensitiveData);
            stepTwo.then( function ( result ) {
              console.log('step two result', result);
              var locationUrl = result.data.location;
              var stepThree = $payroc.stepThree(locationUrl);
              stepThree.then( function ( result ) {
                console.log('step three result', result);
              }, function errorCallback ( response ) {
                console.log('error in step three payroc', response);
              });
            }, function errorCallback ( response ) {
              console.log('error in step two payroc', response);
            });
          }, function errorCallback( response) {
            console.log('error in step one payroc', response);
          });
      });
    }
  };
}]);

},{"./angular-payroc-factory":2}]},{},[1]);
