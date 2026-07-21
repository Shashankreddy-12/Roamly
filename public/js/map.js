const map = new mapboxgl.Map({
    accessToken: maptoken,
    container: 'map', // container ID
    center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

const mapmarker = new mapboxgl.Marker({color: 'red'})
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({offset : 25}).setHTML(
            `<h5 style="color: red;">${title}</h5><p>Contact the owner for exact location</p>`
        )
    )
    .addTo(map);


