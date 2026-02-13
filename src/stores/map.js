// stores/map.js
import { defineStore } from 'pinia'
import layersConfig from '@/data/base-layers-config.json'
import buildMapboxLayer from '@/lib/build-mapbox-layer'

export const useMapStore = defineStore('map', {
  state: () => ({
    layersConfig,
    mapboxLayers: [],
    layerVisibility: {},
  }),
  
  getters: {
    visibleMapboxLayers: (state) => {
      return state.mapboxLayers.filter(layer => state.layerVisibility[layer.id] === true)
    },
  },
  
  actions: {
    initializeMapboxLayers () {
      this.mapboxLayers = this.layersConfig
        .map(layerConfig => buildMapboxLayer(layerConfig))
        .filter(layer => layer != null)
    },
    
    initializeLayerVisibility (layers) {
      for (const layer of layers) {
        if (this.layerVisibility[layer.id] === undefined) {
          this.layerVisibility[layer.id] = layer.active ?? false
        }
      }
    },
    
    setLayerVisibility (layerId, isVisible) {
      this.layerVisibility[layerId] = isVisible
    },
  },
})
