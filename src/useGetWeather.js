import { useEffect, useState } from "react";
import { APIKEY } from "./apikey";




//Helper Functions
function CtoF(celcius) {
  return Math.round(celcius * (9 / 5) + 32);
}
const daysOfTheWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function getWeekDay(dateStr) {
  let date = new Date(dateStr);
  return daysOfTheWeek[date.getDay()];
}
function findMode(arr) {
  let mode = null;
  let maxCount = 0;

  // Count the frequency of each element in the array
  const counts = {};
  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
  }

  // Find the element(s) with the highest frequency
  for (const item in counts) {
    if (counts[item] > maxCount) {
      mode = item;
      maxCount = counts[item];
    }
  }

  return mode;
}




//Custom hook that fetches weather data for the app by location
export default function useGetWeather(city, stateNameOrCountryCode = "") {
  const [weatherData, setWeatherData] = useState("");

  useEffect(() => {
    async function getWeather() {
      try {
        //get lat and lon coordinates of city, state/CC
        //https://openweathermap.org/api/geocoding-api
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

        //get current weather data
        //https://openweathermap.org/current
        let response2 = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${APIKEY}`
        );

        if (!response2.ok) {
          throw new Error(
            `Failed to fetch current weather for ${city}, ${stateNameOrCountryCode}`
          );
        }

        let weatherData = await response2.json();

        //get 5 day / 3 hour forcast data
        //https://openweathermap.org/forecast5
        let response3 = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${APIKEY}`
        );

        if (!response3.ok) {
          throw new Error(
            `Failed to fetch 5 day forecast for ${city}, ${stateNameOrCountryCode}`
          );
        }

        let forcastData = await response3.json();
        let cleanedForecast = forcastData.list.map((dataPoint) => {
          let tempF = CtoF(dataPoint.main.temp - 273.15);
          let time = dataPoint.dt_txt;

          return {
            time,
            weekday: getWeekDay(time),
            tempC: Math.round(dataPoint.main.temp - 273.15),
            tempF,
            icon: dataPoint.weather[0].icon,
            precipProb: dataPoint.pop,
          };
        });
        // console.log(cleanedForecast);
        //---
        let dayPrecipProbs = new Map();
        cleanedForecast.forEach((forecast) => {
          if (!dayPrecipProbs.has(forecast.weekday)) {
            dayPrecipProbs.set(forecast.weekday, [forecast.precipProb]);
          } else {
            let prev = dayPrecipProbs.get(forecast.weekday);
            prev.push(forecast.precipProb);
            dayPrecipProbs.set(forecast.weekday, prev);
          }
        });
        // console.log(dayPrecipProbs);
        //---
        let dayIcons = new Map();
        cleanedForecast.forEach((forecast) => {
          if (!dayIcons.has(forecast.weekday)) {
            dayIcons.set(forecast.weekday, [forecast.icon]);
          } else {
            let prev = dayIcons.get(forecast.weekday);
            prev.push(forecast.icon);
            dayIcons.set(forecast.weekday, prev);
          }
        });
        // console.log(dayIcons);

        let dayIcon = new Map()
        dayIcons.forEach((val,key) => {
            dayIcon.set(key,findMode(val))
        })
        // console.log(dayIcon)

        //
        let dayTemps = new Map();
        cleanedForecast.forEach((forecast) => {
          if (!dayTemps.has(forecast.weekday)) {
            dayTemps.set(forecast.weekday, [forecast.tempC]);
          } else {
            let prev = dayTemps.get(forecast.weekday);
            prev.push(forecast.tempC);
            dayTemps.set(forecast.weekday, prev);
          }
        });
        // console.log(dayTemps);
//
        let dayMinMaxTemp = new Map();

        for (let [key, val] of dayTemps.entries()) {
          let temps = val.length
            let totalTemp = val.reduce(
            (acc, curr) => acc + curr,
            0
          );
          let avgTemp = totalTemp/temps;
          let minTemp = val.reduce(
            (prev, curr) => Math.max(prev, curr),
            -Infinity
          );
          let maxTemp = val.reduce(
            (prev, curr) => Math.min(prev, curr),
            Infinity
          );
          dayMinMaxTemp.set(key, [minTemp,avgTemp, maxTemp]);
        }

        // console.log(dayMinMaxTemp);

        let forecast = new Map()

        dayMinMaxTemp.forEach((val,key) => {

            let minTempF = CtoF(val[0])
            let avgTempF = CtoF(val[1])
            let maxTempF = CtoF(val[2])
            let obj = {
                icon: dayIcon.get(key),
                precipProb : dayPrecipProbs.get(key).reduce((prev,curr)=> Math.max(prev,curr), -Infinity),
                minTempC: val[0],
                avgTempC: val[1],
                maxTempC: val[2],
                minTempF,
                avgTempF,
                maxTempF

            }
            forecast.set(key,obj)
        })
        // console.log('----')
        // console.log(forecast)

        //bundle the data together
        let tempF = CtoF(weatherData.main.temp - 273.15);
        let feelsLikeF = CtoF(weatherData.main.feels_like - 273.15);
        let lowTempF = CtoF(weatherData.main.temp_min - 273.15);
        let highTempF = CtoF(weatherData.main.temp_max - 273.15);
        let windSpeedMPH = Math.round(weatherData.wind.speed * 2.23694); //to get speed from m/s to mph
        let weather = {
          city,
          stateNameOrCountryCode,
          weather: weatherData.weather[0].main,
          weatherDescription: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          percentCloudy: weatherData.clouds.all,
          humidity: weatherData.main.humidity,
          tempF,
          feelsLikeF,
          lowTempF,
          highTempF,
          windSpeedMPH,
          tempC: Math.round(weatherData.main.temp - 273.15),
          feelsLikeC: Math.round(weatherData.main.feels_like - 273.15),
          lowTempC: Math.round(weatherData.main.temp_min - 273.15),
          highTempC: Math.round(weatherData.main.temp_max - 273.15),
          windSpeedMPS: weatherData.wind.speed,
          forecast
        };
        console.log(weather);
        setWeatherData(weather);
      } catch (e) {
        console.log(e);
        alert(e);
      }
    }
    getWeather();
  }, [city, stateNameOrCountryCode]);

  return weatherData;
}
