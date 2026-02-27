import { defineStore } from 'pinia'
import layersConfig from '@/data/base-layers-config.json'
import buildMapboxLayer from '@/lib/build-mapbox-layer'

export const useMapStore = defineStore('map', {
  state: () => ({
    layersConfig,
    mapboxLayers: [],
    layerVisibility: {},
    layerClickable: {},
    activeRegion: null,
  }),
  
  getters: {
    visibleMapboxLayers: (state) => {
      const visible = []
      for (const layer of state.mapboxLayers) {
        if (state.layerVisibility[layer.id] === true) {
          visible.push(layer)
        } else if (layer.id.endsWith('_raster')) {
          // Raster layers with '_raster' suffix are shown when their base ID is visible
          const baseId = layer.id.replace('_raster', '')
          if (state.layerVisibility[baseId] === true) {
            visible.push(layer)
          }
        }
      }
      return visible
    },
    
    isLayerClickable: (state) => (layerId) => {
      return state.layerClickable[layerId] ?? false
    },
    
    visibleLayersWithConfig: (state) => {
      const visible = []
      const seenIds = new Set()
      
      for (const layerId in state.layerVisibility) {
        if (state.layerVisibility[layerId] === true) {
          // Skip raster layers with _raster suffix (only show base layer legends)
          if (layerId.endsWith('_raster')) {
            continue
          }
          
          // Avoid duplicates
          if (seenIds.has(layerId)) {
            continue
          }
          seenIds.add(layerId)
          
          const layerConfig = state.layersConfig.find(config => config.id === layerId)
          if (layerConfig && layerConfig.url && layerConfig.layer) {
            visible.push({
              id: layerId,
              url: layerConfig.url,
              layer: layerConfig.layer,
              name: layerConfig.name,
            })
          }
        }
      }
      
      return visible
    },
  },
  
  actions: {
    initializeMapboxLayers () {
      const configMap = new Map()
      for (const layerConfig of this.layersConfig) {
        if (!configMap.has(layerConfig.id)) {
          configMap.set(layerConfig.id, [])
        }
        configMap.get(layerConfig.id).push(layerConfig)
      }
      
      const builtLayers = []
      for (const [ , configs ] of configMap.entries()) {
        if (configs.length > 1) {
          // Duplicate IDs: build both raster (visible) and vector (clickable) layers
          const rasterConfig = configs.find(c => c.format !== 'application/vnd.mapbox-vector-tile')
          const vectorConfig = configs.find(c => c.format === 'application/vnd.mapbox-vector-tile')
          
          if (rasterConfig) {
            const rasterLayer = buildMapboxLayer(rasterConfig)
            if (rasterLayer) {
              rasterLayer.id = `${ rasterConfig.id }_raster`
              builtLayers.push(rasterLayer)
            }
          }
          
          if (vectorConfig) {
            const vectorLayer = buildMapboxLayer(vectorConfig)
            if (vectorLayer) {
              builtLayers.push(vectorLayer)
            }
          }
        } else {
          const layer = buildMapboxLayer(configs[0])
          if (layer) {
            builtLayers.push(layer)
          }
        }
      }
      
      this.mapboxLayers = builtLayers
    },
    
    initializeLayerVisibility (layers) {
      for (const layer of layers) {
        if (this.layerVisibility[layer.id] === undefined) {
          this.layerVisibility[layer.id] = layer.active ?? false
        }
      }
    },
    
    initializeLayerClickable (layers) {
      for (const layer of layers) {
        if (this.layerClickable[layer.id] === undefined) {
          this.layerClickable[layer.id] = layer.clickable ?? false
        }
      }
    },
    
    setLayerVisibility (layerId, isVisible) {
      this.layerVisibility[layerId] = isVisible
    },
    
    setActiveRegion (layerId, feature) {
      this.activeRegion = {
        layerId: layerId,
        properties: feature.properties || {},
        feature: feature,
      }
    },
    
    clearActiveRegion () {
      this.activeRegion = null
    },

    addDynamicLayer (layerConfig) {
      const existing = this.mapboxLayers.find(l => l.id === layerConfig.id)
      if (existing) return

      const built = buildMapboxLayer({
        ...layerConfig,
        format: 'image/png',
      })
      if (built) {
        this.mapboxLayers.push(built)
        this.layerVisibility[layerConfig.id] = true
      }
    },

    removeDynamicLayer (layerId) {
      this.mapboxLayers = this.mapboxLayers.filter(l => l.id !== layerId)
      delete this.layerVisibility[layerId]
    },
  },
})
