angular.module('angular-payroc', []).
  directive('btfFormPayroc', function() {
    return {
      controller: function($scope) {
        $scope.post = function() {
          console.log($scope);
        }
      },
      link: function(scope, iElem, iAttr) {
        scope.postPath = iAttr['postPath'];
        console.log(scope.postPath);
      }
    };
  });
