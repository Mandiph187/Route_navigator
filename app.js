// Main application logic
let map;
let currentRoute = [];
let currentPolyline = null;
let isRecording = false;
let watchId = null;
let startTime = null;
let durationInterval = null;
let currentMarker = null;

// Initialize the map
function initMap() {
    map = L.map('map').setView([0, 0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                map.setView([lat, lon], 15);
                updateStatus('Location found');
            },
            (error) => {
                updateStatus('Location access denied. Please enable location services.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        updateStatus('Geolocation not supported');
    }
}

// Update status message
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Start recording route
function startRecording() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    isRecording = true;
    currentRoute = [];
    startTime = Date.now();

    document.getElementById('startRecording').disabled = true;
    document.getElementById('stopRecording').disabled = false;
    document.getElementById('saveRoute').disabled = true;

    updateStatus('Recording...');

    // Start watching position
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const point = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                timestamp: Date.now(),
                accuracy: position.coords.accuracy
            };

            currentRoute.push(point);
            updateMap();
            updateStats();

            // Update current position marker
            if (currentMarker) {
                map.removeLayer(currentMarker);
            }
            currentMarker = L.marker([point.lat, point.lon]).addTo(map);
            map.setView([point.lat, point.lon]);
        },
        (error) => {
            console.error('Error getting position:', error);
            updateStatus('Error: ' + error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );

    // Start duration timer
    durationInterval = setInterval(updateDuration, 1000);
}

// Stop recording
function stopRecording() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    if (durationInterval) {
        clearInterval(durationInterval);
        durationInterval = null;
    }

    isRecording = false;

    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = true;
    document.getElementById('saveRoute').disabled = currentRoute.length === 0;

    updateStatus('Recording stopped');
}

// Update map with current route
function updateMap() {
    if (currentPolyline) {
        map.removeLayer(currentPolyline);
    }

    if (currentRoute.length > 0) {
        const latlngs = currentRoute.map(p => [p.lat, p.lon]);
        currentPolyline = L.polyline(latlngs, {color: 'blue', weight: 4}).addTo(map);
    }
}

// Update statistics
function updateStats() {
    document.getElementById('pointCount').textContent = currentRoute.length;

    if (currentRoute.length > 1) {
        const distance = calculateTotalDistance(currentRoute);
        document.getElementById('distance').textContent = distance.toFixed(2);
    }
}

// Update duration
function updateDuration() {
    if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('duration').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Save route
function saveRoute() {
    if (currentRoute.length === 0) {
        alert('No route to save');
        return;
    }

    const routeName = document.getElementById('routeName').value.trim() || 
                     `Route ${new Date().toLocaleString()}`;

    const route = {
        id: Date.now(),
        name: routeName,
        points: currentRoute,
        distance: calculateTotalDistance(currentRoute),
        duration: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
        created: new Date().toISOString()
    };

    saveRouteToStorage(route);

    alert('Route saved successfully!');
    clearRoute();
    loadSavedRoutes();
    updateRouteSelect();
}

// Clear current route
function clearRoute() {
    currentRoute = [];
    startTime = null;

    if (currentPolyline) {
        map.removeLayer(currentPolyline);
        currentPolyline = null;
    }

    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }

    document.getElementById('routeName').value = '';
    document.getElementById('distance').textContent = '0';
    document.getElementById('pointCount').textContent = '0';
    document.getElementById('duration').textContent = '00:00';
    document.getElementById('saveRoute').disabled = true;

    updateStatus('Route cleared');
}

// Load and display saved routes
function loadSavedRoutes() {
    const routes = getAllRoutes();
    const routesList = document.getElementById('routesList');

    if (routes.length === 0) {
        routesList.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No saved routes</p>';
        return;
    }

    routesList.innerHTML = routes.map(route => `
        <div class="route-item">
            <h3>${route.name}</h3>
            <p>Distance: ${route.distance.toFixed(2)} km</p>
            <p>Points: ${route.points.length}</p>
            <p>Created: ${new Date(route.created).toLocaleString()}</p>
            <div class="route-actions">
                <button class="btn btn-primary" onclick="viewRoute(${route.id})">View</button>
                <button class="btn btn-danger" onclick="deleteRoute(${route.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// View a saved route on map
function viewRoute(routeId) {
    const route = getRouteById(routeId);
    if (!route) return;

    // Clear current display
    if (currentPolyline) {
        map.removeLayer(currentPolyline);
    }

    // Draw route
    const latlngs = route.points.map(p => [p.lat, p.lon]);
    currentPolyline = L.polyline(latlngs, {color: 'green', weight: 4}).addTo(map);

    // Fit map to route
    map.fitBounds(currentPolyline.getBounds());

    // Add markers for start and end
    L.marker(latlngs[0], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map).bindPopup('Start');

    L.marker(latlngs[latlngs.length - 1], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map).bindPopup('End');

    updateStatus(`Viewing: ${route.name}`);

    // Switch to record tab to see the map better
    switchTab('recordTab');
}

// Delete a route
function deleteRoute(routeId) {
    if (confirm('Are you sure you want to delete this route?')) {
        deleteRouteFromStorage(routeId);
        loadSavedRoutes();
        updateRouteSelect();
        updateStatus('Route deleted');
    }
}

// Update route select dropdown
function updateRouteSelect() {
    const routes = getAllRoutes();
    const select = document.getElementById('routeSelect');

    select.innerHTML = '<option value="">Select a route...</option>' +
        routes.map(route => `<option value="${route.id}">${route.name}</option>`).join('');

    document.getElementById('startNavigation').disabled = true;
}

// Tab switching
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Update panels
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    const panelId = tabId.replace('Tab', 'Panel');
    document.getElementById(panelId).classList.add('active');
}

// Event listeners
document.getElementById('startRecording').addEventListener('click', startRecording);
document.getElementById('stopRecording').addEventListener('click', stopRecording);
document.getElementById('saveRoute').addEventListener('click', saveRoute);
document.getElementById('clearRoute').addEventListener('click', clearRoute);

document.getElementById('recordTab').addEventListener('click', () => switchTab('recordTab'));
document.getElementById('savedTab').addEventListener('click', () => {
    switchTab('savedTab');
    loadSavedRoutes();
});
document.getElementById('navigateTab').addEventListener('click', () => switchTab('navigateTab'));

document.getElementById('routeSelect').addEventListener('change', (e) => {
    document.getElementById('startNavigation').disabled = !e.target.value;
});

document.getElementById('startNavigation').addEventListener('click', () => {
    const routeId = parseInt(document.getElementById('routeSelect').value);
    if (routeId) {
        startNavigation(routeId);
    }
});

document.getElementById('stopNavigation').addEventListener('click', stopNavigation);

// Initialize app
initMap();
updateRouteSelect();