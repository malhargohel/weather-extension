document.addEventListener('DOMContentLoaded', function () {

    // --- API Configuration ---
    // IMPORTANT: Replace with your OpenWeatherMap API key
    const apiKey = '67cc12742121280228988d04fc6f199d';

    // --- DOM Elements ---
    const weatherDisplay = document.getElementById('weather-display');
    const forecastContainer = document.getElementById('forecast-container');

    /**
     * Get user's location and fetch weather data.
     */
    function getCurrentLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                (error) => {
                    console.error('Geolocation Error:', error);
                    weatherDisplay.innerHTML = `<p>Location permission denied. <br> Please enable it to see the weather.</p>`;
                    // Fallback to a default city if location is denied
                    // fetchWeatherByCity('Sydney'); 
                }
            );
        } else {
            weatherDisplay.innerHTML = `<p>Geolocation is not supported by your browser.</p>`;
        }
    }

    /**
     * Fetches weather and forecast data from the API.
     * @param {number} lat - The latitude.
     * @param {number} lon - The longitude.
     */
    async function fetchWeather(lat, lon) {
        weatherDisplay.innerHTML = `<p>Loading weather...</p>`;
        weatherDisplay.classList.add('loading');

        try {
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            if (!weatherResponse.ok || !forecastResponse.ok) {
                throw new Error('Failed to fetch weather data.');
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            displayCurrentWeather(weatherData);
            displayForecast(forecastData);

        } catch (error) {
            console.error('API Fetch Error:', error);
            weatherDisplay.innerHTML = `<p>Could not fetch weather data. Please try again later.</p>`;
        }
    }

    /**
     * Displays the current weather data in the new, styled format.
     */
    function displayCurrentWeather(data) {
        weatherDisplay.classList.remove('loading');
        const { name, main, weather, wind, sys } = data;

        // **THIS IS THE FIX FOR THE IMAGE** - We build the full URL from the API response.
        const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

        weatherDisplay.innerHTML = `
            <h1>${name}, ${sys.country}</h1>
            <p class="date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <img src="${iconUrl}" alt="${weather[0].description}" class="weather-icon">
            <p class="temperature">${Math.round(main.temp)}°</p>
            <p class="description">${weather[0].description}</p>
            <div class="details-grid">
                <div class="detail-item">
                    <p>Feels Like</p>
                    <p class="value">${Math.round(main.feels_like)}°</p>
                </div>
                <div class="detail-item">
                    <p>Wind</p>
                    <p class="value">${wind.speed.toFixed(1)} m/s</p>
                </div>
                <div class="detail-item">
                    <p>Humidity</p>
                    <p class="value">${main.humidity}%</p>
                </div>
            </div>
        `;
    }

    /**
     * Displays the 5-day forecast in the new, styled format.
     */
    function displayForecast(data) {
        forecastContainer.innerHTML = ''; // Clear previous forecast
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            // **IMAGE FIX FOR FORECAST** - Again, we use the full URL from the API.
            const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

            const forecastItemHTML = `
                <div class="forecast-item">
                    <p class="day">${dayName}</p>
                    <img src="${iconUrl}" alt="${day.weather[0].description}" class="forecast-icon">
                    <p class="temp">${Math.round(day.main.temp)}°</p>
                </div>
            `;
            forecastContainer.innerHTML += forecastItemHTML;
        });
    }

    // --- Initial Call ---
    // Get weather for the user's current location when the popup opens.
    getCurrentLocationWeather();
});