const app = {};
var startyear = 2021;
var endyear;

function minYear(x) {
  if (x < startyear) {
    startyear = x;
  }
}

function chooseYear(year) {
  while (year <= 2019) {
    var opt = document.createElement('option');
    opt.value = 2019 - (year - startyear);
    opt.innerHTML = 2019 - (year - startyear);
    document.getElementById("yearstart").appendChild(opt);
    //console.log("i did it")
    year++;
  }
}

function chooseEndYear(year) {
  document.getElementById("yearEnd").innerHTML = ""
  let yearStarter = year.target.value;
  while (yearStarter <= 2020) {
    var opt = document.createElement('option');
    opt.value = 2020 - (yearStarter - year.target.value);
    opt.innerHTML = 2020 - (yearStarter - year.target.value);
    document.getElementById("yearEnd").appendChild(opt);
    //console.log("i did it")
    yearStarter++;
  }
}

fetch("https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shootings_and_Firearm_Discharges/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json").then(response => response.json()).then(function(data) {
  for (var i = 0; i < data.features.length; i++) {
    if (data.features[i].attributes.Occurrence_year < startyear) {
      startyear = data.features[i].attributes.Occurrence_year;
    }
  }

  return startyear;
}).then(chooseYear);

document.getElementById("yearstart").onchange = chooseEndYear;

app.setUpMap = () => {
  L.mapquest.key = 'lYrP4vF3Uk5zgTiGGuEzQGwGIVDGuy24';
  app.map = L.mapquest.map('map', {
    center: [43.6532, -79.3832],
    layers: L.mapquest.tileLayer('dark'),
    zoom: 12
  });
  app.markerLayer = L.layerGroup().addTo(app.map);
  app.arrayCounter++;
  app.map.addControl(L.mapquest.control());
}
app.addLocation = (y, x, textArg, subtextArg) => {
  L.mapquest.textMarker([y, x], {
    text: textArg,
    subtext: subtextArg,
    position: 'right',
    type: 'marker',
    icon: {
      primaryColor: '#333333',
      secondaryColor: '#333333',
      size: 'sm'
    }
  }).addTo(app.markerLayer);
}

function fetchRecursively(url = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shootings_and_Firearm_Discharges/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json", offset = 0, previousResponse = []) {
  return fetch(`${url}&resultOffset=${offset}`)
    .then(response => response.json())
    .then(newResponse => {
      // console.log(newResponse);
      //console.log(newResponse.exceededTransferLimit);
      //console.log(newResponse.features);
      // console.log('array', Array.isArray(newResponse.features));
      const response = [...previousResponse, ...newResponse.features];
      //console.log('condition', newResponse.exceededTransferLimit == true);
      if (newResponse.exceededTransferLimit == true) {
        offset = offset + 2000;
        //console.log("why yes i've looped");
        return fetchRecursively(url, offset, response);
      }
      //console.log(response);
      return response;
    });
}
app.crimefetch = () => {
  //fetch("https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shootings_and_Firearm_Discharges/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultOffset=3000")

  fetchRecursively("https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shootings_and_Firearm_Discharges/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json", 0, []).then(function(data) {
    //console.log(data.features[1]);
    //console.log(data);
    app.insertLocation(data);
  });
}

app.insertLocation = (data) => {
  app.crimeData = data;
  //console.log(app.crimeData);
  let i = 0;
  let j = 0;
  /* app.markerLayer.remove().then(()=>{
    app.markerLayer = L.layerGroup().addTo(app.map);
  }); */
  while (i < app.crimeData.length) {
    if (app.crimeData[i].attributes.Occurrence_year >= document.getElementById("yearstart").value && app.crimeData[i].attributes.Occurrence_year <= document.getElementById("yearEnd").value) {
      let x = app.crimeData[i].geometry.x;
      let y = app.crimeData[i].geometry.y;
      let textArg = app.crimeData[i].attributes.Neighbourhood;
      let subtextArg = app.crimeData[i].attributes.Neighbourhood;
      app.addLocation(y, x, textArg, subtextArg);
      j++;
    }

    i++;
  }
  console.log(j);
}

app.init = () => {

  window.onload = () => {
    app.setUpMap();
    document.querySelector("form").addEventListener("submit", function(event) {
      event.preventDefault();
      app.markerLayer.clearLayers();
      app.crimefetch();
    });

  }
}
app.init();
