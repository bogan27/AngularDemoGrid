///////////////////////////////////////////////////////////////////////////////
//////////  This File Is Not Yet Used For Anything ////////////////////////////
//////////  The logic in this file stil resides in app.js /////////////////////
//////////  Refactoring in Progress... ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

angular
.module('sideBar', [])
//.controller('sidebarCtrl', ['Facet', 'Value', function(Facet, Value) {
.directive('sideBarDirective', function() {
  return {
    restrict: 'E',
    scope: {
      // model: '=ngModel',
      facets: '=',
      demodata: '@',
      search: '&'
    },
    replace: true,
    templateUrl: 'partials/side-bar.html',
    controller: [
      '$scope', 'Facet',
      function ($scope, Facet) {
        window.MY_SCOPE2 = $scope;
        $scope.$watch('demodata', function (newValue, oldValue) {
          updateFacets();
          console.log("$watch was called")
        }, true);

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

        // Instructs each facet in $scope.facets to update its values/counts based on
        // the current search results.
        function updateFacets() {
          initFacets();
          for (facet in $scope.facets){
            $scope.facets[facet].updateValues($scope.demodata, $scope.demodata.totalHits);
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
      }
    ]
  };
})
