async function getCoords(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Eroare la geocodare");
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error("Oraș negăsit");
  return {
    lat: data.results[0].latitude,
    lon: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country
  };
}

async function getWeather(city) {
  const coords = await getCoords(city);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Eroare la vreme");
  const data = await res.json();
  return {
    city: `${coords.name}, ${coords.country}`,
    temp: data.current_weather.temperature,
    wind: data.current_weather.windspeed
  };
}

(async () => {
  const box = document.getElementById("out");
  box.textContent = "Se încarcă...";
  try {
    const data = await getWeather("Bucharest");
    box.innerHTML = `${data.city}: ${data.temp}°C, vânt ${data.wind} km/h`;
  } catch (e) {
    box.textContent = e.message;
  }
})();