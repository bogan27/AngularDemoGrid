angular
.module('demoApp')
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
