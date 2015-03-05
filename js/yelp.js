var auth = {
    consumerKey : "igjXtMVKhuVNjjJEih0vCQ",
    consumerSecret : "ziP5zS_dWXrPi0EDrvleDXqsbcg",
    accessToken : "8AsVPbJVgtjpyQZZSHJrYAU9tJdisl4n",
    accessTokenSecret : "maKNX6tEhYeMTHga6zzP6gKbGtM",
    serviceProvider : {
        signatureMethod : "HMAC-SHA1"
    }
};

var terms = 'hotel';
var near = 'waikiki';

var accessor = {
    consumerSecret : auth.consumerSecret,
    tokenSecret : auth.accessTokenSecret
};

var getYelp = function(what){
	parameters = [];
	parameters.push(['term', what]);
	parameters.push(['location', near]);
	parameters.push(['callback', 'cb']);
	parameters.push(['oauth_consumer_key', auth.consumerKey]);
	parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
	parameters.push(['oauth_token', auth.accessToken]);
	parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
	
	var message = {
	    'action' : 'http://api.yelp.com/v2/search',
	    'method' : 'GET',
	    'parameters' : parameters
	};
	
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);
	
	var parameterMap = OAuth.getParameterMap(message.parameters);

	$.ajax({
	    'url' : message.action,
	    'data' : parameterMap,
	    'dataType' : 'jsonp',
	    'jsonpCallback' : 'cb',
	    'success' : function(data, textStats, XMLHttpRequest) {
	        //console.log(data);
	      	for( var i=0, max=data['businesses'].length; i<max; i++ ) {
	        	var item = data['businesses'][i];
	        	for( key in item ){
	          	var elem = '',
	          			yelpItem = document.createElement('div'),
	          			address = '',
	          			image = typeof item.image_url !== 'undefined' ? '<img src="' + item.image_url + '">' : '',
	          			phone = item.phone ? '<strong>' + item.display_phone.replace(/\+1-/g, '') + '</strong>' : '';
							
							yelpItem.className = "yelp-item";
							
							for( e in item.location.display_address ) {
								if( e == 0 || e == item.location.display_address.length - 1) {
									address += '<span>' + item.location.display_address[e] + '</span>';													
								}
							}		                  			
							elem += '<h3><a href="' + item.url + '">' + item.name + '</a><img src="' + item.rating_img_url + '"></h3>';
							elem += '<p class="address">' + image + address + '&mdash;' + phone + '</p>';
							elem += '<p class="snippet"><img src="' + item.snippet_image_url + '">&ldquo;' + item.snippet_text + '&rdquo;</p>';
							elem += '<p class="lat-long">Lat:' + item.location.coordinate.latitude + ' / Long:' + item.location.coordinate.longitude + '</p>';
							var marker = new google.maps.Marker({
							    position: new google.maps.LatLng(item.location.coordinate.latitude, item.location.coordinate.longitude),
							    map: map,
							    title: item.name,
							    animation: google.maps.Animation.DROP,
							});
							marker.setMap(null);
							marker.setMap(map);
							google.maps.event.addListener(marker, 'click', function(){
								toggleBounce
							});
	        	}
	        	
	        	function toggleBounce() {
						  if (marker.getAnimation() != null) {
						    marker.setAnimation(null);
						  } else {
						    marker.setAnimation(google.maps.Animation.BOUNCE);
						  }
						}
						
	        	$(yelpItem).append(elem);
						$('#yelp').append(yelpItem);
	      	}
	    }
	});
}

$('form').submit(function(e){
	e.preventDefault();
	var $self = $(this).find('input'),
			newTerm = $self.val();
	$('#yelp').find('.yelp-item').remove();
	getYelp(newTerm);
});