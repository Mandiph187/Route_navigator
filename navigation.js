// Navigation functionality
let navigationRoute = null;
let navigationWatchId = null;
let currentPositionIndex = 0;
let navigationMarker = null;
let navigationPolyline = null;
let speechSynthesis = window.speechSynthesis;
let lastInstruction = '';

function startNavigation(routeId) {
    const route = getRouteById(routeId);
    if (!route) {
        alert('Route not found');
        return;
    }

    navigationRoute = route;
    currentPositionIndex = 0;

    // Clear map
    if (navigationPolyline) {
        map.removeLayer(navigationPolyline);
    }
    if (navigationMarker) {
        map.removeLayer(navigationMarker);
    }

    // Draw route
    const latlngs = route.points.map(p => [p.lat, p.lon]);
    navigationPolyline = L.polyline(latlngs, {color: 'purple', weight: 4}).addTo(map);
    map.fitBounds(navigationPolyline.getBounds());

    // Add start marker
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

    // Add end marker
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

    // Enable navigation UI
    document.getElementById('startNavigation').disabled = true;
    document.getElementById('stopNavigation').disabled = false;
    document.getElementById('routeSelect').disabled = true;
    document.getElementById('navigationInfo').classList.add('active');

    updateStatus('Navigation started');
    speak('Navigation started. Follow the route.');

    // Start watching position
    if (navigator.geolocation) {
        navigationWatchId = navigator.geolocation.watchPosition(
            updateNavigationPosition,
            (error) => {
                console.error('Navigation error:', error);
                updateStatus('Navigation error: ' + error.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    }
}

function updateNavigationPosition(position) {
    const currentLat = position.coords.latitude;
    const currentLon = position.coords.longitude;

    // Update current position marker
    if (navigationMarker) {
        map.removeLayer(navigationMarker);
    }
    navigationMarker = L.marker([currentLat, currentLon], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    map.setView([currentLat, currentLon]);

    // Find closest point on route
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < navigationRoute.points.length; i++) {
        const point = navigationRoute.points[i];
        const distance = calculateDistance(currentLat, currentLon, point.lat, point.lon);

        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
        }
    }

    currentPositionIndex = closestIndex;

    // Calculate remaining distance
    let remainingDistance = 0;
    for (let i = closestIndex; i < navigationRoute.points.length - 1; i++) {
        const p1 = navigationRoute.points[i];
        const p2 = navigationRoute.points[i + 1];
        remainingDistance += calculateDistance(p1.lat, p1.lon, p2.lat, p2.lon);
    }

    // Update navigation info
    const navInfo = document.getElementById('navigationInfo');
    const distanceToRoute = minDistance * 1000; // Convert to meters

    let instruction = '';
    let shouldSpeak = false;

    if (distanceToRoute > 50) {
        instruction = `You are ${distanceToRoute.toFixed(0)} meters off route. Return to the route.`;
        if (lastInstruction !== 'off-route') {
            shouldSpeak = true;
            lastInstruction = 'off-route';
        }
    } else if (closestIndex >= navigationRoute.points.length - 5) {
        instruction = 'You are approaching your destination.';
        if (lastInstruction !== 'approaching') {
            shouldSpeak = true;
            lastInstruction = 'approaching';
        }
    } else if (closestIndex >= navigationRoute.points.length - 1) {
        instruction = 'You have arrived at your destination!';
        if (lastInstruction !== 'arrived') {
            shouldSpeak = true;
            speak(instruction);
            lastInstruction = 'arrived';
            setTimeout(() => stopNavigation(), 3000);
        }
    } else {
        instruction = 'Continue along the route.';
        if (lastInstruction !== 'continue' && lastInstruction !== '') {
            shouldSpeak = true;
            lastInstruction = 'continue';
        }
    }

    navInfo.innerHTML = `
        <h3>Navigation</h3>
        <p class="distance-to-route">Distance to route: ${distanceToRoute.toFixed(0)} m</p>
        <p class="instruction">${instruction}</p>
        <p>Remaining distance: ${remainingDistance.toFixed(2)} km</p>
        <p>Progress: ${Math.round((closestIndex / navigationRoute.points.length) * 100)}%</p>
    `;

    if (shouldSpeak) {
        speak(instruction);
    }
}

function stopNavigation() {
    if (navigationWatchId !== null) {
        navigator.geolocation.clearWatch(navigationWatchId);
        navigationWatchId = null;
    }

    navigationRoute = null;
    currentPositionIndex = 0;
    lastInstruction = '';

    if (navigationMarker) {
        map.removeLayer(navigationMarker);
        navigationMarker = null;
    }

    document.getElementById('startNavigation').disabled = false;
    document.getElementById('stopNavigation').disabled = true;
    document.getElementById('routeSelect').disabled = false;
    document.getElementById('navigationInfo').classList.remove('active');

    updateStatus('Navigation stopped');
    speak('Navigation stopped.');
}

function speak(text) {
    if (speechSynthesis) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        speechSynthesis.speak(utterance);
    }
}