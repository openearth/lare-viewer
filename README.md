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

## Configuring `workflow.json`

The workflow and process requests are configurable from the JSON file at `src/config/workflow.json`.

### Overall structure

```json
{
  "logo": "/desirmed_logo.png",
  "steps": [
    {
      "id": "regionSelection",
      "title": "Region Selection",
      "drawerTitle": "Select a base map",
      "icon": "mdi-map-marker-radius",
      "requiredSteps": [],
      "completionEvent": null,
      "components": [ /* UI configuration */ ],
      "process": { /* optional process configuration */ }
    }
  ]
}
```

- **`logo`**: Path (relative to `public/`) to the logo shown at the top of the main navigation drawer.
- **`steps`**: Ordered list of workflow steps. Each step:
  - **`id`**: Unique identifier used internally (e.g. for dependencies and process results).
  - **`title`**: Label shown in the main navigation drawer.
  - **`drawerTitle`**: Title shown at the top of the step drawer.
  - **`icon`**: Vuetify Material Design Icon name (e.g. `mdi-map-marker-radius`).
  - **`requiredSteps`** (optional): Array of step `id`s that must be completed before this step is enabled.
  - **`completionEvent`** (optional): How the step is marked complete. `null` (default) means completion is driven by child components; `"auto"` means the step completes as soon as its drawer opens.
  - **`components`**: List of UI components rendered inside the step drawer.
  - **`process`** (optional): Configuration for an OGC API process execution associated with this step (see below).

### Components inside a step

Each entry in `components` has the shape:

```json
{
  "component": "LayerList",
  "componentProps": {
    "layers": [
      {
        "id": "layer-id",
        "name": "Human readable name",
        "active": true,
        "clickable": true,
        "propertiesBox": "region"
      }
    ]
  }
}
```

- **`component`**: Name of a Vue component in `src/components` (without `.vue`), e.g. `LayerList`, `SelectionList`, `NumberInput`.
- **`componentProps`**: Arbitrary props passed straight through to the component.

Different components expect different props:

- **`LayerList`**:
  - **`layers`**: Array of layer configs with:
    - `id`: Map layer identifier.
    - `name`: Display name in the UI.
    - `active`: Whether the layer is initially visible.
    - `clickable`: Whether clicking the map interacts with this layer.
    - `propertiesBox` (optional): Name of a properties box configuration (used for showing feature attributes).
  - **`conditionSource`** (optional): Name of a selection key to use when conditionally enabling layers (see “Use case selection and `selectionKey`” below).
- **`SelectionList`**:
  - **`label`**: Label shown above the list.
  - **`options`**: Array of `{ "id": "value", "name": "Label" }` entries.
  - **`selectionKey`** (optional): Name under which the selected value is stored in the app store (`app.selections[selectionKey]`). If omitted, the value is only passed via the `step-complete` payload.
- **`NumberInput`**:
  - Typical props include `label`, `suffix`, `min`, `max`, `step`, `defaultValue`, and `defaultValueSource` (see below under process input sources).

### Use case selection and `selectionKey`

In more advanced workflows, you can introduce an explicit “use case” selection step and use its stored value to drive which layers are shown later.

Example:

```json
{
  "id": "userCaseSelection",
  "title": "Use Case",
  "drawerTitle": "Select your use case",
  "components": [
    {
      "component": "SelectionList",
      "componentProps": {
        "label": "Use cases",
        "selectionKey": "userCaseSelection",
        "options": [
          { "id": "administration", "name": "Administration" },
          { "id": "hydrobasin", "name": "Hydro basin" }
        ]
      }
    }
  ]
}
```

With this configuration:

- **`SelectionList`**:
  - Stores the chosen option under `app.selections.userCaseSelection` using `selectionKey`.
  - Emits `step-complete` with a payload `{ "value": "<selected id>" }`, which can be used by process inputs via `source: "payload:value"`.

You can then make a later step conditionally show layers depending on this value by combining `conditionSource` and per-layer `condition` values:

```json
{
  "id": "regionSelection",
  "title": "Region Selection",
  "requiredSteps": ["userCaseSelection"],
  "components": [
    {
      "component": "LayerList",
      "componentProps": {
        "conditionSource": "userCaseSelection",
        "layers": [
          {
            "id": "region:nuts_2021_level_3",
            "name": "NUTS 3 Regions",
            "active": true,
            "clickable": true,
            "propertiesBox": "region",
            "condition": "administration"
          },
          {
            "id": "topography:hybas_eu_lev12_v1c",
            "name": "Hydro Basins",
            "active": true,
            "clickable": true,
            "condition": "hydrobasin"
          }
        ]
      }
    }
  ]
}
```

- **`conditionSource`** tells `LayerList` to read from `app.selections.userCaseSelection`.
- Each layer’s **`condition`** is compared to that value. Only layers matching the current selection are considered active/visible in the workflow.

This pattern lets you implement a “step 0” use case selection (e.g. NUTS vs Hydrobasins) entirely through configuration, without changing application code.

### Wiring steps together with `requiredSteps`

Steps can depend on the completion of earlier steps. For example:

```json
{
  "id": "hazard",
  "title": "Hazard mitigation selection",
  "requiredSteps": ["regionSelection"],
  "components": [ /* ... */ ]
}
```

The `hazard` step becomes clickable only after the `regionSelection` step has been completed.

### Process configuration per step

Each step can optionally define a `process` object describing an OGC API process execution to run when the step is completed or when the user interacts with the map.

Example from `workflow.json`:

```json
{
  "id": "regionSelection",
  "title": "Region Selection",
  "drawerTitle": "Select a base map",
  "icon": "mdi-map-marker-radius",
  "components": [
    {
      "component": "LayerList",
      "componentProps": {
        "layers": [
          {
            "id": "landuse:U2018_CLC2018_V2020_20u1_cog",
            "name": "European Land Use Cover",
            "active": true,
            "clickable": false
          },
          {
            "id": "region:nuts_2021_level_3",
            "name": "NUTS 3 Regions",
            "active": true,
            "clickable": true,
            "propertiesBox": "region"
          }
        ]
      }
    }
  ],
  "process": {
    "identifier": "lare-hazard",
    "trigger": "mapClick",
    "inputs": [
      {
        "id": "name",
        "type": "LiteralData",
        "source": "store:map.activeRegion.properties.nuts_name"
      }
    ],
    "storeResultAs": "regionSelection"
  }
}
```

The process configuration supports the following fields:

- **`identifier`**: The pygeoapi process identifier as exposed by the backend (e.g. `"lare-start"`, `"lare-hazard"`, `"lare-uom"`). This value is used to call `/processes/{identifier}/execution?f=json`.
- **`trigger`**: When to execute the process call for this step:
  - `"onStart"`: Execute during app startup (used by `initialSetup.process`).
  - `"stepOpen"`: Execute when the step drawer is opened.
  - `"component"`: Execute when a child component emits `run-process` (e.g. calculator button in `NumberInput`).
  - `"mapClick"`: Execute whenever the user selects a region on the map (using `mapStore.activeRegion`) while this step is open.
  - `"stepComplete"`: Execute when the step signals completion (for example when the user picks an option or enters a number and the component emits a `step-complete` event).
- **`inputs`**: Array of process input definitions:
  - `id`: Input identifier expected by the backend process.
  - `source`: Where the value comes from, using the pattern `<sourceType>:<path>`.
- **`storeResultAs`** (optional): Key under which the full process response is stored in the app store (`app.processResults[storeResultAs]`).
- **`outputActions`** (optional): Array of post-processing instructions for the response (see below).

### Template for a new process step

Use this as a copy/paste starting point when adding a new step that calls an OGC API process:

```json
{
  "id": "myStep",
  "title": "My Step",
  "drawerTitle": "Run process",
  "requiredSteps": ["regionSelection"],
  "requiresConfirmation": true,
  "confirmationSource": "process",
  "process": {
    "identifier": "lare-my-process",
    "trigger": "component",
    "inputs": [
      { "id": "sessionid", "source": "store:app.processResults.initialSetup.sessionid" },
      { "id": "regionId", "source": "store:map.activeRegionId" },
      { "id": "valueFromUi", "source": "payload:value" },
      { "id": "constant", "source": "static:my-value" }
    ],
    "storeResultAs": "myStepResult",
    "outputActions": [
      { "action": "addLayer", "path": "response" }
    ]
  },
  "components": [
    {
      "component": "NumberInput",
      "componentProps": {
        "label": "Input value",
        "showCalcButton": true
      }
    }
  ]
}
```

The process execution requests are sent to the API root URL configured via the environment variable:

```env
VITE_OGC_API_URL=http://localhost:5000
```

### Process input `source` syntax

The `source` field describes where to read the value for a given process input. Supported forms:

- **`store:<storeName>.<path>`**:
  - Reads from a Pinia store by name, e.g. `"store:map.activeRegion.properties.nuts_name"`.
  - `storeName` is the key used in the process context (`app` or `map`).
- **`payload:<path>`**:
  - Reads from the payload passed by the component that completes the step.
  - Example: in the `hazard` step:
    ```json
    { "id": "hazard", "source": "payload:value" }
    ```
- **`processResult:<path>`**:
  - Reads from previously stored process results (`app.processResults`), allowing chaining between steps.
  - Example: in the `uom` step:
    ```json
    "defaultValueSource": "processResult:regionSelection.suggested_uom"
    ```
- **`static:<value>`**:
  - Use a literal constant value.

### Storing and reusing process results

When `storeResultAs` is set, the full parsed process response is stored under:

- `app.processResults[storeResultAs]`

You can then reference this data in later steps via `source: "processResult:..."` or via component props like `defaultValueSource` (for `NumberInput`).

Example:

```json
{
  "id": "uom",
  "title": "Calculate UOM",
  "requiredSteps": ["hazard"],
  "process": {
    "identifier": "lare-uom",
    "trigger": "stepComplete",
    "inputs": [
      { "id": "sessionid", "source": "store:app.processResults.initialSetup.sessionid" },
      { "id": "uomsize", "source": "payload:value" },
      { "id": "layername", "source": "store:app.selections.userCaseSelection.layerNameForProcess" },
      { "id": "id", "source": "store:map.activeRegionId" }
    ],
    "storeResultAs": "uom"
  },
  "components": [
    {
      "component": "NumberInput",
      "componentProps": {
        "label": "Hexagon size (in m²)",
        "suffix": "m²",
        "min": 100,
        "max": 50000000,
        "step": 100000,
        "defaultValue": 1000,
        "defaultValueSource": "processResult:regionSelection.suggested_uom"
      }
    }
  ]
}
```

### Post-processing with `outputActions`

For more advanced cases, you can define `outputActions` inside the `process` block to automatically store parts of the response or to add dynamic layers to the map.

Supported actions:

- **`storeValue`**: Store a (sub-)value into `app.processResults` under a nested key.
- **`addLayer`**: Add one or more dynamic layers to the map (via `mapStore.addDynamicLayer`).

Example:

```json
{
  "process": {
    "identifier": "lare_example",
    "trigger": "stepComplete",
    "inputs": [ /* ... */ ],
    "outputActions": [
      {
        "action": "storeValue",
        "path": "response.statistics",
        "storeAs": "example.statistics"
      },
      {
        "action": "addLayer",
        "path": "response"
      }
    ]
  }
}
```

- **`path`**:
  - Dot-notated path into the process response object.
  - If omitted or set to `"response"`, the entire response is used.
  - If it starts with `"response."`, that prefix is ignored (so `"response.layers"` and `"layers"` are equivalent).
- **`storeAs`** (for `storeValue`):
  - Dot-notated path where the value will be stored under `app.processResults`, e.g. `"example.statistics"`.
- **`layerConfig`** (optional, for `addLayer`):
  - Extra fields merged into each dynamic layer configuration (e.g. default opacity, visibility flags).

The structure expected by `addLayer` is:

- Either an array under the given `path`, or an object with a `contents` array.
- Each entry in `contents` (or the array itself) should contain:
  - `layer`: Layer identifier.
  - `url`: WMS/WFS/WMS-T endpoint for the layer.
  - `name` (optional): Human-readable name.

This matches the output format produced by the backend processes and is what the viewer uses to add layers dynamically.


## License

MIT

Copyright (c) 2025
