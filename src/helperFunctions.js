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

export { CtoF, getWeekDay, findMode };
