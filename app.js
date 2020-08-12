import angular from 'angular';

// Create an angular module named 'app'.
angular.module('app', []);

// Put application code here before bootstrap is called.
angular.module('app').controller('MainCtrl', function ($scope){
  var s = $scope;
  var cors_api_url = 'https://cors-anywhere.herokuapp.com/';

  //define the data to be displayed and match its internal structure
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
    {display: "Heal", col: "heal"},
    {display: "Hits", col: "hits"},
    {display: "Targets", col: "target"},
    {display: "Effects", col: "effect"}
  ];
  for(var i in s.headers) {
    s.headers[i].show = true;
    s.headers[i].order = parseInt(i);
  }

  s.data = [];
  s.loadComplete = false;
  s.showColumnSelect = false;
  s.search = [];

  s.toggleColumn = function(header) {
    header.show = !header.show;
  };

  s.reorderColumn = function(header, direction) {
    if(direction == 'up') {
      if(header.order == 0)
        return; //already at top
      var otherHeader = getHeaderWithOrder(header.order - 1);
      if(otherHeader)
        swapOrder(header, otherHeader);
    } else { //down
      if(header.order == s.headers.length - 1)
        return; //already at bottom
      var otherHeader = getHeaderWithOrder(header.order + 1);
      if(otherHeader)
        swapOrder(header, otherHeader);
    }
    //console.log(s.headers);
  };

  // returns the header object with the given order, or false if not found
  function getHeaderWithOrder(order) {
    for(var i in s.headers) {
      if(s.headers[i].order == order)
        return s.headers[i];
    }
    return false;
  }

  //returns the header object for the given column, or false if not found
  function getHeaderWithCol(col) {
    for(var i in s.headers) {
      if(s.headers[i].col == col)
        return s.headers[i];
    }
    return false;
  }

  // swaps the ordering of two columns
  function swapOrder(item1, item2) {
    var temp = item2.order;
    item2.order = item1.order;
    item1.order = temp;
  }

  s.getOrder = function(item) {
    return item.order;
  };

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


  if(!(s.message)) //unnecessary check??
    s.message = "Loading."

  //acquire data from ETO
  doCORSRequest({
      method:  'GET',
      url: 'https://scene.eldertaleonline.com/api/cards.json',
      data: ''
    }, function(result) {
      try {
        s.data = result.responseText;
        s.data = JSON.parse(s.data);
        s.loadComplete = true;
        parseData(s.data);
        console.log("Success");
        console.log(s.data); 
      } catch(err) {
        console.log("Failure");
        console.log(err.message);
      }
    }
  );

  //collapse data structure for easier display
  function parseData(data) {
      for(var i in data) {
        data[i].type = data[i].Data.type;
        data[i].require = concatenateConcepts(data[i].Data.conceptrequirement);
        data[i].grant = concatenateConcepts(data[i].Data.concept);
        data[i].target = data[i].Data.targets ? data[i].Data.targets.join(', ') : '';
        data[i].rarity = data[i].Data.rarity || '';
        data[i].cost = data[i].Data.cost || '';
        data[i].damage = data[i].Data.damage || '';
        data[i].defense = data[i].Data.defense || '';
        data[i].hits = data[i].Data.hits || '';
        data[i].heal = data[i].Data.heal || '';
        data[i].effect = parseEffects(data[i].Data.effects);
    }
  }

  //known attributes in Data.effects, used to recognize new ones
  var effectAttributes = [
    "trigger", "name", "deck", "card", "intensity",
    "type", "hitduration", "roundduration"
  ];

  //format: each effect in square brackets, comma-dilineated
  // [$trigger: ][$name][ $deck][ $card][ $intensity][ $type][ for ][ $hitduration hit(s)][ / ][ $roundduration rd(s)]
  // [ / ] shown only if hitduration && roundduration both present
  function parseEffects(arr) {
    if(!arr || !arr.length)
      return '';
    var ret = '';
    for(var i in arr) {
      if(ret.length > 0)
        ret += ', '
      ret += '[';
      if(arr[i].trigger)
        ret += arr[i].trigger + ': '
      if(arr[i].name)
        ret += arr[i].name;
      if(arr[i].deck)
        ret += ' ' + arr[i].deck;
      if(arr[i].card)
        ret += ' ' + arr[i].card;
      if(arr[i].intensity)
        ret += ' ' + arr[i].intensity;
      if(arr[i].type)
        ret += ' ' + arr[i].type;
      var hits = arr[i].hitduration;
      var rds = arr[i].roundduration;
      if(hits || rds) {
        ret += ' for ';
        if(hits)
          ret += hits + (hits == 1 ? ' hit' : ' hits');
        if(hits && rds)
          ret += ' / ';
        if(rds)
          ret += rds + (rds == 1 ? ' rd' : ' rds');
      }

      //check for any novel attributes
      var keys = Object.getOwnPropertyNames(arr[i]);
      for(var j in keys) {
        if(effectAttributes.indexOf(keys[j]) < 0) {
          ret += " ???";
          break;
        }
      }
      ret += ']'
    }
    return ret;
  }

  //include count-2 concepts twice
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

  //mystery function that does nothing but is required
  s.update = function() {
    console.log(s.data.length);
  };

  s.sortBy = s.headers[0].col; //default to first column
  //toggle ASC and DESC sorting
  s.sort = function(col) {
    if(col != s.sortBy)
      s.sortBy = col;
    else
      s.sortBy = '-' + s.sortBy;
  };

  //parse search terms and filter on the given item
  s.filterBySearch = function(item) {
    for(var col in s.search) {
      if(!s.search[col])
        continue;
      var phrase = s.search[col].split("&&");
      for(var i in phrase) {
        var search = phrase[i].trim();
        var exact = false;
        var not = false;
        if(search[0] == '!') {
          search = search.substr(1);
          not = true;
        }
        if(search[0] == '=') {
          search = search.substr(1);
          exact = true;
        }
        var val = item[col] || '';
        if(exact) { //exact
          var match = val == search;
          if(not)
            match = !match;
          if(!match)
            return false;
        } else if(not && search == '') { //not empty
          if(val == '')
            return false;
        } else { //contains
          search = search.toLowerCase();
          val = ('' + val).toLowerCase();
          var found = val.indexOf(search) >= 0;
          if(not) //does not contain
            found = !found;
          if(!found)
            return false;
        }
      }
    }
    return true;
  };

  s.getShow = function(item) {
    return item.show;
  }
});


// Bootstrap angular onto the 'app' element, injecting the 'app' module.
angular.bootstrap(document.getElementById('app'), ['app']);