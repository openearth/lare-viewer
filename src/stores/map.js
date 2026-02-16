// stores/map.js
import { defineStore } from 'pinia'
import layersConfig from '@/data/base-layers-config.json'
import buildMapboxLayer from '@/lib/build-mapbox-layer'

export const useMapStore = defineStore('map', {
  state: () => ({
    layersConfig,
    mapboxLayers: [],
    layerVisibility: {},
    layerClickable: {},
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
  },
})
