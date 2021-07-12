const app = {};
app.setUpMap = () => {
    L.mapquest.key = 'lYrP4vF3Uk5zgTiGGuEzQGwGIVDGuy24';
    const map = L.mapquest.map('map', {
        center: [43.6532, -79.3832],
        layers: L.mapquest.tileLayer('dark'),
        zoom: 12
    });
    app.getLocationExample(map);
    map.addControl(L.mapquest.control());
}
app.getLocationExample = (map) => {
    L.mapquest.textMarker([43.74318039, -79.21887334999998], {
        text: 'Shootings and Firearm Discharges',
        subtext: 'Scarborough Village (139)',
        position: 'right',
        type: 'marker',
        icon: {
            primaryColor: '#333333',
            secondaryColor: '#333333',
            size: 'sm'
        }
    }).addTo(map);
}
app.init = () => {
    window.onload = () => {
        app.setUpMap();
    }
}
app.init();