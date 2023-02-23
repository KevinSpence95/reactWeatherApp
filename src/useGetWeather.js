import { useEffect, useState } from "react";
import { APIKEY } from "./apikey";



export default function useGetWeather(city, stateNameOrCountryCode = "") {
  const [weatherData, setWeatherData] = useState('');
  

  useEffect(() => {

    async function getWeather() {
        try {
          let response = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${city},${stateNameOrCountryCode}&limit=1&appid=${APIKEY}`
          );
          if (!response.ok) {
            throw new Error(
              `Failed to fetch coordinates of ${city}, ${stateNameOrCountryCode}`
            );
          }
          let coordsData = await response.json();
          let coords = {
            lat: coordsData[0].lat,
            lon: coordsData[0].lon,
          };
          let response2 = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${APIKEY}`
          );
          if (!response2.ok) {
            throw new Error(
              `Failed to fetch weather of ${city}, ${stateNameOrCountryCode}`
            );
          }
          let weatherData = await response2.json();

          let tempF = CtoF(weatherData.main.temp - 273.15);
          let feelsLikeF = CtoF(weatherData.main.feels_like - 273.15);
          let windSpeedMPH = weatherData.wind.speed * 2.23694; //to get speed from m/s to mph
          let weather = {
            city,
            stateNameOrCountryCode,
            weather: weatherData.weather[0].main,
            weatherDescription: weatherData.weather[0].description,
            percentCloudy: weatherData.clouds.all,
            humidity: weatherData.main.humidity,
            tempF,
            feelsLikeF,
            windSpeedMPH,
            tempC: Math.round(weatherData.main.temp - 273.15),
            feelsLikeC: Math.round(weatherData.main.feels_like - 273.15),
            windSpeedMPS: weatherData.wind.speed,
          };

          console.log(weather);
          setWeatherData(weather)

        } catch (e) {
          console.log(e);
          alert(e)
        }
    }
    getWeather()

  }, [city, stateNameOrCountryCode]);

  return weatherData;
}


function CtoF(celcius) {
    return Math.round((celcius*(9/5)) + 32)
}
  
