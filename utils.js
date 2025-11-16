// Utility functions

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Calculate total distance of a route
function calculateTotalDistance(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
        total += calculateDistance(
            points[i].lat,
            points[i].lon,
            points[i + 1].lat,
            points[i + 1].lon
        );
    }
    return total;
}

// Calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
              Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180 / Math.PI + 360) % 360;

    return bearing;
}

// Get direction from bearing
function getDirection(bearing) {
    const directions = ['North', 'North-East', 'East', 'South-East', 
                       'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

// Format duration in seconds to readable string
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}