import "./App.css";
import CurrentDetails from "./CurrentDetails";
import Forecast from "./Forecast";
import useGetWeather from "./useGetWeather";
import { useState } from "react";

function App() {
  let [inputs, setInputs] = useState("");
  let [location, setLocation] = useState(["Columbus", "Ohio"]);
  let [metric, setMetric] = useState(false);

  function handleKeyPress() {
    setLocation([inputs.split(",")[0], inputs.split(",")[1]]);
    setInputs("");
  }
  function changeLocation(e) {
    e.preventDefault();
    if (typeof inputs[0] === "undefined" || typeof inputs[1] === "undefined") {
      console.log("try again");
      alert(
        "Please enter a valid input...\n\nValid Input Format:\n Beijing, CN\n Las vegas, Nevada\n\nMake sure to include a comma!"
      );
      setInputs("");
    } else {
      setLocation([inputs.split(",")[0], inputs.split(",")[1]]);
      setInputs("");
    }
  }

  let {weatherData, loading} = useGetWeather(...location);

  if(loading) {
    return (
      <h1>LOADING...</h1>
    )
  }
  return (
    <div
      className={`${!weatherData.daytime && "night"}`}
      id="app-body"
    >
      <section className="userInputs">
        <button
          type="button"
          onClick={() => {
            setMetric((prev) => !prev);
          }}
        >
          {metric ? "Show Imperial" : "Show Metric"}
        </button>
        <input
          type="text"
          value={inputs}
          placeholder="City, State/CC"
          onChange={(e) => {
            setInputs(e.target.value);
          }}
          onKeyDown={(e) => {
            e.key === "Enter" &&
              handleKeyPress()
          }}
        />
        <button type="submit" onClick={changeLocation}>
          Change Loc
        </button>
      </section>

      <h1 className="location">
        {weatherData.city}, {weatherData.stateNameOrCountryCode}
      </h1>

      <div className="weatherDisplay">
        <section className="currentWeather">
          <div className="mainDisplay">
            <h1 className="currentTemp">
              {metric ? weatherData.tempC : weatherData.tempF}
              {metric ? "°C" : " °F"}
            </h1>
            <div className="weatherGroup">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData?.icon}@2x.png`}
                alt={`${weatherData.weather} icon`}
              />
              <div className="weatherGroupText">
                <h2>{weatherData.weather}</h2>
                <h3>{weatherData.weatherDescription}</h3>
              </div>
            </div>
          </div>

          <CurrentDetails
            windSpeedMPH={weatherData.windSpeedMPH}
            windSpeedMPS={weatherData.windSpeedMPS}
            feelsLikeC={weatherData.feelsLikeC}
            feelsLikeF={weatherData.feelsLikeF}
            visibilityKM={weatherData.visibilityKM}
            visibilityMI={weatherData.visibilityMI}
            humidity={weatherData.humidity}
            metric={metric}
          />
        </section>

        <Forecast forecast={weatherData.forecast5day} metric={metric} />
      </div>
    </div>
  );
}

export default App;
