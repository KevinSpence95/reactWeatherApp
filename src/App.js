import './App.css';
import useGetWeather from './useGetWeather';
import { useState } from 'react';

function App() {
  let [inputs, setInputs] = useState([])
  let [location, setLocation] = useState(["Columbus",'Ohio']) //TODO: use geolocation api to set the initial loaction

  function getInputs(e) {
      let cleanedInput = [e.target.value.toUpperCase().split(',')[0], e.target.value.toUpperCase().split(',')[1]]
      setInputs(cleanedInput)
  }

  function changeLocation(e) {
    e.preventDefault()
    setLocation(inputs)
  }

  let weatherData = useGetWeather(...location)

  return (
    <div className="WeatherApp">
    <input type="text" placeholder='City, State/CC' onChange={getInputs}/>
    <button type='submit' onClick={changeLocation}>Change Location</button>
    {JSON.stringify(weatherData)}
    
    </div>
  );
}

export default App;
