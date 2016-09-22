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
    $payroc.stepTwo = function ( formUrl, sensitiveData ) {
      var config = {
        method: 'POST',
        url: formUrl,
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: sensitiveData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'}
      };
      console.log(config);
      return $http(config);
    }

    return $payroc;
  }
}

module.exports = payrocFactory;
