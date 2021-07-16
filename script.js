const app = {};
app.button = document.getElementById('open');
app.formWrapper = document.querySelector('.form');
app.form = document.querySelector('form');
app.submit = document.getElementById('submit');
app.startYear = 2021;

function minYear(x) {
    if (x < app.startYear) {
        app.startYear = x;
    }
}

function chooseYear(year) {
    while (year <= 2020) {
        var opt = document.createElement('option');
        opt.value = 2020 - (year - app.startYear);
        opt.innerHTML = 2020 - (year - app.startYear);
        document.getElementById("yearstart").appendChild(opt);
        console.log("i did it")
        year++;
    }
}

function chooseEndYear(year) {
    document.getElementById("yearEnd").innerHTML = ""
    let yearStarter = year.target.value;
    while (yearStarter <= 2021) {
        var opt = document.createElement('option');
        opt.value = 2021 - (yearStarter - year.target.value);
        opt.innerHTML = 2021 - (yearStarter - year.target.value);
        document.getElementById("yearEnd").appendChild(opt);
        console.log("i did it")
        yearStarter++;
    }
}

fetch("https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shootings_and_Firearm_Discharges/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json").then(response => response.json()).then(function(data) {
    for (var i = 0; i < data.features.length; i++) {
        if (data.features[i].attributes.Occurrence_year < app.startYear) {
            app.startYear = data.features[i].attributes.Occurrence_year;
        }
    }

    return app.startYear;
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
app.crimefetch = () => {
    fetch("https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shootings_and_Firearm_Discharges/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json").then(response => response.json()).then(function(data) {
        //console.log(data.features[1]);
        console.log(data);
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
    console.log(app.crimeData.features.length);
    while (i < app.crimeData.features.length) {
        if (app.crimeData.features[i].attributes.Occurrence_year >= document.getElementById("yearstart").value && app.crimeData.features[i].attributes.Occurrence_year <= document.getElementById("yearEnd").value) {
            let x = app.crimeData.features[i].geometry.x;
            let y = app.crimeData.features[i].geometry.y;
            let textArg = app.crimeData.features[i].attributes.Neighbourhood;
            let subtextArg = app.crimeData.features[i].attributes.Neighbourhood;
            app.addLocation(y, x, textArg, subtextArg);
            j++;
        }
        console.log(j);
    }
}
app.addEventsToButtons = () => {
    app.button.addEventListener('click', (event) => {
        app.formWrapper.classList.remove('hide');
        app.button.classList.remove('show');
        app.markerLayer.clearLayers();
    });
    app.submit.addEventListener('click', (event) => {
        app.formWrapper.classList.add('hide');
        app.button.classList.add('show');
    });
    app.form.addEventListener("submit", function(event) {
        event.preventDefault();
        app.crimefetch();
    });
}
app.init = () => {

    window.onload = () => {
        app.setUpMap();
        app.addEventsToButtons();
    }
}
app.init();