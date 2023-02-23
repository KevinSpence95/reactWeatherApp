import './App.css';
import useGetWeather from './useGetWeather';

function App() {
  
  
  let weatherData = useGetWeather('Houston','US')


  return (
    <div className="WeatherApp">
     {weatherData.tempF}
    </div>
  );
}

export default App;
