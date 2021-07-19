//import shootingUrl from './urlInfo.mjs';
const app = {};
//Define varibles
app.shootingUrl = {
    url: 'https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shootings_and_Firearm_Discharges/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json',
    yearKeyName: 'Occurrence_year',
    neighbourhood: 'Neighbourhood',
    typeOfCrime: 'Shooting And Firearm Discharges'
};
app.theftUrl = {
    url: 'https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Theft_Over/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json',
    yearKeyName: 'occurrenceyear',
    neighbourhood: 'Neighbourhood',
    typeOfCrime: 'Theft Over'
};
app.homicideUrl = {
    url: 'https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Homicide_ASR_RC_TBL_002/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json',
    yearKeyName: 'Occurrence_year',
    neighbourhood: 'Neighbourhood',
    typeOfCrime: 'Homicide'
}
app.startYearSelection = document.getElementById("yearstart");
app.endYearSelection = document.getElementById("yearEnd");
app.realUrl = app.shootingUrl;
app.typeOfCrime = document.getElementById('typeOfCrime');
app.button = document.getElementById('open');
app.formWrapper = document.querySelector('.form');
app.form = document.querySelector('form');
app.submit = document.getElementById('submit');
app.startyear = 2021;
//A function that takes number "year" as variable, add options to HTML
app.chooseYear = function(year) {
    while (year <= 2019) {
        let opt = document.createElement('option');
        opt.value = 2019 - (year - app.startyear);
        opt.innerHTML = 2019 - (year - app.startyear);
        app.startYearSelection.appendChild(opt);
        year++;
    }
}

app.chooseEndYear = (year) => {
    document.getElementById("yearEnd").innerHTML = ""
    let yearStarter = year.target.value;
    while (yearStarter <= 2020) {
        var opt = document.createElement('option');
        opt.value = 2020 - (yearStarter - year.target.value);
        opt.innerHTML = 2020 - (yearStarter - year.target.value);
        app.endYearSelection.appendChild(opt);
        yearStarter++;
    }
}
app.setUpForm = () => {
    app.startYearSelection.innerHTML = '<option value = "2020">2020</option>';
    app.endYearSelection.innerHTML = '<option value = "2020">2020</option>';
    fetch(app.realUrl.url).then(response => response.json()).then(function(data) {
        for (var i = 0; i < data.features.length; i++) {
            if (data.features[i].attributes[app.realUrl.yearKeyName] < app.startyear) {
                app.startyear = data.features[i].attributes[app.realUrl.yearKeyName];
            }
        }
        return app.startyear;
    }).then(app.chooseYear);
}
app.setUpMap = () => {
    L.mapquest.key = 'lYrP4vF3Uk5zgTiGGuEzQGwGIVDGuy24';
    app.map = L.mapquest.map('map', {
        center: [43.6532, -79.3832],
        layers: L.mapquest.tileLayer('dark'),
        zoom: 12
    });
    app.markerLayer = L.layerGroup().addTo(app.map);
    app.arrayCounter++;
    //app.map.addControl(L.mapquest.control());
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

app.fetchRecursively = (url, offset = 0, previousResponse = []) => {
    return fetch(`${url}&resultOffset=${offset}`)
        .then(response => response.json())
        .then(newResponse => {
            const response = [...previousResponse, ...newResponse.features];

            if (newResponse.exceededTransferLimit == true) {
                offset = offset + 2000;

                return app.fetchRecursively(url, offset, response);
            }

            return response;
        });
}
app.setUpUrl = (value) => {
    if (value === "Shooting") {
        app.realUrl = app.shootingUrl;
    } else if (value === "Break") {
        app.realUrl = app.theftUrl;
    } else if (value === "Homicide") {
        app.realUrl = app.homicideUrl;
    } else {
        app.realUrl = app.shootingUrl;
    }
}
app.crimefetch = () => {
    app.setUpUrl(typeOfCrime.value);
    app.fetchRecursively(app.realUrl.url, 0, []).then(function(data) {
        app.insertLocation(data);
    });
}
app.addEventsToButtons = () => {
    app.startYearSelection.addEventListener('change', (event) => {
        app.chooseEndYear(event);
    });
    app.typeOfCrime.addEventListener('change', (event) => {
        app.setUpForm();

    });
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
app.insertLocation = (data) => {
    let i = 0;
    while (i < data.length) {
        if (data[i].attributes[app.realUrl.yearKeyName] >= document.getElementById("yearstart").value && data[i].attributes[app.realUrl.yearKeyName] <= document.getElementById("yearEnd").value) {
            let x = data[i].geometry.x;
            let y = data[i].geometry.y;
            let textArg = data[i].attributes[app.realUrl.yearKeyName] + " " + app.realUrl.typeOfCrime;
            let subtextArg = data[i].attributes[app.realUrl.neighbourhood];
            app.addLocation(y, x, textArg, subtextArg);
        }
        i++
    }
}
app.init = () => {
    window.onload = () => {
        app.setUpForm();
        app.setUpMap();
        app.addEventsToButtons();
    }
}
app.init();