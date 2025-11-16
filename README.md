# Route Recorder & Navigator

A web-based GPS route recording and navigation application with audio instructions.

## Features

- **Record Routes**: Track your GPS location to record routes
- **Save Routes**: Store routes locally in your browser
- **View Routes**: Display saved routes on an interactive map
- **Navigate Routes**: Get turn-by-turn audio navigation along saved routes
- **Offline Support**: Works offline after initial load (PWA)
- **Mobile Friendly**: Optimized for mobile devices

## Setup Instructions

### Option 1: GitHub Pages (Recommended)

1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click Save
7. Access your app at: `https://yourusername.github.io/repository-name/`

### Option 2: Local Server

1. Install Python (if not already installed)
2. Navigate to the project folder in terminal/command prompt
3. Run: `python -m http.server 8000`
4. Open browser and go to: `http://localhost:8000`

### Option 3: Direct File Access

Simply open `index.html` in a modern web browser. Note: Some features may be limited due to browser security restrictions.

## Usage

### Recording a Route

1. Click the "Record" tab
2. Enter a route name (optional)
3. Click "Start Recording"
4. Move along your desired route
5. Click "Stop Recording" when done
6. Click "Save Route" to store it

### Viewing Saved Routes

1. Click the "Saved Routes" tab
2. Browse your saved routes
3. Click "View" to display a route on the map
4. Click "Delete" to remove a route

### Navigating a Route

1. Click the "Navigate" tab
2. Select a saved route from the dropdown
3. Click "Start Navigation"
4. Follow the audio instructions
5. The app will guide you along the route
6. Click "Stop Navigation" to end

## Browser Requirements

- Modern browser with Geolocation API support
- Location services enabled
- For best results, use on a mobile device with GPS

## Privacy

All route data is stored locally in your browser. No data is sent to external servers.

## Troubleshooting

**Location not working:**
- Ensure location services are enabled on your device
- Grant location permission when prompted by the browser
- For HTTPS sites, location access is more reliable

**Audio not working:**
- Check device volume
- Ensure browser has permission to play audio
- Some browsers require user interaction before playing audio

## Technologies Used

- HTML5 Geolocation API
- Leaflet.js for mapping
- Web Speech API for audio instructions
- LocalStorage for data persistence
- Progressive Web App (PWA) features

## License

Free to use and modify for personal and commercial projects.
