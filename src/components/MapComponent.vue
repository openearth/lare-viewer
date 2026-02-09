<template>
  <div class="map-wrapper">
    <mapbox-map
      v-model:map="mapInstance"
      :access-token="accessToken"
      :center="MAP_CENTER"
      :zoom="MAP_ZOOM"
      @mb-created="onMapCreated"
    >
      <MapLayer
        v-for="layer in mapboxLayers"
        :key="layer.id"
        :layer="layer"
        @click="onFeatureClick"
      />
      <MapboxNavigationControl position="bottom-right" />
    </mapbox-map>
  </div>
</template>

<script setup>
  import { MapboxMap, MapboxNavigationControl } from '@studiometa/vue-mapbox-gl'
  import { MAP_CENTER, MAP_ZOOM } from '@/lib/constant'
  import { useMapStore } from '@/stores/map'
  import { computed, ref} from 'vue'
  const mapStore = useMapStore()
  const mapboxLayers = computed(() => mapStore.mapboxLayers)
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  
  const mapInstance = ref(null)
 

  function onMapCreated (map) {
    mapInstance.value = map
    // Initialize layers after map is created
    mapStore.initializeMapboxLayers()
  }
  function onFeatureClick (features) {
    console.log(features)
  }

</script>
<style>
.map-wrapper,
.map-wrapper .mapboxgl-map {
  width: 100%;
  height: 100%;
}
</style>
