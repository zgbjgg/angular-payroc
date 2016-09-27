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
