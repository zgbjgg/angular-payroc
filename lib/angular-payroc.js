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
