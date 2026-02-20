<template>
  <v-card
    variant="flat"
    rounded="xl"
    class="bg-grey-lighten-3 px-3 py-0 mx-3"
  >
    <v-card-title v-if="hasActiveFeature" class="d-flex justify-space-between align-center card-title-compact">
      <span>{{ cardTitle }}</span>
      <v-btn
        v-if="hasActiveFeature"
        variant="outlined"
        rounded="xl"
        size="small"
        class="bg-grey-lighten-2 clear-btn"
        @click="clear"
      >
        Clear
      </v-btn>
    </v-card-title>
    <v-card-text class="pa-0">
      <div v-if="!hasActiveFeature" class="empty-state text-grey font-italic">
        Click on a feature on the map
      </div>
      <v-list v-else density="compact">
        <v-list-item
          v-for="(value, label) in propertyDisplay"
          :key="label"
          class="item-compact"
        >
          <v-list-item-title class="item-title-compact">
            <b>{{ label }}</b>: {{ value }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { computed } from 'vue'
  import { useMapStore } from '@/stores/map'

  const props = defineProps({
    layerId: { type: String, required: true },
    propertiesBoxType: { type: String, required: true },
  })

  const mapStore = useMapStore()

  function getCardTitle (propertiesBoxType) {
    const titles = {
      region: 'Selected region',
    }
    return titles[propertiesBoxType] || 'Properties'
  }

  function getPropertyDisplay (propertiesBoxType, properties) {
    const mappings = {
      region: {
        'Country': properties.cntr_code ?? '—',
        'Region name': properties.nuts_name ?? '—',
        'NUTS ID': properties.nuts_id ?? '—',
      },
    }
    return mappings[propertiesBoxType] || {}
  }

  const cardTitle = computed(() => getCardTitle(props.propertiesBoxType))

  const hasActiveFeature = computed(() => {
    return mapStore.activeRegion?.layerId === props.layerId
  })

  const propertyDisplay = computed(() => {
    if (!hasActiveFeature.value) {
      return {}
    }
    return getPropertyDisplay(props.propertiesBoxType, mapStore.activeRegion.properties)
  })

  function clear () {
    mapStore.clearActiveRegion()
  }
</script>

<style scoped>
.card-title-compact {
  font-size: 0.875rem;
  margin-bottom: -18px;
}

.item-compact {
  min-height: 10px;
  margin-bottom: -5px;
}

.item-title-compact {
  font-size: 0.75rem;
  white-space: normal;
  line-height: 1.3;
  margin: 0;
}

.clear-btn {
  font-size: 0.7rem;
  text-transform: none;
  padding: 2px 8px;
  height: 20px;
  position: relative;
  z-index: 10;
  margin-right: -10px;
}
</style>
