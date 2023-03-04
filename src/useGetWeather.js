import { useEffect, useState } from "react";
import { APIKEY } from "./apikey";
import { CtoF, getWeekDay, findMode } from "./helperFunctions";

//Custom hook that fetches weather data for the app by location
export default function useGetWeather(city, stateNameOrCountryCode = "") {
  const [weatherData, setWeatherData] = useState("");

  useEffect(() => {
    async function getWeather() {
      try {
        //get lat and lon coordinates of city, state/CC
        //https://openweathermap.org/api/geocoding-api
        let response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city},${stateNameOrCountryCode}&limit=1&appid=${APIKEY}`
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
        // console.log(weatherData);

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
            iconAlt: dataPoint.weather[0].description,
            precipProb: dataPoint.pop,
          };
        });

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
        let dayIcon = new Map();
        dayIcons.forEach((val, key) => {
          dayIcon.set(key, findMode(val));
        });
        let dayIconsAlts = new Map();
        cleanedForecast.forEach((forecast) => {
          if (!dayIconsAlts.has(forecast.weekday)) {
            dayIconsAlts.set(forecast.weekday, [forecast.iconAlt]);
          } else {
            let prev = dayIconsAlts.get(forecast.weekday);
            prev.push(forecast.iconAlt);
            dayIconsAlts.set(forecast.weekday, prev);
          }
        });
        let dayIconAlts = new Map();
        dayIconsAlts.forEach((val, key) => {
          dayIconAlts.set(key, findMode(val));
        });

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

        let dayMinMaxTemp = new Map();

        for (let [key, val] of dayTemps.entries()) {
          // console.log(val)
          let temps = val.length;
          let totalTemp = val.reduce((acc, curr) => acc + curr, 0);
          let avgTemp = Math.round(totalTemp / temps);
          let maxTemp = val.reduce(
            (prev, curr) => Math.max(prev, curr),
            -Infinity
          );
          let minTemp = val.reduce(
            (prev, curr) => Math.min(prev, curr),
            Infinity
          );
          dayMinMaxTemp.set(key, [minTemp, avgTemp, maxTemp]);
        }

        // console.log(dayMinMaxTemp);

        let forecast5day = new Map();

        dayMinMaxTemp.forEach((val, key) => {
          let minTempF = CtoF(val[0]);
          let avgTempF = CtoF(val[1]);
          let maxTempF = CtoF(val[2]);
          let obj = {
            icon: dayIcon.get(key),
            iconAlt: dayIconAlts.get(key),
            precipProb: dayPrecipProbs
              .get(key)
              .reduce((prev, curr) => Math.max(prev, curr), -Infinity),
            minTempC: val[0],
            avgTempC: val[1],
            maxTempC: val[2],
            minTempF,
            avgTempF,
            maxTempF,
          };
          forecast5day.set(key, obj);
        });

        //check if 5day forcast Map is of size 6. if so, set the first entry of the Map to have a value that considers both the current data and the 5 day forecast data for the rest of today (lowest lowTemp, highest highTemp, highest precipProb, and average of current temp and the avgTemp from the 5day)
        let firstPass = true;
        if (forecast5day.size > 5) {
          //Assuming map size of 6
          //replace the first entry with an entry with a today key with data that considers current data and 5 day forecast data for the rest of the current day
          forecast5day.forEach((val, key) => {
            if (firstPass) {
              let currLowTempC = Math.round(weatherData.main.temp_min - 273.15);
              let currHighTempC = Math.round(
                weatherData.main.temp_max - 273.15
              );
              let currTemp = Math.round(weatherData.main.temp - 273.15);
              let low5dayTempC = val.minTempC;
              let high5dayTempC = val.maxTempC;
              let avg5dayTempC = val.avgTempC;

              let minTempC = Math.min(currLowTempC, low5dayTempC);
              let avgTempC = (currTemp + avg5dayTempC) / 2;
              let maxTempC = Math.max(currHighTempC, high5dayTempC);
              let minTempF = CtoF(minTempC);
              let avgTempF = CtoF(avgTempC);
              let maxTempF = CtoF(maxTempC);
              forecast5day.set("Today", {
                ...val,
                minTempC,
                avgTempC,
                maxTempC,
                minTempF,
                avgTempF,
                maxTempF,
              });
              forecast5day.delete(key);
              firstPass = false; //so this only happens once on the first element
            }
          });
        } else {
          //Assuming map size of 5
          //add a Today key to the 5day forecase with the value of just the current days data
          forecast5day.set("Today", {
            icon: weatherData.weather[0].icon,
            precipProb: weatherData.weather[0].description.match(
              /rain|drizzle|snow|sleet/i
            )
              ? 1
              : 0, //0 or 1 depending on whether the current weather description includes rain, drizzle, snow, sleet
            minTempC: Math.round(weatherData.main.temp_min - 273.15),
            avgTempC: Math.round(weatherData.main.temp - 273.15),
            maxTempC: Math.round(weatherData.main.temp_max - 273.15),
            minTempF: CtoF(Math.round(weatherData.main.temp_min - 273.15)),
            avgTempF: CtoF(Math.round(weatherData.main.temp - 273.15)),
            maxTempF: CtoF(Math.round(weatherData.main.temp_max - 273.15)),
          });
          firstPass = false;
        }

        //turn it into a map for easy iteration
        let forecast5dayArr = [...forecast5day];
        let today = forecast5dayArr.pop();
        forecast5dayArr.unshift(today);
        //-------------------------------------

        //bundle the data together
        let tempF = CtoF(weatherData.main.temp - 273.15);
        let feelsLikeF = CtoF(weatherData.main.feels_like - 273.15);
        let windSpeedMPH = Math.round(weatherData.wind.speed * 2.23694); //to get speed from m/s to mph
        let visibilityMI = (weatherData.visibility / 1609).toFixed(1);
        let weather = {
          city: weatherData.name,
          stateNameOrCountryCode: weatherData.sys.country,
          weather: weatherData.weather[0].main,
          weatherDescription: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          daytime: weatherData.weather[0].icon.match(/d/i) ? true : false,
          humidity: weatherData.main.humidity,
          visibilityKM: Math.round(weatherData.visibility / 1000),
          visibilityMI,
          tempF,
          feelsLikeF,
          windSpeedMPH,
          tempC: Math.round(weatherData.main.temp - 273.15),
          feelsLikeC: Math.round(weatherData.main.feels_like - 273.15),
          windSpeedMPS: weatherData.wind.speed,
          forecast5day: forecast5dayArr,
        };
        console.log(weather);
        setWeatherData(weather);
      } catch (e) {
        console.log(e);
      }
    }
    getWeather();
  }, [city, stateNameOrCountryCode]);

  return weatherData;
}
