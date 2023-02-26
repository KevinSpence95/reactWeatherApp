import style from './CurrentDetails.module.css'
export default function CurrentDetails({ windSpeedMPH, windSpeedMPS, feelsLikeC, feelsLikeF, visibilityKM, visibilityMI, humidity, metric}) {

    return (
        <div className={style.currentDetails}>
            <div className="visibility">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <h3>{metric ? visibilityKM : visibilityMI} {metric ? 'km' : 'mi'}</h3> 
            </div>
            <div className="windFeel">
                <div className="wind">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-wind"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>
                <h3>{metric ? windSpeedMPS : windSpeedMPH} {metric ? 'm/s' : 'mph'}</h3> 
                </div>
                <h5>Feels {metric ? feelsLikeC : feelsLikeF}{metric ? "°C" : " °F"}</h5>
            </div>
            <div className="humidity">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-droplet"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                <h3>{humidity}% Humidity</h3> 
            </div>
        </div>
    )
}

