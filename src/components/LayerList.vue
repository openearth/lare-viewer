<template>
  <div class="layer-list">
    <v-list-item class="data-layers-header text-decoration-underline text-subtitle-2">
      Data Layers
    </v-list-item>

    <template v-for="layer in layers" :key="layer.id">
      <v-list-item>
        <template #prepend>
          <v-switch
            :model-value="mapStore.layerVisibility[layer.id] ?? false"
            hide-details
            density="compact"
            color="primary"
            class="mr-4"
            @update:model-value="mapStore.setLayerVisibility(layer.id, $event)"
          />
        </template>

        <v-list-item-title class="layer-name">
          {{ layer.name }}
        </v-list-item-title>
      </v-list-item>
      <active-feature-properties
        v-if="layer.propertiesBox"
        :layer-id="layer.id"
        :properties-box-type="layer.propertiesBox"
        class="mt-0"
      />
    </template>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useMapStore } from '@/stores/map'
  import ActiveFeatureProperties from '@/components/ActiveFeatureProperties.vue'

  const props = defineProps({
    layers: { type: Array, required: true },
  })

  const mapStore = useMapStore()

  onMounted(() => {
    mapStore.initializeLayerVisibility(props.layers)
    mapStore.initializeLayerClickable(props.layers)
  })
</script>

<style scoped>
.data-layers-header {
  justify-content: center;
  display: flex;
  margin-top: 10px;
}

.layer-name {
  white-space: normal;
}
</style>
