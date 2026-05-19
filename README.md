# LARE Viewer

A **Vue 3** web application for **Landscape Archetype Regionalization (LARE)** workflows. It combines an **interactive Mapbox GL map** with a **step-by-step sidebar** so users can pick a use case, select a region, run analyses, and explore GeoServer layers.

The app is **driven by configuration**: most behaviour (steps, layers, which process runs when) lives in JSON files rather than hard-coded UI logic. That makes it easier to adapt the same codebase to new workflows or regions.

---

## Features

- 🗺️ **Interactive Map Viewing**: Powered by Mapbox GL for smooth, interactive map experiences
- 🌐 **OGC Services Support**: Full support for OGC (Open Geospatial Consortium) services - layers on the map and background processes are all OGC services
- 🎨 **Modern UI**: Built with Vuetify 3 for a beautiful, responsive user interface
- ⚡ **Fast Development**: Leverages Vite for instant hot module replacement and fast builds
- 🗃️ **State Management**: Uses Pinia for efficient state management
- 🚦 **Routing**: Vue Router for seamless navigation

---

## What you get (at a glance)

| Piece | Role |
|--------|------|
| **`workflow.json`** | Defines menu steps, components per step, confirmations, and OGC API Process calls |
| **`base-layers-config.json`** | Default map layers, legends, and styling |
| **Pinia stores** (`app`, `map`) | UI state, selections, process results, dynamic WMS layers |
| **`ogc-process`** | Builds JSON execute requests to your OGC API Processes server (e.g. pygeoapi) |
| **Vue components** | `SubMenu`, `SelectionList`, `LayerList`, `NumberInput`, map, etc. |

---

## Prerequisites

- **Node.js** 18+ (20+ recommended) and **npm**
- A **Mapbox access token** ([Mapbox account](https://account.mapbox.com/))
- A running **OGC API Processes** backend that exposes the processes your `workflow.json` references (for example [LARE](https://github.com/DesirMED/LARE) with pygeoapi)
- **GeoServer** (or compatible OGC Services) if you use the default layer URLs

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/DesirMED/lare-viewer.git
cd lare-viewer
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (same folder as `package.json`). Vite only exposes variables that start with `VITE_`.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MAPBOX_TOKEN` | **Yes** | Mapbox public access token |
| `VITE_OGC_API_URL` | Recommended | Base URL of the OGC API (no trailing slash), e.g. `http://localhost:5000` |
| `VITE_WPS_BASE_URL` | Fallback | Used only if `VITE_OGC_API_URL` is not set; same semantics as the OGC API base URL |
| `VITE_GEOSERVER_PUBLIC_BASE_URL` | Optional | **Browser-reachable** GeoServer base URL. Use this when the app runs in the browser but GeoServer is only reachable via a different host than in `base-layers-config.json` (e.g. Docker: config may use `http://geoserver:8080/geoserver`, while the browser needs `http://localhost:8080/geoserver`) |

Example `.env`:

```env
VITE_MAPBOX_TOKEN=pk.ey...
VITE_OGC_API_URL=http://localhost:5000
# If GeoServer in JSON is internal-only, point the browser here:
# VITE_GEOSERVER_PUBLIC_BASE_URL=http://localhost:8080/geoserver
```

### 3. Run the dev server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:3000`).

### 4. Production build

```bash
npm run build
```

Output is in `dist/`. Preview locally:

```bash
npm run preview
```

### 5. Lint

```bash
npm run lint
```

---

## How the app is structured

High-level flow:

1. **`App.vue`** loads `workflow.json`. If `initialSetup.process` has `trigger: "onStart"`, it runs that process once (e.g. `lare-start`) and stores the result under `storeResultAs`.
2. **`NavigationDrawer.vue`** renders one **`SubMenu`** per step from `workflow.json`.
3. **`SubMenu.vue`** shows the step title, optional explanation, dynamic components (`SelectionList`, `LayerList`, `NumberInput`, …), and a **Continue** / **Confirm** flow depending on `requiresConfirmation` and `confirmationSource`.
4. **`MapView.vue`** hosts the Mapbox map; the **map store** adds WMS raster/vector layers and tracks the clicked region for map-based steps.
5. When a **`process`** block runs, **`executeProcessConfig`** (`src/lib/ogc-process/execute-config.js`) resolves inputs, POSTs to `/processes/{identifier}/execution?f=json`, then optionally saves results and applies **`outputActions`** (e.g. add a WMS layer).

### Important directories

```
src/
├── config/
│   ├── workflow.json          # Steps, components, processes (main product config)
│   └── base-layers-config.json
├── components/                 # UI: drawer, submenus, lists, map, legend…
├── stores/
│   ├── app.js                 # Steps, selections, process results, menu state
│   └── map.js                 # Map instance, layers, region selection, per-step click rules
├── lib/
│   └── ogc-process/           # Execute OGC API Processes from workflow config
├── views/
│   └── MapView.vue
└── App.vue
```

---

## Configuring a workflow (`workflow.json`)

Think of **`workflow.json` as the product definition**: you can add steps, change labels, wire new processes, and toggle map layers without rewriting the shell of the app.

### Top level

| Field | Purpose |
|--------|---------|
| `logo` | Path under `public/` for the header logo |
| `initialSetup` | Optional; often used to run a bootstrap process on load |
| `steps` | Ordered list of wizard steps shown in the navigation drawer |

### Minimal skeleton (empty steps)

Use this as a **starting file** when you are wiring a new deployment from scratch. It is valid JSON and loads in the app; you then add entries under `steps` (and optional `initialSetup.process`) as needed.

```json
{
  "logo": "/desirmed_logo.png",
  "initialSetup": {},
  "steps": []
}
```

- **`steps: []`** — The side drawer shows no wizard items, and **`App.vue` does not auto-open a submenu** (there is no first step). That is fine for smoke-testing the shell; for a real workflow, add at least one step object.
- **`initialSetup: {}`** — Optional. Omit it entirely if you prefer, or replace it with `restartButton` / `process` when you are ready (see the next section).

### `initialSetup`

Used in **`App.vue`** when `initialSetup.process.trigger` is `"onStart"`. Typical pattern: call **`lare-start`** (or your equivalent), store the JSON response (e.g. session id) for later process inputs.

Example:

```json
"initialSetup": {
  "restartButton": true,
  "process": {
    "identifier": "lare-start",
    "trigger": "onStart",
    "inputs": [],
    "storeResultAs": "initialSetup"
  }
}
```

- **`restartButton`**: when `true`, the drawer can show a control to reset workflow/map state and return to the first step (see `NavigationDrawer.vue`).

### Each step

Common fields:

| Field | Meaning |
|--------|---------|
| `id` | Stable id (used for routing, store keys, `requiredSteps`) |
| `title` | Short label in the drawer |
| `drawerTitle` | Longer heading inside the open submenu |
| `icon` | Optional Vuetify MDI icon name |
| `explanation` | Help text above the controls |
| `requiredSteps` | Step ids that must be completed before this step is available |
| `disabledOnContinue` | If true, user must use **Confirm** (not only **Continue**) to advance when confirmation is required |
| `confirmFlashWhenEnabled` | Subtle highlight on the confirm area when the step is ready to confirm |
| `explanationFlashWhenAvailable` | When true, the explanation text can pulse to draw attention while it is relevant |
| `requiresConfirmation` | If true, advancing waits for explicit confirmation |
| `confirmationSource` | How readiness is determined: see below |
| `requiredSelections` | For `component` confirmation: **all** listed selection keys must have a value before confirm is enabled |
| `completionEvent` | If `"auto"`, the step marks itself complete when its submenu opens (see `SubMenu.vue`) |
| `components` | List of `{ "component": "...", "componentProps": { ... } }` |
| `process` | Optional OGC process; **when** it runs is controlled by `process.trigger` |

### `confirmationSource`

| Value | Behaviour |
|--------|-----------|
| `"component"` | Child components emit completion; **`requiredSelections`** can require multiple dropdowns (e.g. archetype + numeric input) before confirm |
| `"mapClick"` | User must click a feature on the map; region info is stored and confirm enables when the click target is valid |
| `"process"` | A process runs (e.g. calculator); confirm may depend on process success |

### OGC process block (`process`)

Runs against **`VITE_OGC_API_URL`** (or **`VITE_WPS_BASE_URL`**). Example aligned with the default UOM step:

```json
"process": {
  "identifier": "lare-uom",
  "trigger": "component",
  "inputs": [
    { "id": "session_id", "source": "store:app.processResults.initialSetup.session_id" },
    { "id": "uom_size", "source": "payload:value" },
    { "id": "layer_name", "source": "store:app.selections.userCaseSelection.layerNameForProcess" },
    { "id": "id", "source": "store:map.activeRegionId" },
    { "id": "archetype", "source": "store:app.selections.uomArchetype" }
  ],
  "storeResultAs": "uom",
  "outputActions": [
    {
      "action": "addLayer",
      "path": "response"
    }
  ]
}
```

- **`identifier`**: process id on the server (pygeoapi `/processes/{id}`).
- **`trigger`** — where execution is hooked (see `SubMenu.vue` and `App.vue`):

  | Trigger | When it runs |
  |--------|----------------|
  | `onStart` | Once when the app mounts (`App.vue`), and again after **Restart** if configured |
  | `component` | When a child fires `run-process` (e.g. **Calculate** on `NumberInput`). For `confirmationSource: "process"`, **Confirm** stays disabled until this run succeeds and returns a `result`. |
  | `stepOpen` | When the step’s submenu opens |
  | `mapClick` | When `mapStore.activeRegion` is set while the step is open |
  | `stepComplete` | When the step completes without a process/map/process confirm path (payload from children) |

- **`inputs`**: each `source` is resolved by `resolve-input.js`:
  - `store:app...` / `store:map...` — Pinia store paths
  - `payload:...` — payload from the child `step-complete` / calculator (e.g. `value`, `archetype`)
  - `processResult:...` — nested under `appStore.processResults`
  - `static:value` — literal string after the first `:`
- **`storeResultAs`**: saves the parsed execute response on the app store for later steps.
- **`outputActions`**: handled in `handle-output.js`. Supported `action` values include **`storeValue`**, **`addLayer`** (reads layer entries from the response; expects objects with `layer` and `url`), and **`removeLayer`**.

Process IDs and input names must match your **backend** (see [LARE](https://github.com/DesirMED/LARE)).

### Components you can reference in `workflow.json`

| Component name | Typical use |
|----------------|-------------|
| `SelectionList` | Dropdown(s) with optional map layers per option; supports `condition`, `flashWhenEnabled`, `disabledUntilCondition` |
| `LayerList` | Toggle WMS layers; `conditionSource` can show different layers per use case; `flashWhenEnabled` on a layer ties into feature properties hint |
| `NumberInput` | Numeric field; can gate confirm until valid |
| `ActiveFeatureProperties` | Usually embedded via `LayerList` / map context to show clicked feature attributes |

Behaviour is implemented in the matching `.vue` files under `src/components/`. Steps reference components by **file name without `.vue`**; `SubMenu` loads them with `import.meta.glob('@/components/*.vue')`, so new wizard blocks are usually **new JSON + optional new component**, not router changes.

---

## Map and GeoServer layers (`base-layers-config.json`)

Defines **default layers** (URLs, types, opacity, legends). Workflow `LayerList` entries reference **layer ids** that should exist in this config (or match how your store builds layer names).

If the browser cannot reach the same hostnames as the backend, set **`VITE_GEOSERVER_PUBLIC_BASE_URL`** so WMS requests use a public base URL while keeping internal URLs in JSON for server-side tools.

---

## Backend integration (OGC API Processes)

The client sends **JSON** execute requests (not XML WPS). Ensure your server exposes processes compatible with the **`identifier`** and **`inputs`** in `workflow.json`.

- Default request path pattern: `{baseUrl}/processes/{identifier}/execution?f=json`
- Implementation: `src/lib/ogc-process/index.js` and `execute-config.js`

---

## Deployment notes

- Set **`VITE_*`** variables in your hosting environment at **build time** (they are baked into the Vite bundle).
- Use **`VITE_GEOSERVER_PUBLIC_BASE_URL`** (or HTTPS GeoServer URLs in config) so end users’ browsers can load WMS tiles.
- Serve the SPA with fallback to `index.html` for client-side routes (`/map`, etc.).

---

## Troubleshooting

| Issue | Things to check |
|--------|------------------|
| Map is blank | `VITE_MAPBOX_TOKEN`; browser console for Mapbox errors |
| Processes fail immediately | `VITE_OGC_API_URL` / server reachable from **your machine**; process id spelling; CORS on the API |
| Layers do not load | GeoServer URL reachable from the **browser**; `VITE_GEOSERVER_PUBLIC_BASE_URL`; layer workspace/name matches GeoServer |
| Confirm stays disabled | `requiredSelections`, `confirmationSource`, and whether a prior step stored `processResult` / map region as expected |

---

## Contributing

Issues and pull requests are welcome. Run **`npm run lint`** before submitting changes.

---

## Acknowledgments

- [Vue.js](https://vuejs.org/), [Vite](https://vitejs.dev/), [Vuetify](https://vuetifyjs.com/), [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Studio Meta](https://github.com/studiometa) for [`@studiometa/vue-mapbox-gl`](https://github.com/studiometa/vue-mapbox-gl), used for Vue 3 + Mapbox GL integration
- [LARE](https://github.com/DesirMED/LARE) — backend / pygeoapi processes
