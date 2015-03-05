var map;
function initialize() {
  var markers = [];
  var mapOptions = {
    zoom: 15,
    center: new google.maps.LatLng(21.281712,  -157.824762),
    disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      
  getYelp(terms, near);    
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
      '&signed_in=true&callback=initialize';
  document.body.appendChild(script);
}

window.onload = loadScript;