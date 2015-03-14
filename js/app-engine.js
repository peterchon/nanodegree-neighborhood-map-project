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
	/*
	 * Set the variable for the starting point
	 */
  var waikiki = new google.maps.LatLng(21.284712,  -157.805762);
	/*
	* Set the variable for the google map option
	*/
  var mapOptions = {
    zoom: 14,
    center: waikiki,
    disableDefaultUI: true
  };
	/*
	* create a new map object
	*/  
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 
}

/*
*	Main function to create and place markers on google map
* takes marker variable as a parameter
*/		
function addGoogleMapsMarkers(m){        
	// Display multiple markers on a map
  var infoWindow = new google.maps.InfoWindow();

	/*
	* Function to create Info window for the google map marker
	* Takes the marker data as a parameter
	*/    
  function makeInfoWindow(mk){
		/*
		* Create the DOM element for the marker window
		* Uses marker data to create Business name, phone number, reviewer's picture, and reviewer's review
		*/    
		var infoWindowContent = '<div class="info_content">';
		infoWindowContent += '<h4>' + mk.title + '</h4>';
		infoWindowContent += '<p>' + mk.ph + '</p>';
		infoWindowContent += '<p class="review"><img src="' + mk.pic + '">' + mk.blurb + '</p>';
		infoWindowContent += '</div>';
		
		/*
		* Google Map V3 method to set the content of the marker window
		* Takes above infoWindowContent variable as a parameter
		*/    		
  	infoWindow.setContent(String(infoWindowContent));

		/*
		* Google Map V3 method to set the content of the marker window
		* Takes map and marker data variable as a parameter
		*/    		
  	infoWindow.open(map, mk);
  }

	/*
	* Function delete all markers on the map
	*/    
	function deleteAllMarkers(){
		/*
		* Loops over all the markers on the map and use the google map method .setMap(null) to remove it
		*/    
  	for(var i = 0, max=allMarkers.length; i < max; i++ ) {
	  	allMarkers[i].setMap(null);
	  }
		/*
		* clears the allMarkers variable
		*/    	  
	  allMarkers = [];
  }
  
	/*
	* if all Markers variable contains any markers object, call the deleteAllMarkers function to remove it.
	*/      
  if(allMarkers.length > 0){
	  deleteAllMarkers();
  }
  
	/*
	 * Loop through our array of markers & place each one on the map
	 */
  for(var i = 0, max=m.length; i < max; i++ ) {
	  // create the position object
    var position = new google.maps.LatLng(m[i][2], m[i][3]);
    // create the mkr object from the marker param
    var mkr = new google.maps.Marker({
	        position: position,
	        map: map,
					animation: google.maps.Animation.DROP,
	        title: m[i][0],
	        ph: m[i][1],
	        pic: m[i][4],
	        blurb: m[i][5]
		    });
    // update allMarkers array variable with mkr object
    allMarkers.push(mkr);
 
		/*
		* Apply google maps event method to bind a mouseover event to the marker
		* on event, create and show info window using the makeInfoWindow Method
		*/         
	  google.maps.event
	  .addListener(mkr, 'mouseover', (function(mk, i) {
      return function() {
        makeInfoWindow(mk);
      }
	  })(mkr, i));

		/*
		* Apply google maps event method to bind a mouse click event to the marker
		* on event, create and show info window using the makeInfoWindow Method
		* and animate the marker
		*/         	        
	  google.maps.event
	  .addListener(mkr, 'click', (function(mk, i){
			return function(){
	      makeInfoWindow(mk);
				toggleBounce(mk, i);
			}
		})(mkr, i));
  }

	/*
	* Function to animate the marker
	*/           
	function toggleBounce(mk, i) {
		/*
		* Create the variable
		*/         		
	  var yelpMarkerDetailUl =  $('.yelp-list').find('ul'),
	  		yelpMarkerDetail = yelpMarkerDetailUl.find('li'),
	  		yelpMarkerDetailPos = 212 * i,
	  		activeYelpMarkerDetail = yelpMarkerDetail.eq(i);

		/*
		* If the marker has animation attribute
		* then remove the animation attribute
		* also remove the show className from the yelp-list ul dom to slide left
		* also remove the active className from the active yelp-list ul li dom
		*/         
	  if (mk.getAnimation() != null) {
		  mk.setAnimation(null);
	    yelpMarkerDetailUl.removeClass('show');
	    activeYelpMarkerDetail.removeClass('active');
		/*
		* If marker does not have animation attribue
		* remove animation attribute from any other markers that are animated
		* then set the animation attribute to the clicked marker
		* also add the show className from the yelp-list ul dom to slide right
		* also add the active className to the yelp-list ul li dom
		*/         
	  } else {
			for(am in allMarkers){
				// iterate through all the markers and see if it has the animation attribute
				var isMoving = allMarkers[am].getAnimation();
				/*
				 * if marker is animating and index is not self
				 * then set the animated marker's animation attribute to null
				 */
				if(isMoving && am !== i){
					allMarkers[am].setAnimation(null);
				}
			}
			
			/*
			* add the Bounce animation to the clicked marker
			* using google map's animation method
			* also add the show className from the yelp-list ul dom to slide right and animate the child dom to the top
			* also add the active className to the yelp-list ul li dom
			*/         			
	    mk.setAnimation(google.maps.Animation.BOUNCE);
	    yelpMarkerDetailUl.addClass('show').animate({
		    scrollTop: yelpMarkerDetailPos
		  }, 300);
		  yelpMarkerDetailUl.find('.active').removeClass('active');
	    activeYelpMarkerDetail.addClass('active');
	  }
	}

	/*
	* add click event to the yelp-list ul li dom
	*/         			
	$('.results').find('li').click(function(){
		// get index of clicked element
		var pos = $(this).index();
		// iterate through allMarkers array
		for(am in allMarkers){
			var isMoving = allMarkers[am].getAnimation();
			// if marker is animated, remove animation
			if(isMoving && am !== pos){
				allMarkers[am].setAnimation(null);
			}
		}

		/*
		* add the Bounce animation to the marker that corresponding to the clicked element index
		* using google map's animation method, create and show the info window
		* also remove the active className from the active yelp-list ul li dom
		* then add the active className to the clicked element
		*/         					
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

/*
 *	Function to create the list from Yelp's API
 *	takes returned data from the ajax as a parameter
 */
function makeYelpList(d){
	/*
	 *	Create the variable 
	 */	
	var $yelpList = $('.results');
			results = d.businesses,
			el = '';
			
	/*
	 *	Clear the yelpList to add new entries
	 */	
	$yelpList.empty();

	/*
	 *	Create the markers Array object
	 */		
	var markers = [];

	/*
	 *	If no data is returned
	 */				
	if(results.length > 0){	
	/*
	 *	loop through the returned data
	 *	then create the variable for to use in populating the ylep-list li Dom
	 */						
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
					
			/*
			 *	create the Dom object
			 */									
			var makeEl = '<li><div class="heading row"><p class="col-sm-3 img-container">';
			makeEl += '<img src="' + img + '" height=100 width=100 class="img-thumbnail">';
			makeEl += '<img src="' + stars + '" height=17 width=84 alt="Yelp Rating">';
			makeEl += '</p><div class="col-sm-9">';
			makeEl += '<h3>' + name + '</h3><p>';
			makeEl += '<span>' + loc.address + '</span></p>';
			makeEl += '<p><strong>' + ph + '</strong></p>';
			makeEl += '<p><a class="btn btn-default btn-small" href="' + url + '" target="_blank">Yelp it!</a></p>';
			makeEl += '</div></div></li>';
			
			/*
			 *	add to the el variable
			 */										
			el += makeEl;

			/*
			 *	create the marker array object
			 *	then add marker to the markers array object
			 */													
	    var marker = [name, ph, loc.lat, loc.lon, review.img, review.txt];
	    markers.push(marker);
		}
		/*
		 *	add the el to the yelp-list ul dom
		 */												
		$yelpList.append(el);
		
		/*
		 *	Use google map api to create the markers to place on the map
		 */												
		google.maps.event.addDomListener(window, 'load', addGoogleMapsMarkers(markers));
		
	/*
	 *	If no data is returned,
	 *	then create a error message
	 */												
	} else {
		var searchedFor = $('input').val();
		$yelpList.addClass('open').append('<li><h3>Oh no! We can\'t seem to find anything on <span>' + searchedFor + '</span>.</h3><p>Trying searching something else.</p></li>');
		/*
		 *	Use google map api to clear the markers on the map
		 */														
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