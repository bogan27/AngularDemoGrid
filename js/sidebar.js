///////////////////////////////////////////////////////////////////////////////
//////////  This File Is Not Yet Used For Anything ////////////////////////////
//////////  The logic in this file stil resides in app.js /////////////////////
//////////  Refactoring in Progress... ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

angular
.module('sideBar', )
.controller('sidebarCtrl', ['Facet', 'Value', function(Facet, Value) {
  // Updates the facet checkboxes on the left sidebar with any facet
  // specifications in the Advanced Search Box at the top of the page
  function updateSearchParams() {
    if(!angular.isUndefined($scope.searchParams)){
      if(!angular.isUndefined($scope.searchParams['query'])){
        $scope.searchText = $scope.searchParams['query'];
      }
      if(!angular.isUndefined($scope.searchParams['vertical'])){
        $scope.facets[0].setSingleActiveValue($scope.searchParams['vertical']);
      }
      if(!angular.isUndefined($scope.searchParams['feature'])){
        $scope.facets[1].setSingleActiveValue($scope.searchParams['feature']);
      }
      if(!angular.isUndefined($scope.searchParams['demoType'])){
        $scope.facets[2].setSingleActiveValue($scope.searchParams['demoType']);
      }
    }
  };

  // Creates the URL for the RESTful request from the Attivio Instance
  function createUrl() {
    var head = "http://acevm0625.lab.attivio.com/DemoGrid/search?q=";
    var q = $scope.searchText.replace(/ /g, "+");
    var tail = "&workflow=searchScripts";
    var facetPart = constructFacetFilters();
    console.log("facetPart is: " + facetPart);
    var fullQuery = head.concat('"' + q + '"').concat(tail).concat(facetPart);
    return fullQuery;
  };

  // Handles the construction of the facet filter parameters to be
  // appended to the query url
  function constructFacetFilters() {
    var query="";
    for(f in $scope.facets){
      if($scope.facets[f].activeValues.length > 0){
        query = makeFacetFilter($scope.facets[f], query);
      }
    }
    if(query.length > 1){
      var preface = "&filter=AND(";
      query = preface.concat(query);
      query = query.substring(0, query.length -1 ).concat(")")
    }
    return query;
  };

  // Returns the given query, with the appropriate facet filter parameter
  // appended to it.
  function makeFacetFilter(facet, query) {
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

  // Returns whether or not there are active facets, meaning
  // facets selected to display.
  function confirmActiveFacets() {
    totalActiveValues = 0;
    for (f in $scope.facets){
      facets[f].setActiveValues();
      totalActiveValues =  totalActiveValues + facets[f].activeValues.length;
    }
    return (totalActiveValues > 0);
  }

  // Instructs each facet in $scope.facets to update its values/counts based on
  // the current search results.
  function updateFacets() {
    initFacets();
    for (facet in $scope.facets){
      $scope.facets[facet].updateValues($scope.demodata, $scope.demodata.totalHits);
    }
    return;
  };

  // "Initiates" the facets that we want to display in the sideBar
  // Note that a Facet is an Object
  function initFacets() {
    if(!$scope.facets){
      var verticals = new Facet("Verticals", "verticals", [], []);
      var features = new Facet("Features", "features", [], []);
      var type = new Facet("Demo Type", "demoType", [], []);
      $scope.facets = [verticals, features, type];
    }
  };

  // Instructs the relevant facet to update its list of active values
  // This function is necessary because the method can't be called directly from
  // "ng-change" in the html. It's called when one of the checkboxes for
  // facets change.
  $scope.handleCheckboxChange = function(facet, val){
    facet.updateActiveValues(val);
    $scope.search();
  };
}])

.factory('sidebarService', ['Facet', 'Value', function(Facet, Value) {
  //Will need a factory to return facet data, and a serivce to process search results
}])

.directive('sideBar', function () {
  return {
    restrict: 'E',
    templateUrl: 'partials/side-bar.html'
  }
})
