$(function(){

	var DEG = 'C';

	var location = $('h1'),
		weatherData = $('ul'),
		wrapper = $('#wrapper');

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
	}
	else{
		showError("Your browser does not support Geolocation!");
	}

	function locationSuccess(position) {

		try{

			var cache = localStorage.weatherCache && JSON.parse(localStorage.weatherCache);

			var d = new Date();

			if(cache && cache.timestamp && cache.timestamp > d.getTime() - 30*60*1000){

				var offset = d.getTimezoneOffset()*60*1000;
				var city = cache.data.city.name;
				var country = cache.data.city.country;

				$.each(cache.data.list, function(){

					var localTime = new Date(this.dt*1000 - offset);

					addWeather(
						moment(localTime).format('D MMM, dddd'),
						convertTemperature(this.temp.min) + '/' + convertTemperature(this.temp.max) + '°' + DEG,
						this.weather[0].icon,
						this.weather[0].main,
						convertTemperature(this.temp.night) + '°' + DEG,
						convertTemperature(this.temp.morn) + '°' + DEG,
						convertTemperature(this.temp.day) + '°' + DEG,
						convertTemperature(this.temp.eve) + '°' + DEG,
						this.weather[0].description,
						this.humidity + ' %',
						this.pressure + ' hPa',
						this.speed + ' m/s'
					);

				});

				location.html(city+', <b>'+country+'</b>');
				
				jQuery.fn.slidedown = function(){
					$(this).click(function(){
						$(this).children('.main').toggleClass('current');
						$(this).children('.slide').slideToggle(1000);
					});
				}
				$('li').slidedown();
				
				wrapper.addClass('loaded');
			}

			else{

				var weatherAPI = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+position.coords.latitude+
									'&lon='+position.coords.longitude+'&APPID=6088acf45a080582617afd36b135e0e1&cnt=10&callback=?'

				$.getJSON(weatherAPI, function(response){

					localStorage.weatherCache = JSON.stringify({
						timestamp:(new Date()).getTime(),
						data: response
					});

					locationSuccess(position);
				});
			}

		}
		catch(e){
			showError("We can't find information about your city!");
			window.console && console.error(e);
		}
	}
	
	function createNewLocation(positionObj) {
		localStorage.clear();
		removeWeather();
		locationSuccess(positionObj);
	}
	function removeWeather() {
		var weatherrem = $('li');
		$(weatherrem).remove();
	}
    var positionObj = {};

    $("#geolocation").geocomplete()
		.bind("geocode:result", function (event, result) {

			positionObj = {

				coords: {
					latitude : result.geometry.location.lat(),
					longitude : result.geometry.location.lng()
				}

			};

		})
      .bind("geocode:error", function (event, status) {
          console.log("ERROR: " + status);
      })
      .bind("geocode:multiple", function (event, results) {
          console.log("Multiple: " + results.length + " results found");
      });

    $('.search-btn').on('click', function () {
        createNewLocation(positionObj);
    });


	function addWeather(date, temp, icon, condition, tempNight, tempMorn, tempDay, tempEve, description, humidity, pressure, speed){

		var markup = 	'<li>' +	
							'<div class="main">' +	
								'<div>' + date + '</div>' +
								'<div>'+ temp +'</div>' +
								'<div>' + '<img src="image/'+ icon +'.png" />' + '</div>' +
								'<div>' + condition + '</div>' +
								'<div class="arrowMain">&#9660;</div>' +
							'</div>' +
							'<div class="slide">' +
								'<div> Night' + '<br>' + '<span>' + tempNight + '</span>' + '</div>' +
								'<div> Morning'+ '<br>' + '<span>' + tempMorn + '</span>' +'</div>' +
								'<div> Day' + '<br>' + '<span>' + tempDay + '</span>' + '</div>' +
								'<div> Evening' + '<br>' + '<span>' + tempEve + '</span>' + '</div>' +
								'<div>' + description + '</div>' +
								'<div>'+ humidity +'</div>' +
								'<div>' + pressure + '</div>' +
								'<div>' + speed + '</div>' +	
								'<div class="arrow">&#9650;</div>' +	
							'</div>' +
						'</li>'	;

		weatherData.append(markup);
	}

	function locationError(error){
		switch(error.code) {
			case error.TIMEOUT:
				showError("A timeout occured! Please try again!");
				break;
			case error.POSITION_UNAVAILABLE:
				showError('We can\'t detect your location. Sorry!');
				break;
			case error.PERMISSION_DENIED:
				showError('Please allow geolocation access for this to work.');
				break;
			case error.UNKNOWN_ERROR:
				showError('An unknown error occured!');
				break;
		}

	}

	function convertTemperature(kelvin){
		return Math.round(DEG == 'C' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
	}

	function showError(msg){
		wrapper.addClass('error').html(msg);
	}
});
