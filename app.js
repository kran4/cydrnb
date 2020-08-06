import angular from 'angular';

// Create an angular module named 'app'.
angular.module('app', []);

// Put application code here before bootstrap is called.
angular.module('app').controller('MainCtrl', function ($scope){
  $scope.message = 'hello';

  $scope.updateMessage = function(message){
    $scope.message = message;
  };
});

// Bootstrap angular onto the 'app' element, injecting the 'app' module.
angular.bootstrap(document.getElementById('app'), ['app']);

  var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
  function doCORSRequest(options, fcn) {
    var x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function() {
      fcn(x);
    };
    if (/^POST/i.test(options.method)) {
      x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    x.send(options.data);
  }

  doCORSRequest({
      method:  'GET',
      url: 'https://scene.eldertaleonline.com/api/cards.json',
      data: ''
    }, function printResult(result) {
      var data = result.responseText;
      data = JSON.parse(data);
      console.log(data);
  });