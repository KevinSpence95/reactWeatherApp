import styles from "./Forecast.module.css";
export default function Forecast({ forecast, metric }) {
  return (
    <div className={styles.forecastWrapper}>
      <div className={styles.forecastGridHeader}>
        <h5 style={{ paddingLeft: "1.5rem" }}>Forecast</h5>
        <h5 style={{ justifySelf: "center" }}>Low</h5>
        <h5 style={{ justifySelf: "center" }}>Avg</h5>
        <h5 style={{ justifySelf: "center" }}>High</h5>
      </div>
      {forecast &&
        forecast.map((day, i) => {
          return (
            <div className={styles.forecastGrid} key={i}>
              <div className={styles.forecastColumn}>
                <h5 className={styles.day}>
                  {day[0] === "Today" ? day[0] : day[0].substring(0, 3)}
                </h5>
                {day[1].precipProb > 0 ? (
                  <div className={styles.iconContainer}>
                    <img
                      src={`https://openweathermap.org/img/wn/${day[1].icon}@2x.png`}
                      alt={day[1].iconAlt}
                      className={styles.shrunkIcon}
                    />
                    <div className={styles.chanceOfRain}>
                      <h6>{Math.round(day[1].precipProb * 100)}%</h6>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-raindroplet"
                        style={{ transform: "translateY(4px)" }}
                      >
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className={styles.iconContainer}>
                    <img
                      src={`https://openweathermap.org/img/wn/${day[1].icon}@2x.png`}
                      alt={day[1].iconAlt}
                      className={styles.normalIcon}
                    />
                  </div>
                )}
              </div>
              <div className="lowColumn" style={{ justifySelf: "center" }}>
                <h5>{metric ? day[1].minTempC : day[1].minTempF}</h5>
              </div>
              <div className="avgColumn" style={{ justifySelf: "center" }}>
                <h5>{metric ? day[1].avgTempC : day[1].avgTempF}</h5>
              </div>
              <div className="highColumn" style={{ justifySelf: "center" }}>
                <h5>{metric ? day[1].maxTempC : day[1].maxTempF}</h5>
              </div>
            </div>
          );
        })}
    </div>
  );
}
