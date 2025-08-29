const cards = document.getElementById('cards');

const CITIES = ['Bucharest','Buzau','Iasi','Cluj-Napoca','Brasov','Constanta'];

function slugify(s){
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
}

function renderCardShell(id, title){
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-4';
  col.id = `col-${id}`;
  col.innerHTML = `
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="fw-semibold">${title}</span>
      </div>
      <div class="card-body skeleton">
        <span class="bar" style="width:70%"></span>
        <span class="bar" style="width:40%"></span>
        <span class="bar" style="width:55%"></span>
      </div>
    </div>`;
  cards.appendChild(col);
}

function updateCard(id, html){
  const body = document.querySelector(`#col-${id} .card-body`);
  if(body) body.innerHTML = html;
}

async function geocodeCity(name){
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=ro`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Geocodare ${res.status}`);
  const data = await res.json();
  if(!data.results || data.results.length===0) throw new Error('Oraș negăsit');
  const r = data.results[0];
  return { lat:r.latitude, lon:r.longitude, label:`${r.name}, ${r.country_code}` };
}

async function getWeather(lat, lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Vreme ${res.status}`);
  const d = await res.json();
  return {
    temp: Math.round(d.current_weather.temperature),
    wind: Math.round(d.current_weather.windspeed)
  };
}

async function addCity(cityName){
  const id = slugify(cityName);
  renderCardShell(id, cityName);

  try{
    const geo = await geocodeCity(cityName);
    const w   = await getWeather(geo.lat, geo.lon);

    const h = document.querySelector(`#col-${id} .card-header span`);
    if(h) h.textContent = geo.label;

    updateCard(id, `
      <div class="display-6 mb-2">${w.temp}°C</div>
      <div class="text-muted">Vânt: ${w.wind} km/h</div>
    `);
  } catch(e){
    updateCard(id, `<div class="text-danger">${e.message}</div>`);
  }
}

(async function start(){
  for(const c of CITIES){
    await addCity(c);
  }
})();