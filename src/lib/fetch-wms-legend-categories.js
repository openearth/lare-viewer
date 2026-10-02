import {
  buildLegendJsonUrl,
  LEGEND_SOURCE_GET_LEGEND_GRAPHIC_JSON,
} from './build-legend-url'

const DEFAULT_NODATA_LABEL_PATTERN = /nodata/i

function extractSymbolizerColor (symbolizer) {
  if (!symbolizer || symbolizer.Text) return null

  const polygon = symbolizer.Polygon
  if (polygon?.fill) return String(polygon.fill)

  const line = symbolizer.Line
  if (line?.stroke) return String(line.stroke)

  const point = symbolizer.Point
  if (point?.fill) return String(point.fill)
  const graphics = point?.graphics
  if (Array.isArray(graphics) && graphics[0]?.fill) {
    return String(graphics[0].fill)
  }

  return null
}

function parseRuleSymbolizerEntry (rule) {
  const symbolizers = Array.isArray(rule?.symbolizers) ? rule.symbolizers : []
  const label = rule?.title || rule?.name || rule?.filter || ''
  if (!label) return null

  for (const symbolizer of symbolizers) {
    const color = extractSymbolizerColor(symbolizer)
    if (!color) continue
    const value = rule?.name || rule?.title || String(label)
    return {
      value,
      label: String(label),
      color,
    }
  }
  return null
}

/**
 * Walk GeoServer GetLegendGraphic JSON (Raster colormaps and vector rules).
 */
export function parseGetLegendGraphicJson (data) {
  const entries = []
  const legends = Array.isArray(data?.Legend) ? data.Legend : []

  for (const legend of legends) {
    const rules = Array.isArray(legend?.rules) ? legend.rules : []
    for (const rule of rules) {
      const symbolizers = Array.isArray(rule?.symbolizers) ? rule.symbolizers : []
      let addedRaster = false
      for (const symbolizer of symbolizers) {
        const colormapEntries = symbolizer?.Raster?.colormap?.entries
        if (!Array.isArray(colormapEntries)) continue
        for (const entry of colormapEntries) {
          const label = entry?.label != null ? String(entry.label) : ''
          const color = entry?.color != null ? String(entry.color) : '#9e9e9e'
          const quantity = entry?.quantity != null ? String(entry.quantity) : label
          if (!label && !quantity) continue
          entries.push({
            value: quantity || label,
            label: label || quantity,
            color,
          })
          addedRaster = true
        }
      }
      if (!addedRaster) {
        const ruleEntry = parseRuleSymbolizerEntry(rule)
        if (ruleEntry) entries.push(ruleEntry)
      }
    }
  }

  return entries
}

export function isNoDataLegendEntry (entry, pattern = DEFAULT_NODATA_LABEL_PATTERN) {
  const label = entry?.label != null ? String(entry.label) : ''
  return pattern.test(label)
}

export function filterLegendCategoryEntries (entries, {
  hideNoData = false,
  noDataLabelPattern = DEFAULT_NODATA_LABEL_PATTERN,
} = {}) {
  if (!hideNoData) return entries
  const pattern = noDataLabelPattern instanceof RegExp
    ? noDataLabelPattern
    : new RegExp(String(noDataLabelPattern), 'i')
  return entries.filter(entry => !isNoDataLegendEntry(entry, pattern))
}

/**
 * Fetch and normalise WMS JSON legend classes for HTML category rows.
 * Opt-in via layer config: legendMode "categories" + legendSource "getLegendGraphicJson".
 */
export async function fetchWmsLegendCategories (layerConfig, {
  hideNoData = false,
  noDataLabelPattern = DEFAULT_NODATA_LABEL_PATTERN,
  fetchImpl = fetch,
} = {}) {
  const url = buildLegendJsonUrl(layerConfig)
  if (!url) {
    throw new Error('Missing WMS url/layer for GetLegendGraphic JSON')
  }

  const response = await fetchImpl(url)
  if (!response.ok) {
    throw new Error(`HTTP ${ response.status }`)
  }

  const data = await response.json()
  const entries = filterLegendCategoryEntries(
    parseGetLegendGraphicJson(data),
    { hideNoData, noDataLabelPattern },
  )
  if (entries.length === 0) {
    throw new Error('GetLegendGraphic JSON returned no legend classes')
  }

  const colorByValue = {}
  const options = []
  const values = []

  for (const entry of entries) {
    values.push(entry.value)
    options.push({
      value: entry.value,
      label: entry.label,
    })
    colorByValue[entry.value] = entry.color
  }

  return {
    loaded: true,
    source: LEGEND_SOURCE_GET_LEGEND_GRAPHIC_JSON,
    values,
    options,
    groups: [],
    hierarchical: false,
    colorByValue,
  }
}
