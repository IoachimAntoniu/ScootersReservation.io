document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;

            // Salvarea datelor utilizatorului în local storage
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPhone', phone);

            // Redirecționarea către pagina cu harta
            window.location.href = 'scooters.html';
        });
    }

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const city = document.getElementById('city-input').value;
            if (city) {
                fetchScooterData(city);
            }
        });
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            window.location.href = 'reservation.html';
        });
    }

    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const scooterId = document.getElementById('scooter-id').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;

            // Afișarea mesajului de confirmare
            document.getElementById('confirmation-message').style.display = 'block';
            reservationForm.style.display = 'none';
        });

        // Popularea câmpului Scooter ID
        const scooterId = localStorage.getItem('scooterId');
        if (scooterId) {
            document.getElementById('scooter-id').value = scooterId;
        }
    }
});

function fetchScooterData(city) {
    const url = `https://api.citybik.es/v2/networks?fields=id,name,location`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const network = data.networks.find(network => network.location.city.toLowerCase() === city.toLowerCase());
            if (network) {
                fetchScootersInNetwork(network.id);
            } else {
                alert('City not found or no scooter data available.');
            }
        })
        .catch(error => console.error('Error:', error));
}

function fetchScootersInNetwork(networkId) {
    const url = `https://api.citybik.es/v2/networks/${networkId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const stations = data.network.stations;
            displayScootersOnMap(stations);
            displayScootersList(stations);
            document.getElementById('next-btn').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function displayScootersOnMap(stations) {
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '';
    const map = L.map('map').setView([stations[0].latitude, stations[0].longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    stations.forEach(station => {
        if (station.free_bikes > 0) {
            L.marker([station.latitude, station.longitude])
                .addTo(map)
                .bindPopup(`<b>${station.name}</b><br>Bikes available: ${station.free_bikes}`);
        }
    });
}

function displayScootersList(stations) {
    const scooterListContainer = document.getElementById('scooter-list');
    scooterListContainer.innerHTML = '';

    if (stations.length === 0) {
        scooterListContainer.innerHTML = '<p>No scooters available.</p>';
        return;
    }

    const ul = document.createElement('ul');
    stations.forEach(station => {
        if (station.free_bikes > 0) {
            const li = document.createElement('li');
            li.innerHTML = `<b>${station.name}</b><br>Bikes available: ${station.free_bikes}`;
            ul.appendChild(li);

            // Salvarea ID-ului trotinetei în local storage pentru a fi utilizat la rezervare
            li.addEventListener('click', function() {
                localStorage.setItem('scooterId', station.id);
            });
        }
    });

    scooterListContainer.appendChild(ul);
}
