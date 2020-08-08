import angular from 'angular';

// Create an angular module named 'app'.
angular.module('app', []);

// Put application code here before bootstrap is called.
angular.module('app').controller('MainCtrl', function ($scope){
  var s = $scope;
  var cors_api_url = 'https://cors-anywhere.herokuapp.com/';

  s.headers = [
    {display: "Title", col: "Title"},
    {display: "Type", col: "type", dropdown:
      [{val: '', display: '[All]'},
      {val: '=Attack', display: 'Attack'},
      {val: '=Defense', display: 'Defense'},
      {val: '=Utility', display: 'Utility'},
      {val: '=Special', display: 'Special'}]},
    {display: "Rarity", col: "rarity", dropdown:
      [{val: '', display: '[All]'},
      {val: '=Common', display: 'Common'},
      {val: '=Uncommon', display: 'Uncommon'},
      {val: '=Rare', display: 'Rare'},
      {val: '=Epic', display: 'Epic'}]},
    {display: "Description", col: "Description"},
    {display: "Requires", col: "require"},
    {display: "Grants", col: "grant"},
    {display: "Energy Cost", col: "cost"},
    {display: "Attack", col: "damage"},
    {display: "Defense", col: "defense"},
    {display: "Hits", col: "hits"},
    {display: "Targets", col: "target"},
    {display: "Effects", col: "effect"}
  ];

  s.search = [];

  //define a function to proxy out HTTP requests
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
  s.data = [];
  s.loadComplete = false;

  if(!(s.message))
    s.message = "Loading."
  //acquire data from ETO
  doCORSRequest({
      method:  'GET',
      url: 'https://scene.eldertaleonline.com/api/cards.json',
      data: ''
    }, function(result) {
      s.data = result.responseText;
      s.data = JSON.parse(s.data);
      s.loadComplete = true;
      processData(s.data);
      console.log("Success");
      console.log(s.data);
  });

  function processData(data) {
      for(var i in data) {
        data[i].type = data[i].Data.type;
        data[i].require = concatenateConcepts(data[i].Data.conceptrequirement);
        data[i].grant = concatenateConcepts(data[i].Data.concept);
        data[i].target = data[i].Data.targets ? data[i].Data.targets.join(', ') : '';
        data[i].rarity = data[i].Data.rarity;
        data[i].cost = data[i].Data.cost;
        data[i].damage = data[i].Data.damage;
        data[i].effect = data[i].Data.effe
    }
  }

  function concatenateConcepts(arr) {
    var ret = '';
    for(var j in arr) {
      for(var k=0; k<arr[j].count; k++) {
        if(ret.length > 0)
          ret += ', ';
        ret += '[' + arr[j].name + ']';
      }
    }
    return ret;
  }

  s.update = function() {
    console.log(s.data.length);
  };

  s.sortBy = s.headers[0].col; //default to first column
  s.sort = function(col) {
    if(col != s.sortBy)
      s.sortBy = col;
    else
      s.sortBy = '-' + s.sortBy;
  }

  s.filterBy = function(item) {
    for(var i in s.search) {
      if(!s.search[i])
        continue;
      var exact = false;
      var search = s.search[i];
      if(search[0] == '=') {
        search = search.substr(1);
        exact = true;
      }
      var col = s.headers[i].col;
      if(exact) {
        if(item[col] != search)
          return false;
      } else { //partial match
        search = search.toLowerCase();
        var val = item[col].toLowerCase();
        if(val.indexOf(search) < 0)
          return false;
      }
    }
    return true;
  };
});


// Bootstrap angular onto the 'app' element, injecting the 'app' module.
angular.bootstrap(document.getElementById('app'), ['app']);