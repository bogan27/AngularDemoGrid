///////////////////////////////////////////////////////////////////////////
// This service executes the call to AIE's REST API to execute a search. //
// It takes a url to call, and returns the search results in JSON format //
///////////////////////////////////////////////////////////////////////////
angular
.module('angular-advanced-searchbox')
.factory('autocompleteService', autocompleteService);

autocompleteService.$inject = ['$http'];

function autocompleteService($http) {
  return {
    updateAutoComplete: updateAutoComplete
  };

  function updateAutoComplete(searchParam){
    var q = searchParam.value;
    if(searchParam.key === 'vertical'){
      var baseUrl =
      "http://acevm0625.lab.attivio.com/DemoGrid/autocomplete/verticals?q=";
    }
    if(searchParam.key === 'feature'){
      var baseUrl =
      "http://acevm0625.lab.attivio.com/DemoGrid/autocomplete/features?q=";
    }
    if(searchParam.key === 'demoType'){
      var baseUrl =
      "http://acevm0625.lab.attivio.com/DemoGrid/autocomplete/demotype?q=";
    }
    var fullUrl = baseUrl.concat(q);
    $http.get(fullUrl)
    .success(function(response){
      data = searchComplete(response);
      console.log("Data length in executeSearch: " + data.length);
      return data;
    })
    .catch(searchFailed);

    function searchComplete(response) {
      acSource = [];
      console.log("Response length: " + response);
      for(d in response){
        var entry = response[d].label;
        console.log("entry: " + entry);
        acSource.push(entry);
        console.log("acSource: " + acSource);
      }
      console.log("AC Source length: " + acSource.length);
      return acSource;
    }

    function searchFailed(error) {
      console.log('Http Request Failed for searchservice.search(): ' + error.data);
    }
    // data = executeSearch(fullUrl);
    // console.log("final response length: " + data.length);
    // return data;
  }
};
}
