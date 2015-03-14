function yelpBusinessViewModel() {
  var self = this;

	self.searchTerm = ko.observable('Hawaiian Shaved Ice');

	self.updateYelpResults = function(){
		ko.computed(function(){
			yelpAjax('96815', self.searchTerm());
		}, self);
	}	
}

ko.applyBindings(new yelpBusinessViewModel());