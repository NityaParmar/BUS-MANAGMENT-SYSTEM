// Initialize the map centered on Vadodara, Gujarat
const map = L.map("map").setView([22.3072, 73.1812], 12);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Store bus markers
const busMarkers = {};

// Connect to WebSocket for real-time tracking
const socket = new WebSocket("ws://localhost:5000");

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.type === "bus_locations") {
        data.buses.forEach(bus => {
            if (busMarkers[bus.id]) {
                busMarkers[bus.id].setLatLng([bus.lat, bus.lng]);
            } else {
                busMarkers[bus.id] = L.marker([bus.lat, bus.lng]).addTo(map)
                    .bindPopup(`
                        <b>${bus.route}</b><br>
                        <strong>Driver:</strong> ${bus.driver}<br>
                        <strong>Contact:</strong> <a href="tel:${bus.contact}">${bus.contact}</a>
                    `);
            }
        });
    }
};

// Fetch bus schedule
function fetchBusSchedule() {
    fetch("http://localhost:5000/api/bus-schedule")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderBusSchedule(data.schedule);
            }
        })
        .catch(error => console.error("Error fetching bus schedule:", error));
}

function renderBusSchedule(busData) {
    const scheduleContainer = document.getElementById("scheduleBody");
    scheduleContainer.innerHTML = "";

    busData.forEach(bus => {
        const busBox = document.createElement("div");
        busBox.classList.add("bus-box");
        busBox.innerHTML = `
            <h3>${bus.route}</h3>
            <p><strong>Time:</strong> ${bus.time}</p>
            <p><strong>Status:</strong> <span class="status-badge ${bus.status === "On Time" ? "status-on-time" : "status-delayed"}">${bus.status}</span></p>
            <p><strong>Capacity:</strong> ${bus.capacity}</p>
            <p><strong>Driver:</strong> ${bus.driver}</p>
            <p><strong>Contact:</strong> <a href="tel:${bus.contact}">${bus.contact}</a></p>
            <button onclick="focusOnBus(${bus.id})">Track Bus</button>
        `;
        scheduleContainer.appendChild(busBox);
    });
}

// Zoom to bus location when clicking "Track Bus"
function focusOnBus(busId) {
    if (busMarkers[busId]) {
        map.setView(busMarkers[busId].getLatLng(), 15);
        busMarkers[busId].openPopup();
    }
}

// Auto-refresh bus schedule every 10 seconds
setInterval(fetchBusSchedule, 10000);
fetchBusSchedule(); // Initial fetch
