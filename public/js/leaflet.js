document.addEventListener('DOMContentLoaded', () => {
    const locationsData = JSON.parse(
        document.getElementById('map').dataset.locations
    );
 

    //OK - PRINT THE LOCATIONS OF THE CURRENT TOUR!
    console.log(locationsData)
    const [longStart, latStart] = locationsData[0].coordinates;
 
    const map = L.map('map').setView([latStart, longStart], 8);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
 

    /**
     * L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth:250,
                minWidth:100 ,
                autoClose:false, 
                closeOnClick:false,
                //className:'running-popup', 
                className:`${workout.type}-popup`

            })).setPopupContent(`${workout.distance}`)
            .openPopup();
        }
        
     */
    for (i = locationsData.length - 1; i >= 0; i--) {
        const currLocation = locationsData[i];
 
        const [long, lat] = currLocation.coordinates;
 
        const marker = L.marker([lat, long]).addTo(map);
 
        marker
            .bindPopup(`<h1>Arrive on Day ${currLocation.day}</h1><br><h1>Location: ${currLocation.description}.</h1>`).openPopup();
    }
});