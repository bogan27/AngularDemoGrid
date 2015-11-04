angular.module('demoApp', ['angular-advanced-searchbox', 'sideBar'])

.controller('gridCtrl', ['$scope', '$http','Facet', 'searchservice', function($scope, $http, Facet, searchservice) {

  //This is for testing purposes - any $scope variable can be accessed
  // in the console by using MY_SCOPE.variable
  window.MY_SCOPE = $scope;

  // Note: This function is called from index.html when the page loads.
  // When the page loads, it executes a search. This results in a search for
  // "all" (*) so the users initially sees all demos available to them.
  $scope.initialize = function(){
    $scope.searchText = "*";
    initFacets();
    $scope.availableSearchParams = [
      { key: "vertical", name: "Vertical", placeholder: "Vertical..." },
      { key: "feature", name: "Feature", placeholder: "Feature..." },
      { key: "demoType", name: "Demo Type", placeholder: "Demo type..." }
    ];
    $scope.search();
  }

  // Note: This function is called from index.html
  // Calls the steps to prepare the information necessary for searching,
  // Then calls the function to execute the search with the constructed URL
  $scope.search = function(){
    updateSearchParams();
    var url = createUrl();
    console.log("Query: "+ url);
    getSearchResults(url);
  };

  // The following two functions utilize the searchservice to execute the search.
  // Their format follows the Angular Style Guide found here:
  // https://github.com/johnpapa/angular-styleguide
  function getSearchResults(url){
    return useSearchService(url).then(function(){
      console.log('Successfully returned search results.');
    });
  }
  // Once the results are returned, functions are called to update the facet
  // dispays in the sidebar
  function useSearchService(url) {
    return searchservice.executeSearch(url)
    .then(function(data) {
      $scope.demodata = data;
      updateFacets();
    });
  }

  // Updates the facet checkboxes on the left sidebar with any facet
  // specifications in the Advanced Search Box at the top of the page
  function updateSearchParams() {
    if(!angular.isUndefined($scope.searchParams)){
      if(!angular.isUndefined($scope.searchParams['query'])){
        if($scope.searchParams['query'].length < 1){
          $scope.searchText = "*";
        }
        else{
          $scope.searchText = $scope.searchParams['query'];
        }
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
    var head = "http://acevm0695.lab.attivio.com/DemoGrid/search?q=";
    var q = $scope.searchText.replace(/ /g, "+");
    var workflow = "&workflow=searchScripts";
    var facetPart = constructFacetFilters();
    console.log("facetPart is: " + facetPart);
    var fullQuery = head.concat('"' + q + '"').concat(workflow).concat(facetPart);
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
    if(partialFilter.length > 0){
      query = query.concat("OR(" + partialFilter);
      query = query.substring(0, query.length - 1).concat("),");
    }
    return query;
  };

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

  // Given a list of facet values, returns a string of
  // values seperated by " | "
  $scope.makeFacetText = function(values){
    var response = ""
    for(v in values){
      value = values[v];
      response = response.concat(" " + value + " |");
    }
    return response.substring(0, response.length - 1);
  }

  $scope.onKeyDown = function($event){
    if($event === 13){
      $scope.search();
    }
  }
}])

///////////////////////////////////////
// DIRECTIVES //
///////////////////////////////////////

.directive('sideBar', function () {
  return {
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
