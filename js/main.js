/*
Copyright (c) 2014, Kevin W. Jones. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or other
materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
OF SUCH DAMAGE.
*/
	var wsUri = "ws://agile01.sealabs.org:8080/ws/m2x";  // We're using Node-Red's websockets node type in this case. Change as needed.
	var connectionStatus; 
	var connected = false;
	var nametag = "Kevin was here!";
	var latitude = 0;
	var longitude = 0;
	var altitude = 0;
	var altitudeAccuracy = 0;
	var locale = "";
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var batteryLevel = 0;
	var platform = navigator.platform;
	var width = screen.width;
	var height = screen.height;
	var screenRatio = 0;
	var realWidth = 0;
	var realHeight = 0;
	var map = null;
	var CPUCount = 0;
	var tempF = 0;
	var lowTempF = 0;
	var highTempF = 0;
	var pressure = 0;
	var pressureState = 0;
	var windSpeed = 0;
	var windDirection = '';
	var weatherCode = 0;
 
function init() { 
	connectionStatus = document.getElementById("connectionStatus"); 
	$('#width').html(width);
	$('#height').html(height);
	if (width > 320) $('.spanner').html('&nbsp;&nbsp;&nbsp;');
	getScreenInfo();
	getBrowserInfo();
	$('#nametag').val(nametag);
	getLocation();
	initWebSocket(); 
}

function toggleLocation() {
	if( $('#coordinates').hasClass('in') ){
		$("#locationButton").html('Location<i style="margin-top:5px;" class="pull-right fa fa-arrow-circle-down fa-lg"></i></span>');
	}
	else {
		$("#locationButton").html('Location<i style="margin-top:5px;" class="pull-right fa fa-arrow-circle-up fa-lg"></i></span>');
	}
}
function toggleDevice() {
	if( $('#deviceinfo').hasClass('in') ){
		$("#deviceButton").html('Sensors<i style="margin-top:5px;" class="pull-right fa fa-arrow-circle-down fa-lg"></i>');
	}
	else {
		$("#deviceButton").html('Sensors<i style="margin-top:5px;" class="pull-right fa fa-arrow-circle-up fa-lg"></i>');
	}
}
function toggleHowItWorks() {
	if( $('#howitworks').hasClass('in') ){
		$("#howItWorksButton").html('How It Works!<i style="margin-top:5px;" class="pull-right fa fa-arrow-circle-down fa-lg"></i>');
	}
	else {
		$("#howItWorksButton").html('How It Works!<i style="margin-top:5px;" class="pull-right fa fa-arrow-circle-up fa-lg"></i>');
	}
}
function initWebSocket() { 
	websocket = new WebSocket(wsUri); 
	websocket.onopen = function(evt) { onOpen(evt) };
	websocket.onclose = function(evt) { onClose(evt) }; 
	websocket.onmessage = function(evt) { onMessage(evt) }; 
	websocket.onerror = function(evt) { onError(evt) }; 
}  
function onOpen(evt) { 
	writeToScreen('<span style="color: blue;">CONNECTED</span>'); 
	connected = true;
}  
function onClose(evt) { 
	writeToScreen('<span style="color: red;">DISCONNECTED</span>'); 
	connected = false;
	$('#reconnect').show();
}  
function onMessage(evt) { 
	writeToScreen('<span style="color: blue;">' + evt.data+'</span>'); 
	if (evt.data == "202 Accepted") {
		$('#responseBody').html('<p class="text-center"><span style="color:green">SUCCESS!</span></p>' +
					'<p class="text-left">You can now access the AT&amp;T M2X cloud, where you can view the data streams (feeds) from your phone.</p>'+
					'<p>Alternately, you send yourself the link via email, in order to view on a larger format tablet or laptop.</p>');
		openResponseModal();

	}
	else {
		$('#statusBody').html('<p class="text-center"><span style="color:red">ERROR! - Something went wrong...</span></p>' +
					'<p class="text-left">Why this happens:'+
					'<ul>'+
					'<li>M2X Cloud is unavailable</li>'+
					'</ul></p>'+
					'<p>Recommendation: Wait a few seconds, press the <b>reconnect</b> button and try again.  :-)</p>');
		openStatusModal();
		$('#reconnect').show();
	}

}  
function onError(evt) { 
	writeToScreen('<span style="color: red;">ERROR:&nbsp;'+evt.data+'</span>'); 
	$('#statusBody').html('<p><span style="color:red">ERROR! - Something went wrong...</span></p>' +
				'<p>Why this happens:'+
				'<ul>'+
				'<li>Client is disconnected from network</li>'+
				'<li>Client has a problem - code fubar</li>'+
				'<li>Middleware (App Engine) is unavailable</li>'+
				'<li>M2X Cloud is unavailable</li>'+
				'</ul></p>'+
				'<p>Recommendation: Wait a few seconds, press the <b>reconnect</b> button and try again.  :-)</p>');
	openStatusModal();
	$('#reconnect').show();
} 
function reconnect() {
	initWebSocket();
}

function doSend() { 
	if (! connected) {
		writeToScreen('<span style="color: red;">DISCONNECTED</span>');
		$('#statusBody').html('<p><span style="color:red">ERROR! - No connection...</span></p>' +
					'<p>Why this happens:'+
					'<ul>'+
					'<li>Client is disconnected from network</li>'+
					'<li>Client has a problem - code fubar</li>'+
					'<li>Middleware (App Engine) is unavailable</li>'+
					'<li>M2X Cloud is unavailable</li>'+
					'</ul></p>'+
					'<p>Recommendation: Wait a few seconds, press the <b>reconnect</b> button and try again.  :-)</p>');
		openStatusModal();
		$('#reconnect').show();
		return;
	}
	var message = '{"latitude":"'+latitude+
						'","longitude":"'+longitude+
						'","locale":"'+locale+
						'","postalcode":"'+$('#postal_code').val()+
						'","altitude":"'+$('#altitude').val()+
						'","altitudeaccuracy":"'+$('#altitudeaccuracy').val()+
						'","nametag":"'+$('#nametag').val()+
						'","platform":"'+platform+
						'","browserversion":"'+fullVersion+
						'","browsername":"'+browserName+
						'","battery":"'+batteryLevel+
						'","screenheight":"'+realHeight+
						'","screenwidth":"'+realWidth+
						'","cpucount":"'+CPUCount+
						'","tempf":"'+tempF+
						'","lowtempf":"'+lowTempF+
						'","hightempf":"'+highTempF+
						'","pressure":"'+pressure+
						'","pressurestate":"'+pressureState+
						'","windspeed":"'+windSpeed+
						'","winddirection":"'+windDirection+
						'","weathercode":"'+weatherCode+'"}';
						
	try {
		websocket.send(message); 
	}
	catch (e) {
		writeToScreen('<span style="color: red;">Error SENDING - restart client</span>');
		connected = false;
		return;
	}
	writeToScreen('<span style="color: green;">Message SENT</span>');  
	$('#payload').val(message);
}  
function writeToScreen(message) { 
	$('#connectionStatus').empty();
	$('#connectionStatus').append(message);
}
function writeToScreen2(message) { 
	var pre = document.createElement("p"); 
	pre.style.wordWrap = "break-word"; 
	pre.innerHTML = message; 
	connectionStatus.appendChild(pre); 
}
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(assignLocation);
    } else {
		latitude = 0;
		longitude = 0;
        altitude = 0;
		altitudeAccuracy = 0;
		document.getElementById("latitude").value = latitude;
		document.getElementById("longitude").value = longitude;
		document.getElementById("altitude").value = altitude;
		document.getElementById("altitudeaccuracy").value = altitudeAccuracy;
    }
}
function assignLocation(position) {
    latitude =  position.coords.latitude;
    longitude = position.coords.longitude; 
	altitude = position.coords.altitude;
	if (altitude == null) altitude = 0;
	altitudeAccuracy = position.coords.altitudeAccuracy;
	if (altitudeAccuracy == null) altitudeAccuracy = 0;
	else altitudeAccuracy = altitudeAccuracy.toFixed(5);
	document.getElementById("latitude").value = latitude;
	document.getElementById("longitude").value = longitude;
	document.getElementById("altitude").value = altitude;
	document.getElementById("altitudeaccuracy").value = altitudeAccuracy;
	getPostalCode();
}
function getPostalCode() {
	var latlng = new google.maps.LatLng(latitude,longitude);
	geocoder = new google.maps.Geocoder();
	
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
            	var city = "";
    			var SPR = "";
    			var postal_code = "";
                for (j = 0; j < results[0].address_components.length; j++) {
                	//console.log('results[0].address_components[j].types[0]:' + results[0].address_components[j].types[0]);
                	//console.log('results[0].address_components[j].short_name:' + results[0].address_components[j].short_name);
                	//console.log('results[0].address_components[j].long_name:' + results[0].address_components[j].long_name);
                    if (results[0].address_components[j].types[0] == 'postal_code') postal_code = results[0].address_components[j].short_name;
                    if (results[0].address_components[j].types[0] == 'locality') city = results[0].address_components[j].long_name;
                    if (results[0].address_components[j].types[0] == 'administrative_area_level_1') SPR = results[0].address_components[j].long_name;
                }
                if (city != '' || SPR != '') {
					$('#region').empty();
					$('#region').append(city + ', ' + SPR);
					locale = city + ', ' + SPR;
				}
				if (postal_code != '') {
					$('#postal_code').val(postal_code);
					getWeather(); // get weather conditions
				}
            }
        } else {
            alert("Geocoder failed due to: " + status);
        }
    });
}

function geoCode() {
	var geocoder = new google.maps.Geocoder();
	var address = $('#postal_code').val();

	if (geocoder) {
		geocoder.geocode({ 'address': address }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				//console.log(results[0].geometry.location);
				latitude = results[0].geometry.location.lat();
				$('#latitude').val(results[0].geometry.location.lat());
				longitude = results[0].geometry.location.lng();
				$('#longitude').val(results[0].geometry.location.lng());
				var result = results[0];
				var city = "";
				var SPR = "";
				var postal_code = "";
				for (var i=0, len=result.address_components.length; i< len; i++) {
					var ac=result.address_components[i];
					if (ac.types.indexOf("locality") >= 0) city = ac.long_name;
					if (ac.types.indexOf("administrative_area_level_1") >= 0) SPR = ac.long_name;
					//if (ac.types.indexOf("postal_code") >= 0) postal_code = ac.short_name;
				}
				if (city != '' && SPR != '') {
					$('#region').empty();
					$('#region').append(city + ', ' + SPR);
					locale = city + ', ' + SPR;
				}
				getWeather();
				// now let's get the elevation using the elevation api
				var latlng = new google.maps.LatLng (parseFloat(latitude),parseFloat(longitude));
				var obj=new Object();
				obj.latLng=latlng;
				getElevation(obj);
				
			}
			else {
				console.log("Geocoding failed: " + status);
			}
		});
	}
  }


function getElevation(event) {
	console.log('Top of getElevation function');
	var locations = [];
	elevator = new google.maps.ElevationService();
	// Retrieve the clicked location and push it on the array
	var clickedLocation = event.latLng;
	locations.push(clickedLocation);

	// Create a LocationElevationRequest object using the array's one value
	var positionalRequest = {'locations': locations};

	// Initiate the location request
	elevator.getElevationForLocations(positionalRequest, function(results, status) {
		if (status == google.maps.ElevationStatus.OK) {
			// Retrieve the first result
			if (results[0]) {
				// add the elevation (altitude)
				altitude = results[0].elevation.toFixed(5);
				$('#altitude').val(altitude);
			} 
			else {
				altitude = 0;
				$('#altitude').val(altitude);
			}
		} 
		else {
			altitude = 0;
			$('#altitude').val(altitude);
			console.log("Elevation service call failed: " + status);
		}
	});
} 
  
function getScreenInfo() {
	if(width>height){
		realWidth=width;
		realHeight=height;
		screenRatio=(height/width);
	}
	else{
		realWidth=height;
		realHeight=width;
		screenRatio=(width/height);
	}
	if(isNaN(screenRatio)){
		if(window.innerHeight>window.innerWidth){
			realWidth=window.innerHeight;
			realHeight= window.innerWidth ;
			screenRatio = (window.innerWidth/window.innerHeight);
		}
		else{
			realWidth=window.innerWidth;
			realHeight= window.innerHeight;
			screenRatio = (window.innerHeight/window.innerWidth);
		}
	}
}

function getBrowserInfo() {
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var nameOffset,verOffset,ix;
	
	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 browserName = "Microsoft Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 browserName = "Chrome";
	 fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 browserName = "Safari";
	 fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 browserName = "Firefox";
	 fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
	          (verOffset=nAgt.lastIndexOf('/')) ) 
	{
	 browserName = nAgt.substring(nameOffset,verOffset);
	 fullVersion = nAgt.substring(verOffset+1);
	 if (browserName.toLowerCase()==browserName.toUpperCase()) {
	  browserName = navigator.appName;
	 }
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	
	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
	 fullVersion  = ''+parseFloat(navigator.appVersion); 
	 majorVersion = parseInt(navigator.appVersion,10);
	}

	try {
		var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
		batteryLevel = battery.level;
		//alert('batteryLevel:'+batteryLevel);
	}
	catch (e) {}
	try {
		CPUCount = navigator.hardwareConcurrency;
		if (typeof CPUCount == 'undefined') {
			CPUCount = 0;
		}
		else {
			if (CPUCount == null) CPUCount = 0;
		}
		$('#CPUCount').empty();
		$('#CPUCount').append(CPUCount);
		//alert('CPUCount:'+ CPUCount);
	}
	catch (e) {}
	$('#battery').empty();
	$('#battery').append(batteryLevel);
	$('#platform').empty();
	$('#platform').append(platform);
	$('#browserName').empty();
	$('#browserName').append(browserName);
	$('#fullVersion').empty();
	$('#fullVersion').append(fullVersion);
}
function geoCode2() {
	$.ajax({
		url: 'http://maps.googleapis.com/maps/api/geocode/json',
		data: {
			sensor: false,
			address: $('#postal_code').val()
		},
		success: function (results) {
			$('#latitude').val(results[0].geometry.location.lat());
			$('#longitude').val(results[0].geometry.location.lng());
		}
	});
}
function closeStatusModal() {
	$('#statusModal').modal('hide');
}
function openStatusModal() {
	$('#statusModal').modal('show');
}
function closeResponseModal() {
	$('#responseModal').modal('hide');
}
function openResponseModal() {
	$('#responseModal').modal('show');
}
function closeM2XModal() {
	$('#M2XModal').modal('hide');
}
function openM2XModal() {
	$('#M2XModal').modal('show');
}
function goToM2X() {
	$('#M2XModal').modal('hide');
	window.open('https://m2x.att.com/feed/46e330aa2218faf9cdc1e5186f94918f', '_blank');
}
function closeHelpModal() {
	$('#helpModal').modal('hide');
}
function openHelpModal() {
	$('#helpModal').modal('show');
}
function closeInfoModal() {
	$('#infoModal').modal('hide');
}
function openInfoModal() {
	$('#infoModal').modal('show');
}
function closeMapModal() {
	$('#mapModal').modal('hide');
}
function openMapModal() {
	$('#mapModal').modal('show');
	map = null;
	$('#map_canvas').empty();
	
	map = new GMaps({
        div: '#map_canvas',
        lat: $('#latitude').val(),
        lng: $('#longitude').val()
      });
    map.removeMarkers();
    map.removePolylines();
    var latlng = '[{"lat":'+ $('#latitude').val()+',"lng":'+ $('#longitude').val()+'}]';
    latlng = JSON.parse(latlng);
   	//console.log("Got marker at " + latlng[0].lat + ", " + latlng[0].lng, latlng);
    map.setZoom(10);
   	map.setCenter(latlng[0].lat, latlng[0].lng);
    map.addMarkers(latlng);	

}
function closeSplashModal() {
	$('#splashModal').modal('hide');
}
function openSplashModal() {
	$('#splashModal').modal('show');
}
function closeSendModal() {
	$('#sendModal').modal('hide');
}
function openSendModal() {
	if (! connected) {
		writeToScreen('<span style="color: red;">DISCONNECTED</span>');
		$('#statusBody').html('<p class="text-center"><span style="color:red">ERROR! - No connection...</span></p>' +
					'<p>Why this happens:'+
					'<ul>'+
					'<li>Client is disconnected from network</li>'+
					'<li>Client has a problem - code fubar</li>'+
					'<li>Middleware (App Engine) is unavailable</li>'+
					'<li>M2X Cloud is unavailable</li>'+
					'</ul></p>'+
					'<p>Recommendation: Wait a few seconds, refresh the web app and try again.  :-)</p>');
		openStatusModal();
		return;
	}
	$('#sendModal').modal('show');
}
function sendPayload() {
	doSend();
	$('#sendModal').modal('hide');
}
function getWeather() {
	var zipcode = $('#postal_code').val();
	$.simpleWeather({
		//location: 'Minneapolis, MN',
		location: zipcode,
		woeid: '',
		unit: 'f',
		success: function(weather) {
			//console.log('weather successfully retrieved');
			tempF = weather.temp;
			$('#tempF').empty();
			$('#tempF').append(tempF);

			lowTempF = weather.forecast[0].low;
			$('#lowTempF').empty();
			$('#lowTempF').append(lowTempF);

			highTempF = weather.forecast[0].high;
			$('#highTempF').empty();
			$('#highTempF').append(highTempF);
			
			pressure = weather.pressure;
			$('#pressure').empty();
			$('#pressure').append(pressure);
			
			pressureState = weather.rising;
			$('#pressureState').empty();
			$('#pressureState').append(pressureState);
			
			windSpeed = weather.wind.speed;
			$('#windSpeed').empty();
			$('#windSpeed').append(windSpeed);
			
			windDirection = weather.wind.direction;	
			$('#windDirection').empty();
			$('#windDirection').append(windDirection);
			
			weatherCode = weather.code;
			$('#weatherCode').empty();
			$('#weatherCode').append(weatherCode);
		},
		error: function(error) {
			console.log('weather error:' + error);
			$("#connectionStatus").html(error);
		}
	});	
}

window.addEventListener("load", init, false);  
openSplashModal();
$(document).ready(function() {
	$('#nametagHelp').popover(
	{
		trigger: 'hover, click',
		html: true,
		placement: 'bottom',
		content: 'Enter your name or other tag (keep it clean!) to identify your M2X data items'
	});
	$('#nametagHelp').popover(
	{
		trigger: 'hover, click',
		html: true,
		placement: 'bottom',
		content: 'Enter your name or other tag (keep it clean!) to identify your M2X data items'
	});
});
