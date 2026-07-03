const API_KEY = "fb95ac0326bf42338ef92451262506";
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json";

// HTML Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const city = document.getElementById("city");
const date = document.getElementById("date");
const temp = document.getElementById("temp");
const condition = document.getElementById("condition");
const icon = document.getElementById("icon");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility");
const pressure = document.getElementById("pressure");

const forecastCards = document.getElementById("forecastCards");

let chart;

// Search Button
searchBtn.addEventListener("click", () => {
    const cityName = cityInput.value.trim();

    if (cityName !== "") {
        getWeather(cityName);
    }
});

// Enter Key
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

// Current Location
locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            getWeather(`${lat},${lon}`);

        },
        () => {
            alert("Unable to get your location.");
        }
    );

});

// Fetch Weather
async function getWeather(query) {

    try {

        const response = await fetch(
            `${BASE_URL}?key=${API_KEY}&q=${query}&days=7&aqi=yes&alerts=yes`
        );

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        updateCurrentWeather(data);

        updateForecast(data.forecast.forecastday);

        createChart(data.forecast.forecastday[0].hour);

    } catch (error) {

        alert(error.message);

    }

}

// Current Weather
function updateCurrentWeather(data) {

    city.textContent =
        `${data.location.name}, ${data.location.country}`;

    date.textContent =
        data.location.localtime;

    temp.textContent =
        `${Math.round(data.current.temp_c)}°C`;

    condition.textContent =
        data.current.condition.text;

    icon.src =
        "https:" + data.current.condition.icon;

    humidity.textContent =
        data.current.humidity + "%";

    wind.textContent =
        data.current.wind_kph + " km/h";

    visibility.textContent =
        data.current.vis_km + " km";

    pressure.textContent =
        data.current.pressure_mb + " mb";

}


// 7-Day Forecast
function updateForecast(days) {

    forecastCards.innerHTML = "";

    days.forEach(day => {

        const card = document.createElement("div");

        card.className = "forecast-item";

        card.innerHTML = `
            <h3>${new Date(day.date).toLocaleDateString("en-US",{weekday:"short"})}</h3>

            <img src="https:${day.day.condition.icon}">

            <p>${day.day.avgtemp_c}°C</p>

            <small>${day.day.condition.text}</small>
        `;

        forecastCards.appendChild(card);

    });

}

// Temperature Chart
function createChart(hours){

    const labels = hours.map(h=>h.time.split(" ")[1]);

    const temps = hours.map(h=>h.temp_c);

    if(chart){
        chart.destroy();
    }

    chart = new Chart(
        document.getElementById("tempChart"),
        {
            type:"line",
            data:{
                labels,
                datasets:[{
                    label:"Temperature °C",
                    data:temps,
                    tension:.4,
                    fill:false
                }]
            },
            options:{
                responsive:true,
                plugins:{
                    legend:{
                        labels:{
                            color:"white"
                        }
                    }
                },
                scales:{
                    x:{
                        ticks:{color:"white"}
                    },
                    y:{
                        ticks:{color:"white"}
                    }
                }
            }
        }
    );

}

