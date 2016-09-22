var payrocFactory = require('./angular-payroc-factory');
var payrocngular = window.angular.module('angular-payroc', []);

payrocngular.factory('$payroc', [
  '$http',
  payrocFactory()
])

payrocngular.provider('payrocConfig', function () {  
  this.setRedirectUrl = function(redirectUrl) {
    this.redirectUrl = redirectUrl;
  }

  this.setClientPath = function(clientPath) {
    this.clientPath = clientPath;
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
 
        var stepOne = $payroc.stepOne(payrocConfig.clientPath, nonSensitiveData);
          stepOne.then(function ( result ) {
            console.log('step one result', result.status);
            var formUrl = result.data.response['form-url'][0];
            var sensitiveData = {
              'billing-cc-number': '4111111111111111',
              'billing-cc-exp': '1012',
              'cvv': '2001'  
            };

            var stepTwo = $payroc.stepTwo(formUrl, sensitiveData);
            stepTwo.then( function ( result ) {
              console.log('step two result', result);
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
