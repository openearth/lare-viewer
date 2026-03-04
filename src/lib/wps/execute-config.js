import sendWpsRequest from '@/lib/wps'
import { resolveInputs } from '@/lib/wps/resolve-input'
import { handleOutputActions } from '@/lib/wps/handle-output'

/**
 * Execute a WPS request from a workflow config (workflow.json wps object).
 *
 * @param {Object} wpsConfig - WPS config from workflow (identifier, inputs, storeResultAs, outputActions)
 * @param {Object} context
 * @param {Object} [context.payload={}] - Payload for resolving inputs (e.g. from step completion)
 * @param {Object} context.appStore - Pinia app store
 * @param {Object} context.mapStore - Pinia map store
 * @returns {Promise<Object>} The parsed WPS response
 */
export async function executeWpsConfig (wpsConfig, { payload = {}, appStore, mapStore }) {
  const baseUrl = import.meta.env.VITE_WPS_BASE_URL
  const { identifier, outputActions, storeResultAs } = wpsConfig
  const stores = { app: appStore, map: mapStore }
  const context = { payload, stores }

  const inputs = resolveInputs(wpsConfig.inputs ?? [], context)
  const result = await sendWpsRequest({
    baseUrl,
    identifier,
    inputs,
  })

  if (storeResultAs) {
    appStore.setWpsResult(storeResultAs, result)
  }
  if (outputActions?.length) {
    handleOutputActions(outputActions, result, stores)
  }

  return result
}
