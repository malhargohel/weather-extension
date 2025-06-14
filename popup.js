document.addEventListener('DOMContentLoaded', function () {

    // --- API Configuration ---
    // IMPORTANT: Replace with your OpenWeatherMap API key
    const apiKey = '67cc12742121280228988d04fc6f199d';

    // --- DOM Elements ---
    const citySearchInput = document.getElementById('city-search');
    const searchButton = document.getElementById('search-button');
    const weatherDisplay = document.getElementById('weather-display');
    const forecastContainer = document.getElementById('forecast-container');

    // --- Event Listeners ---
    searchButton.addEventListener('click', handleSearch);
    citySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    /**
     * Handles the search action.
     */
    function handleSearch() {
        const city = citySearchInput.value.trim();
        if (city) {
            fetchWeatherByCity(city);
            citySearchInput.value = ''; // Clear input after search
        }
    }

    /**
     * Get user's location and fetch weather data.
     */
    function getCurrentLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    console.error('Geolocation Error:', error);
                    weatherDisplay.innerHTML = `<p>Location permission denied. <br> Search for a city to begin.</p>`;
                    weatherDisplay.classList.remove('loading');
                }
            );
        } else {
            weatherDisplay.innerHTML = `<p>Geolocation is not supported. Please search for a city.</p>`;
            weatherDisplay.classList.remove('loading');
        }
    }

    /**
     * Generic fetch function to avoid code duplication.
     * @param {string} weatherUrl - The URL for the current weather API call.
     * @param {string} forecastUrl - The URL for the forecast API call.
     */
    async function fetchWeatherData(weatherUrl, forecastUrl) {
        weatherDisplay.innerHTML = `<p>Loading weather...</p>`;
        weatherDisplay.classList.add('loading');
        forecastContainer.innerHTML = '';

        try {
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            if (!weatherResponse.ok) {
                const errorData = await weatherResponse.json();
                throw new Error(errorData.message || 'City not found');
            }
            if (!forecastResponse.ok) {
                 throw new Error('Forecast data not available');
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            displayCurrentWeather(weatherData);
            displayForecast(forecastData);

        } catch (error) {
            console.error('API Fetch Error:', error);
            weatherDisplay.innerHTML = `<p>Could not find weather data. <br> Please check the city name.</p>`;
            weatherDisplay.classList.remove('loading');
        }
    }

    /**
     * Fetches weather data by geographic coordinates.
     */
    function fetchWeatherByCoords(lat, lon) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        fetchWeatherData(weatherUrl, forecastUrl);
    }

    /**
     * Fetches weather data by city name.
     */
    function fetchWeatherByCity(city) {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        fetchWeatherData(weatherUrl, forecastUrl);
    }

    /**
     * Displays the current weather data in the new, styled format.
     */
    function displayCurrentWeather(data) {
        weatherDisplay.classList.remove('loading');
        const { name, main, weather, wind, sys } = data;
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
        forecastContainer.innerHTML = '';
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
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
