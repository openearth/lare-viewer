/**
 * Resolves a WPS input value from a source string.
 *
 * Source format: "type:path"
 *   - store:<storeName>.<path>    → reads from a Pinia store
 *   - payload:<path>              → reads from the step-complete event payload
 *   - wpsResult:<path>            → reads from stored WPS results (appStore.wpsResults)
 *   - static:<value>              → returns the literal string value
 *
 * @param {string} source - Source descriptor (e.g. "store:map.activeRegion.properties.NUTS_ID")
 * @param {Object} context
 * @param {Object} context.payload - The step-complete event payload
 * @param {Object} context.stores  - Map of store name → Pinia store instance
 * @returns {*} The resolved value, or undefined if not found
 */
export function resolveInputValue (source, context) {
  const colonIndex = source.indexOf(':')
  if (colonIndex === -1) return undefined

  const type = source.substring(0, colonIndex)
  const path = source.substring(colonIndex + 1)

  switch (type) {
    case 'store': {
      const [storeName, ...pathParts] = path.split('.')
      const store = context.stores?.[storeName]
      if (!store) return undefined
      return getNestedValue(store, pathParts)
    }

    case 'payload':
      return getNestedValue(context.payload, path.split('.'))

    case 'wpsResult': {
      const wpsResults = context.stores?.app?.wpsResults
      if (!wpsResults) return undefined
      return getNestedValue(wpsResults, path.split('.'))
    }

    case 'static':
      return path

    default:
      console.warn(`[resolveInputValue] Unknown source type: "${ type }"`)
      return undefined
  }
}

/**
 * Resolves all inputs for a WPS call by combining the source map from
 * navigation config with the type information from DescribeProcess.
 *
 * @param {Object} inputSourceMap - { wpsInputId: "source:path", ... } from navigation.json
 * @param {Array} processInputs  - Input definitions from describeProcess()
 * @param {Object} context        - { payload, stores }
 * @returns {Array} Ready-to-use inputs for sendWpsRequest
 */
export function resolveAllInputs (inputSourceMap, processInputs, context) {
  return processInputs
    .map(inputDef => {
      const source = inputSourceMap[inputDef.id]
      if (!source) return null

      const value = resolveInputValue(source, context)
      if (value === undefined || value === null) return null

      return {
        id: inputDef.id,
        type: inputDef.type,
        value,
        mimeType: inputDef.mimeType,
      }
    })
    .filter(Boolean)
}

function getNestedValue (obj, pathParts) {
  let current = obj
  for (const key of pathParts) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}
