angular.module('demoApp', ['angular-advanced-searchbox'])

.controller('gridCtrl', ['$scope', '$rootScope', '$http', 'Facet', 'Value', function($scope, $rootScope, $http, Facet, Value) {
  window.MY_SCOPE = $scope;
  window.rootScope = $rootScope;

  $scope.searchText = "*";

  $scope.search = function(){
    if(!$scope.facets){
      $scope.initFacets();
    }
    if(typeof $scope.searchParams !== "undefined"){
      $scope.updateSearchParams();
    }
    var url = createUrl();
    //url = encodeURIComponent(url);
    // if(!$rootScope.authString){
    //   var authString = createAuthString($scope.username, $scope.password);
    // }
    // $http.defaults.headers.common['Authorization'] = 'Basic ' + $scope.username + ':' + $scope.password;
    console.log("Query: "+ url);
    $http.get(url)//, {headers: {'Authorization': authString}})
    .success(function(response) {
      $scope.demodata = response;
      $scope.setTotalCount();
      $scope.updateFacets();
    });
  };

  $rootScope.search = $scope.search;

  $scope.updateSearchParams = function(){
    if(typeof $scope.searchParams['query'] !== "undefined"){
      $scope.searchText = $scope.searchParams['query'];
    }
    if(typeof $scope.searchParams['vertical'] !== "undefined"){
      $scope.facets[0].deactivateAll();
      $scope.facets[0].setSingleActiveValue($scope.searchParams['vertical']);
    }
    if(typeof $scope.searchParams['feature'] !== "undefined"){
      $scope.facets[0].deactivateAll();
      $scope.facets[1].setSingleActiveValue($scope.searchParams['feature']);
    }
    if(typeof $scope.searchParams['demoType'] !== "undefined"){
      $scope.facets[0].deactivateAll();
      $scope.facets[2].setSingleActiveValue($scope.searchParams['demoType']);
    }
  };

  $rootScope.updateSearchParams = $scope.updateSearchParams;

  $scope.availableSearchParams = [
    { key: "filename", name: "File Name", placeholder: "Name..." },
    { key: "vertical", name: "Vertical", placeholder: "Vertical..." },
    { key: "feature", name: "Feature", placeholder: "Feature..." },
    { key: "demoType", name: "Demo Type", placeholder: "Demo type..." }
  ];
  //
  // var createAuthString = function(username, password){
  //   var authBase = "Base ";
  //   $http.defaults.headers.common.get = {'Authorization' : authBase.concat(authString)};
  //   var rawString = username.concat(":").concat(password);
  //   var authString = btoa(rawString);
  //   authString = authBase.concat(authString);
  //   console.log("$rootScope.authString = " + authString);
  //   // $rootScope.authString = authString;
  //   $rootScope.authString = authString;
  //   return authString;
  // };

  // Creates the URL for the RESTful request from the Attivio Instance
  var createUrl = function(){
    // var head = "http://acevm0625.lab.attivio.com:17000/rest/searchApi/simpleCgi?q=";
    var head = "http://acevm0625.lab.attivio.com/DemoGrid/search?q=";
    //setSearchText();
    var q = $scope.searchText.replace(/ /g, "+");
    var tail = "&workflow=searchScripts";
    var facetPart = constructFacetFilters();
    //var userPart = constructUserPart();
    console.log("facetPart is: " + facetPart);
    var fullQuery = head.concat('"' + q + '"').concat(tail).concat(facetPart);//.concat(userPart);
    return fullQuery;
  };

  // Set's scope.searchText to the value of search box if existant, otherwise sets it to * for "all"
  setSearchText = function(){
    console.log("setSearchText was called");
    console.log("Type of query: " + (typeof $scope.searchParams['query']));
    console.log("Value of query: " + $scope.searchParams['query']);
    if(typeof $scope.searchParams['query'] !== "undefined" && $scope.searchParams['query'].length > 0){
      $scope.searchText = $scope.searchParams['query'];
      console.log("used the value from query: " + $scope.searchParams['query']);
    }
    else{
      $scope.searchText = "*";
      console.log("Used default value: *");
    }
  };
  // var constructUserPart = function(){
  //   var part = "&username=";
  //   return part.concat($scope.username).concat("&realm=").concat($scope.realm);
  // }

  // Constructs the part of the RESTful request that filters on facets
  // var constructFacetFilters = function(){
  //   var query="";
  //   if ($scope.facets.length > 0 && confirmActiveFacets()){
  //     for(f in $scope.facets){
  //       query = makeFirstFacetFilter($scope.facets[f], query);
  //     }
  //     query = query.substring(0, query.length - 5);
  //     for(f in $scope.facets){
  //       query = makeSecondFacetFilter($scope.facets[f], query);
  //     }
  //   }
  //   $rootScope.facets = $scope.facets;
  //   return query;
  // };
  var constructFacetFilters = function(){
    var query="";
    if ($scope.facets.length > 0 && confirmActiveFacets()){
      for(f in $scope.facets){
        query = makeFacetFilter($scope.facets[f], query);
      }
      if(query.length > 1){
        var preface = "&filter=AND(";
        query = preface.concat(query);
        query = query.substring(0, query.length - 1).concat(")");
      }
      else{
        query = "";
      }
    }
    $rootScope.facets = $scope.facets;
    return query;
  };

  var makeFacetFilter = function(facet, query){
    var partialFilter = "";
    for (v in facet.activeValues){
      var name = facet.activeValues[v];
      if(name === "All"){
        return query;
      }
      else {
        partialFilter = partialFilter.concat(facet.fieldName + ":" + '"' + name + '"' + ",");
      }
    }
    query = query.concat("OR(" + partialFilter);
    query = query.substring(0, query.length - 1).concat("),");
    return query;
  };

  // Returns whether or not there are and facets selected to display.
  var confirmActiveFacets = function() {
    totalActiveValues = 0;
    facets = $scope.facets;
    for (f in facets){
      facets[f].setActiveValues();
      totalActiveValues =  totalActiveValues + facets[f].activeValues.length;
    }
    if (totalActiveValues > 0) {
      return true;
    }
    else{
      return false;
    }
  }

  // The facet filter part of the RESTful request has two parts.
  // This constructs the first.
  // var makeFirstFacetFilter = function(facet, query){
  //   for (v in facet.activeValues){
  //     var name = facet.activeValues[v];
  //     if(name === "All"){
  //       return query;
  //     }
  //     else {
  //       newQ = facet.fieldName.concat(":").concat('"' + name + '"').concat("__,__");
  //       query = query.concat("&facetFilters=").concat(newQ);
  //     }
  //   }
  //   return query;
  // };
  //
  // // This constructs the second part of the facet filter part
  // // of the RESTful request.
  // var makeSecondFacetFilter = function(facet, query){
  //   for (v in facet.activeValues){
  //     var name = facet.activeValues[v];
  //     if(name === "All"){
  //       return query;
  //     }
  //     else {
  //       query = query.concat("&facet.filter=").concat(facet.fieldName).concat(":").concat('"'+ name + '"');//name.replace(" ", "+"));
  //     }
  //   }
  //   return query;
  // };

  // Sets the total count of results returned in the initial query. This can
  // Be used for the count to display next to the "All" values for facets.
  $scope.setTotalCount = function(){
    $scope.totalCount = $scope.demodata.totalHits;
  };

  // Instructs each facet in $scope.facets to update its values/counts based on
  // the current search results.
  $scope.updateFacets = function(){
    if(!$scope.facets){
      $scope.initFacets();
    }
    $scope.setTotalCount();
    for (facet in $scope.facets){
      $scope.facets[facet].updateValues($scope.demodata, $scope.totalCount);
    }
    return;
  };

  // "Initiates" the facets that we want to display in the sideBar
  // Note that a Facet is an Object
  $scope.initFacets = function(){
    var verticals = new Facet("Verticals", "verticals", [], []);
    var features = new Facet("Features", "features", [], []);
    var type = new Facet("Demo Type", "demoType", [], []);
    $scope.facets = [verticals, features, type];
  };

  // Instructs the relevant facet to update its list of active values
  // This function is necessary because the method can't be called directly from
  // "ng-change" in the html. It's calles when one of the checkboxes for
  // facets change.
  $scope.handleCheckboxChange = function(facet, val){
    facet.updateActiveValues(val);
    $scope.search();
  };

  // .config(['$httpProvider', function($httpProvider) {
  //     $httpProvider.defaults.headers.common['Authorization'] = 'Basic brandon:Batman';
  // }])
  //
  // .run(['$http', '$rootScope', function($http, $rootScope) {
  //     $http.defaults.headers.common['Authorization'] = $rootScope.authString;
  // }])
}])
///////////////////////////////////////
// FACTORIES //
///////////////////////////////////////
.factory("Facet", ['Value', function(Value) {
  // The Constructor
  // Takes a display name, a field name (should match that found in the
  // query result's JSON), a list of values, and a list of active values
  // and returns a Facet Object
  var Facet = function(displayname, fieldname, values, activeValues) {
    this.displayName = displayname;
    this.fieldName = fieldname;
    this.values = values;
    this.activeValues = activeValues;
  };

  // Updates the counts of each facet value found in the current search results
  Facet.prototype.updateValues = function(demodata, totalCount){
    this.handleAllValue(totalCount);
    this.resetValues();
    for (d in demodata.documents){
      var demo = demodata.documents[d];
      //If a demo doesn't have this facet, skip over it
      if(demo.fields.hasOwnProperty(this.fieldName)){
        //for each value of the facet for the demo...
        for (n in demo.fields[this.fieldName]){
          newVal = demo.fields[this.fieldName][n];
          found = this.updateValueHelper(newVal)
          //If the facet isn't already in this.values,
          // create a new Value for it with a count of 1 and add it to the list
          if(!found){
            var value = new Value(newVal, 1, true);
            this.values.push(value);
          }
        }
      }
    }
  };

  // Reset the count for each of this Facet's values to 0
  Facet.prototype.resetValues = function(){
    for (var v = 1; v < this.values.length; v++){
      var val = this.values[v];
      val.count = 0;
    }
  };

  // If the facet does not yet have an "All" value, add it.
  // Otherwise, set its count to the total number of results returned
  Facet.prototype.handleAllValue = function(totalCount){
    if (this.values.length === 0){
      this.makeNewAllValue(totalCount);
    }
    // else{
    //   this.values[0].count = totalCount;
    // }
  };

  // Searches for an existing value that matches newVal, and if found, updates
  // its count. Returns true if found, and false if not.
  Facet.prototype.updateValueHelper = function(newVal){
    found = false;
    for (v in this.values){
      val = this.values[v];
      if (val.valueName === newVal){
        val.count = val.count + 1;
        found = true;
      }
    }
    return found;
  }

  Facet.prototype.makeNewAllValue = function(totalCount){
    var all = new Value("All", totalCount, true);
    this.values.push(all);
  };

  Facet.prototype.setAllToActive = function(){
    for(v in this.values){
      val = this.values[v];
      val.active = true;
    }
  };

  Facet.prototype.deactivateAll = function(){
    for(v in this.values){
      val = this.values[v];
      val.active = false;
    }
  };

  Facet.prototype.setActiveValues = function(){
    this.activeValues = [];
    for (v in this.values){
      val = this.values[v];
      if(val.active){
        this.activeValues.push(val.valueName);
      }
    }
  };

  Facet.prototype.setSingleActiveValue = function(displayName){
    displayName = displayName.trim();
    var updateComplete = false;
    this.activeValues = [];
    for (v in this.values){
      val = this.values[v];
      // console.log("Test: " + val.valueName);
      // console.log("Target: " + displayName);
      // console.log("Match: " + (val.valueName === displayName));
      if(val.valueName === displayName){
        console.log("Match! " + "Value name: " + val.valueName + " displayName: " + displayName);
        val.active = true;
        console.log("The val has been set to active: " + val.active);
        this.activeValues.push(val.valueName);
        console.log("Length of active values: " + this.activeValues.length);
        updateComplete = this.updateActiveValues(val);
        console.log("Called updateActiveValues(the value)");
      }
    }
    return updateComplete
  };

  // Update this Facet's list of names of active values
  Facet.prototype.updateActiveValues = function(toggledVal){
    // Reset the list of active values
    this.activeValues = [];
    // The first value is the "All" value. If it's active, then set all values
    // for this Facet to active
    if(toggledVal.valueName === "All" && toggledVal.active){
      this.setAllActive();
    }
    // Otherwise, the "All" value is not active, so loop through and add
    // names of active values individually
    else{
      var allActive = true;
      for (v = 1; v < this.values.length; v++){
        val = this.values[v];
        if(val.active){
          this.activeValues.push(val.valueName);
        }
        else{
          allActive = false;
        }
      }
      if(!allActive && this.values[0].active){
        this.values[0].active = false;
        this.updateActiveValues(toggledVal);
      }
      if(allActive && toggledVal.valueName != "All"){
        this.values[0].active = true;
      }
    }
    return true;
  };

  Facet.prototype.setAllActive = function(){
    for (v in this.values){
      val = this.values[v];
      val.active = true;
      this.activeValues.push(val.valueName);
    }
  };

  return Facet;
}])

.factory('Value', function(){

  var Value = function(valueName, count, active){
    this.valueName = valueName;
    this.count = count;
    this.active = active;
  };

  Value.prototype.getName = function() {
    return this.valueName;
  };

  Value.prototype.getCount = function() {
    return this.count;
  };

  Value.prototype.getIsActive = function() {
    return this.active;
  };

  return Value;
})

///////////////////////////////////////
// DIRECTIVES //
///////////////////////////////////////

.directive('sideBar', function () {
  // function link($scope){
  //   $scope.evalAsync($scope.populateFacets($scope.facets));
  // }
  return {
    // link: link,
    restrict: 'E',
    templateUrl: 'partials/side-bar.html'
  }
})

.directive('searchBox', function () {
  return {
    restrict: 'E',
    templateUrl: 'partials/search-box.html'
  }
})

.directive('demoThumbnail', function () {
  return {
    restrict: 'E',
    templateUrl: 'partials/demo-thumbnail.html'
  }
})

.directive('demoSummary', function () {
  return {
    restrict: 'E',
    templateUrl: 'partials/demo-summary.html'
  }
});
