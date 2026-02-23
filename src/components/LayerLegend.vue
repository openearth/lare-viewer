<template>
  <div
    v-if="hasVisibleLayers"
    class="layer-legend-container"
  >
    <v-badge
      :content="visibleLayers.length"
      :model-value="true"
      color="primary"
      overlap
    >
      <v-btn
        class="legend-button"
        icon="mdi-map-legend"
        size="large"
        elevation="4"
        @click="toggleLegend"
      />
    </v-badge>

    <v-expand-transition>
      <v-card
        v-show="showLegend"
        class="legend-panel"
        elevation="4"
        rounded="xl"
        max-width="300"
      >
        <v-card-text class="legend-content">
          <div
            v-for="layer in visibleLayers"
            :key="layer.id"
            class="legend-item mb-3"
          >
            <div class="text-body-2 mb-1 font-weight-medium">
              {{ getLayerName(layer.id) }}
            </div>
            <img
              v-if="!failedImageIds.has(layer.id)"
              class="legend-image"
              :src="legendUrl(layer)"
              alt=""
              @error="onImageError(layer.id)"
            >
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useMapStore } from '@/stores/map'
  import buildLegendUrl from '@/lib/build-legend-url'
  import navigationConfig from '@/config/navigation.json'

  const mapStore = useMapStore()
  const failedImageIds = ref(new Set())
  const showLegend = ref(true)
  
  const visibleLayers = computed(() => mapStore.visibleLayersWithConfig)
  const hasVisibleLayers = computed(() => visibleLayers.value.length > 0)
  
  watch(hasVisibleLayers, (newValue) => {
    if (newValue) {
      showLegend.value = true
    }
  })

  function getLayerNameFromNavigation (layerId) {
    for (const menu of navigationConfig.menus) {
      if (menu.components) {
        for (const component of menu.components) {
          if (component.component === 'LayerList' && component.componentProps?.layers) {
            const layer = component.componentProps.layers.find(l => l.id === layerId)
            if (layer) {
              return layer.name
            }
          }
        }
      }
    }
    return null
  }

  function getLayerName (layerId) {
    const navName = getLayerNameFromNavigation(layerId)
    if (navName) {
      return navName
    }
    
    const layer = visibleLayers.value.find(l => l.id === layerId)
    return layer?.name || layerId
  }

  function legendUrl (layer) {
    return buildLegendUrl(layer)
  }

  function toggleLegend () {
    showLegend.value = !showLegend.value
  }

  function onImageError (layerId) {
    failedImageIds.value.add(layerId)
  }
</script>

<style scoped>
.layer-legend-container {
  position: absolute;
  bottom: 24px;
  right: 58px;
  z-index: 2;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-end;
  gap: 12px;
}

.legend-button {
  position: relative;
  flex-shrink: 0;
}

.legend-panel {
  position: relative;
  max-height: calc(100vh - 200px);
  flex-shrink: 0;
}

.legend-title {
  padding: 12px 16px;
  user-select: none;
}

.legend-content {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding: 8px 16px 16px 16px;
}

.legend-item:last-child {
  margin-bottom: 0 !important;
}

.legend-image {
  width: auto;
  max-width: 100%;
  height: auto;
  display: block;
}
</style>
