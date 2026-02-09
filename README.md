# LARE Viewer

Landscape Archetype Classification and the Landscape Resilience Explorer (**LARE**) and is inteded to be an operational framework for spatial risk analysis and Nature-based Solutions planning.
It is a modern web-based map viewer application built with Vue 3, Vuetify, and Mapbox GL. This application provides an interactive mapping interface for viewing and interacting with geographic data and map services. 
The Viewer is seperated from the backend that provides interaction with spatial data served as OGC data service. The interaction is setup with PyWPS processes. For more information on backend, please check https://github.com/openearth/lare. 


## Features

- 🗺️ **Interactive Map Viewing**: Powered by Mapbox GL for smooth, interactive map experiences
- 🌐 **OGC Services Support**: Full support for OGC (Open Geospatial Consortium) services - layers on the map and background processes are all OGC services
- 🎨 **Modern UI**: Built with Vuetify 3 for a beautiful, responsive user interface
- ⚡ **Fast Development**: Leverages Vite for instant hot module replacement and fast builds
- 🗃️ **State Management**: Uses Pinia for efficient state management
- 🚦 **Routing**: Vue Router for seamless navigation

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** package manager
- **Mapbox Access Token** - Get one for free at [mapbox.com](https://account.mapbox.com/)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd lare-viewer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and add your Mapbox access token:

```env
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
```

Replace `your_mapbox_access_token_here` with your actual Mapbox access token.

> **Note**: If you don't have a `.env` file, create one. The application requires this environment variable to display maps.

### 4. Verify installation

After installation, your environment should be ready for development.

## Running the Application

### Development Mode

Start the development server 
```bash
npm run dev
```

The development server will start and be accessible at [http://localhost:3000](http://localhost:3000) 

The application will automatically reload when you make changes to the source files.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

### Linting

To lint and automatically fix code issues:

```bash
npm run lint
```

## OGC Services Architecture

The application is built with OGC (Open Geospatial Consortium) services as its foundation. The architecture follows OGC standards:

- **Map Layers**: All layers displayed on the map are OGC services (WMS, WMTS, WFS, etc.)
- **Background Processes**: All background processing operations utilize OGC Web Processing Service (WPS) standards

This architecture ensures interoperability with standard geospatial services and enables seamless integration with various OGC-compliant data sources and processing services.

## Deployment

The application is served on Netlify. You can find everything on the [live site]().

## Project Structure

```
lare-viewer/
├── src/
│   ├── components/     # Vue components
│   ├── lib/           # Utility libraries and helpers
│   ├── plugins/       # Vue plugins configuration
│   ├── router/        # Vue Router configuration
│   ├── stores/        # Pinia stores
│   ├── styles/        # Global styles
│   └── views/         # Page views
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```


## License

MIT

Copyright (c) 2025
