import { useEffect } from "react";
import {APIKEY} from "./apikey";

export default async function useGetWeather(city, stateOrCountryCode = '') {
    try {
        let response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${stateOrCountryCode}&limit=1&appid=${APIKEY}`)
        if (!response.ok) {
            throw new Error(`Failed to fetch coordinates of ${city}, ${stateOrCountryCode}`)
        }
        let coordsData = await response.json()
        console.log(coordsData)
    } catch(e) {
        console.log(e)
        alert(e)
    }
}