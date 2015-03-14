/*
 *	set map variable for google map's map
 *  set list of all markers to use later
 */		
var map;
  	allMarkers = [];

/*
*	Main function to create google map
*/		
function initialize() {
  var waikiki = new google.maps.LatLng(21.284712,  -157.824762);
  var mapOptions = {
    zoom: 14,
    center: waikiki,
    disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 
}

/*
*	Main function to create and place markers on google map
*/		
function addGoogleMapsMarkers(m){        
	// Display multiple markers on a map
  var infoWindow = new google.maps.InfoWindow();
    
  function makeInfoWindow(mk){
		var infoWindowContent = '<div class="info_content">' + '<h4>' + mk.title + '</h4><p>' + mk.ph + '</p><p class="review"><img src="' + mk.pic + '">' + mk.blurb + '</p></div>';
  	infoWindow.setContent(String(infoWindowContent));
  	infoWindow.open(map, mk);
  }

	function deleteAllMarkers(){
  	for(var i = 0, max=allMarkers.length; i < max; i++ ) {
	  	allMarkers[i].setMap(null);
	  }
	  allMarkers = [];
  }
  
  if(allMarkers.length > 0){
	  deleteAllMarkers();
  }
  
	// Loop through our array of markers & place each one on the map 
  for(var i = 0, max=m.length; i < max; i++ ) {
    var position = new google.maps.LatLng(m[i][2], m[i][3]);
    var mkr = new google.maps.Marker({
	        position: position,
	        map: map,
					animation: google.maps.Animation.DROP,
	        title: m[i][0],
	        ph: m[i][1],
	        pic: m[i][4],
	        blurb: m[i][5]
		    });
    
    allMarkers.push(mkr);
     
	  google.maps.event
	  .addListener(mkr, 'mouseover', (function(mk, i) {
      return function() {
        makeInfoWindow(mk);
      }
	  })(mkr, i));
	        
	  google.maps.event
	  .addListener(mkr, 'click', (function(mk, i){
			return function(){
				map.panTo(mkr.getPosition());
	      makeInfoWindow(mk);
				toggleBounce(mk, i);
			}
		})(mkr, i));
  }
  
	function toggleBounce(mk, i) {
	  var yelpMarkerDetailUl =  $('.yelp-list').find('ul'),
	  		yelpMarkerDetail = yelpMarkerDetailUl.find('li'),
	  		yelpMarkerDetailPos = 212 * i,
	  		activeYelpMarkerDetail = yelpMarkerDetail.eq(i);
		// if marker is animating
	  if (mk.getAnimation() != null) {
		  mk.setAnimation(null);
	    yelpMarkerDetailUl.removeClass('show');
	    activeYelpMarkerDetail.removeClass('active');
	    $('.search-yelp').find('small').addClass('open');
	  // if marker is not animating
	  } else {
			for(am in allMarkers){
				var isMoving = allMarkers[am].getAnimation();
				if(isMoving && am !== i){
					allMarkers[am].setAnimation(null);
				}
			}
	    mk.setAnimation(google.maps.Animation.BOUNCE);
	    $('.search-yelp').find('small').removeClass('open');
	    yelpMarkerDetailUl.addClass('show').animate({
		    scrollTop: yelpMarkerDetailPos
		  }, 300);
		  yelpMarkerDetailUl.find('.active').removeClass('active');
	    activeYelpMarkerDetail.addClass('active');
	  }
	}

	$('.results').find('li').click(function(){
		var pos = $(this).index();
		for(am in allMarkers){
			var isMoving = allMarkers[am].getAnimation();
			if(isMoving && am !== pos){
				allMarkers[am].setAnimation(null);
			}
		}
		allMarkers[pos].setAnimation(google.maps.Animation.BOUNCE);
		makeInfoWindow(allMarkers[pos]);
		$('.results').find('.active').removeClass('active');
		$(this).addClass('active');
	});	
}

/*
 *	This is the main function that calls to yelp
 * 	and updates the knockout data binds
 *	as well as creating the  markers on google map.
 */
function yelpAjax(searchNear, searchFor) {
	/*
	 *	Details for Yelp OAuth2
	 *	This info would never make it to prod - it's only used right now as Proof-of-concept
	 */
	var auth = {
			    consumerKey : "igjXtMVKhuVNjjJEih0vCQ",
			    consumerSecret : "ziP5zS_dWXrPi0EDrvleDXqsbcg",
			    accessToken : "wJhBku-NNXgScAbds457yB4FuozLPWlK",
			    accessTokenSecret : "wL5q4CmB_qEcaUirQw1Uk4wIToo",
			    serviceProvider : {
			        signatureMethod : "HMAC-SHA1"
			    }
			};
	
	/*
	 *	Create a variable "accessor" to pass on to OAuth.SignatureMethod
	 */	
	var accessor = {
	    consumerSecret : auth.consumerSecret,
	    tokenSecret : auth.accessTokenSecret
	};
	
	/*
	 *	Create a array object "parameter" to pass on "message" JSON object
	 */	
	var parameters = [];
	parameters.push(['term', searchFor]);
	parameters.push(['location', searchNear]);
	parameters.push(['callback', 'cb']);
	parameters.push(['oauth_consumer_key', auth.consumerKey]);
	parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
	parameters.push(['oauth_token', auth.accessToken]);
	parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
	
	/*
	 *	Create a JSON object "message" to pass on to OAuth.setTimestampAndNonce
	 */	
	var message = {
	    'action' : 'http://api.yelp.com/v2/search',
	    'method' : 'GET',
	    'parameters' : parameters
	};
	
	/*
	 *	OAuth proof-of-concept using JS
	 */	
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);

	/*
	 *	OAuth proof-of-concept using JS
	 */		
	var parameterMap = OAuth.getParameterMap(message.parameters);
	yJax(message.action, parameterMap);
}

/*
 *	Ajax OAuth method to get yelp's data
 */		
function yJax(url, ydata){
	$.ajax({
		'url' : url,
		'data' : ydata,
		'dataType' : 'jsonp',
		'global' : true,
		'jsonpCallback' : 'cb',
		'success' : function(data){
			makeYelpList(data);
		}
	});
}

function makeYelpList(d){
	var $yelpList = $('.results');
			results = d.businesses,
			el = '';
			
	$yelpList.empty();

	var markers = [];
		
	if(results.length > 0){	
		for (result in results){
			var business = results[result],
					name = business.name,
					img = business.image_url,
					ph = /^\+1/.test(business.display_phone) ? business.display_phone : '',
					url = business.url,
					stars = business.rating_img_url_small,
					rate = business.rating,
					loc = {
						lat: business.location.coordinate.latitude,
						lon: business.location.coordinate.longitude,
						address: business.location.display_address[0] + '<br>' + business.location.display_address[business.location.display_address.length - 1]
					},
					review = {
						img: business.snippet_image_url,
						txt: business.snippet_text
					};
			var makeEl = '<li><div class="heading row"><p class="col-sm-3 img-container">';
			makeEl += '<img src="' + img + '" height=100 width=100 class="img-thumbnail">';
			makeEl += '<img src="' + stars + '" height=17 width=84 alt="Yelp Rating">';
			makeEl += '</p><div class="col-sm-9">';
			makeEl += '<h3>' + name + '</h3><p>';
			makeEl += '<span>' + loc.address + '</span></p>';
			makeEl += '<p><strong>' + ph + '</strong></p>';
			makeEl += '<p><a class="btn btn-default btn-small" href="' + url + '" target="_blank">Yelp it!</a></p>';
			makeEl += '</div></div></li>';
			
			el += makeEl;
				
	    var marker = [name, ph, loc.lat, loc.lon, review.img, review.txt];
	    markers.push(marker);
		}
		$yelpList.append(el);
		google.maps.event.addDomListener(window, 'load', addGoogleMapsMarkers(markers));
	} else {
		var searchedFor = $('input').val();
		$yelpList.addClass('open').append('<li><h3>Oh no! We can\'t seem to find anything on <span>' + searchedFor + '</span>.</h3><p>Trying searching something else.</p></li>');
		google.maps.event.addDomListener(window, 'load', addGoogleMapsMarkers(markers));
	}
}

/*
 * initialize the google maps function
 */
initialize();

/*
 * Call the main yelp function
 */
yelpAjax('96815', 'Hawaiian Shaved Ice');