<template>
  <v-card
    v-if="hasVisibleLayers"
    class="layer-legend"
    elevation="4"
    rounded="xl"
    max-width="300"
  >
    <v-card-title
      class="d-flex justify-space-between align-center legend-title"
      @click="toggleLegend"
    >
      <span class="text-subtitle-2">
        {{ legendTitle }}
      </span>
      <v-icon
        class="legend-chevron"
        :class="{ 'legend-chevron--active': showLegend }"
      >
        mdi-chevron-down
      </v-icon>
    </v-card-title>

    <v-expand-transition>
      <v-card-text
        v-show="showLegend"
        class="legend-content"
      >
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
    </v-expand-transition>
  </v-card>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useMapStore } from '@/stores/map'
  import buildLegendUrl from '@/lib/build-legend-url'
  import navigationConfig from '@/config/navigation.json'

  const mapStore = useMapStore()
  const showLegend = ref(false)
  const failedImageIds = ref(new Set())

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

  const visibleLayers = computed(() => mapStore.visibleLayersWithConfig)

  const hasVisibleLayers = computed(() => visibleLayers.value.length > 0)

  const legendTitle = computed(() => {
    const count = visibleLayers.value.length
    return count === 1 ? 'Legend' : 'Legends'
  })

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
.layer-legend {
  position: absolute;
  bottom: 24px;
  right: 58px;
  z-index: 2;
}

.legend-title {
  cursor: pointer;
  padding: 12px 16px;
  user-select: none;
}

.legend-chevron {
  transform: rotate(-180deg);
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.legend-chevron--active {
  transform: rotate(0deg);
}

.legend-content {
  max-height: calc(100vh - 200px);
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
