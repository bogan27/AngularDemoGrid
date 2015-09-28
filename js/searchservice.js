///////////////////////////////////////////////////////////////////////////
// This service executes the call to AIE's REST API to execute a search. //
// It takes a url to call, and returns the search results in JSON format //
///////////////////////////////////////////////////////////////////////////
angular
.module('demoApp')
.factory('searchservice', searchservice);

searchservice.$inject = ['$http'];

function searchservice($http) {
  return {
    executeSearch: executeSearch
  };

  function executeSearch(url) {
    return $http.get(url)
    .then(searchComplete)
    .catch(searchFailed);

    function searchComplete(response) {
      return response.data;
    }

    function searchFailed(error) {
      console.log('XHR Failed for searchservice.search().' + error.data);
    }
  };
}
