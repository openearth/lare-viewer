/**
 * Processes response data according to output action definitions
 * from workflow.json.
 *
 * Supported actions:
 *   - storeValue: saves a value (or sub-path of response) into appStore.processResults
 *   - addLayer:   adds a dynamic layer to the map via mapStore
 *
 * @param {Array<OutputAction>} actions - Output action definitions from config
 * @param {Object} response - The parsed process response
 * @param {Object} stores - { app: appStore, map: mapStore }
 *
 * @typedef {Object} OutputAction
 * @property {'storeValue'|'addLayer'} action
 * @property {string} [path]        - Dot-notated path into the response (omit or "response" for full response)
 * @property {string} [storeAs]     - For storeValue: key under processResults to store into
 * @property {Object} [layerConfig] - For addLayer: layer configuration
 */
export function handleOutputActions (actions, response, stores) {
  if (!actions?.length || !response) return

  for (const action of actions) {
    const value = resolvePath(response, action.path)

    switch (action.action) {
      case 'storeValue':
        if (action.storeAs && stores.app) {
          setNestedValue(stores.app.processResults, action.storeAs, value)
        }
        break

      case 'addLayer': {
        if (!value || !stores.map?.addDynamicLayer) break
        const folders = Array.isArray(value) ? value : [value]
        for (const folder of folders) {
          const entries = folder?.contents ?? [folder]
          for (const entry of entries) {
            if (entry?.layer && entry?.url) {
              stores.map.addDynamicLayer({
                id: entry.layer,
                name: entry.name || entry.layer,
                layer: entry.layer,
                url: entry.url,
                ...(action.layerConfig || {}),
              })
            }
          }
        }
        break
      }

      default:
        console.warn(`[handleOutputActions] Unknown action: "${ action.action }"`)
    }
  }
}

function resolvePath (obj, path) {
  if (!path || path === 'response') return obj

  const cleanPath = path.startsWith('response.') ? path.slice(9) : path
  return cleanPath.split('.').reduce((o, key) => o?.[key], obj)
}

function setNestedValue (obj, path, value) {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] == null) {
      current[parts[i]] = {}
    }
    current = current[parts[i]]
  }

  current[parts[parts.length - 1]] = value
}
