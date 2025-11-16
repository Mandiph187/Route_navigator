// Local storage management

const STORAGE_KEY = 'routeRecorderRoutes';

// Save a route to local storage
function saveRouteToStorage(route) {
    const routes = getAllRoutes();
    routes.push(route);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

// Get all routes from local storage
function getAllRoutes() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Get a specific route by ID
function getRouteById(id) {
    const routes = getAllRoutes();
    return routes.find(route => route.id === id);
}

// Delete a route from local storage
function deleteRouteFromStorage(id) {
    const routes = getAllRoutes();
    const filtered = routes.filter(route => route.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Clear all routes
function clearAllRoutes() {
    localStorage.removeItem(STORAGE_KEY);
}

// Export routes as JSON
function exportRoutes() {
    const routes = getAllRoutes();
    const dataStr = JSON.stringify(routes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `routes_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

// Import routes from JSON
function importRoutes(jsonData) {
    try {
        const importedRoutes = JSON.parse(jsonData);
        const existingRoutes = getAllRoutes();
        const allRoutes = [...existingRoutes, ...importedRoutes];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRoutes));
        return true;
    } catch (error) {
        console.error('Error importing routes:', error);
        return false;
    }
}