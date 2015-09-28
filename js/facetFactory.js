angular
.module('demoApp')
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
    this.activeValues = [];
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
    this.deactivateAll();
    this.activeValues = [];
    for (v in this.values){
      val = this.values[v];
      if(val.valueName === displayName){
        val.active = true;
        this.activeValues.push(val.valueName);
        updateComplete = this.updateActiveValues(val);
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
