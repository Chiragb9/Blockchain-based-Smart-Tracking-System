
function initMap() {

	//Options
	var options = {
	center: { lat: -34.397, lng: 150.644 },
	zoom: 8,
  	};
	
	//Marker
	var marker = new google.maps.Marker({
		position:{lat: -34.397, lng: 150.644},
		map:map
	})

	
	//Info window
	var infoWindow = new google.maps.InfoWindow({
		content:'<h1>My Location</h1>'
	})

	
	//infoWindow event
	marker.addListener('click', function(){
		infoWindow.open(map, marker);
	})
	

	//Map Instance
  	var map = new google.maps.Map(document.getElementById("map"), options);
}