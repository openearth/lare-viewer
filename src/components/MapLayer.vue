<template>
  <MapboxLayer
    v-if="layer"
    :id="layer.id"
    :options="layer"
    @mb-click="onLayerClicked"
    @mb-mouseenter="onMouseenter"
    @mb-mouseleave="onMouseleave"
  />
</template>

<script setup>
  import { MapboxLayer, useMap } from '@studiometa/vue-mapbox-gl'
  import { computed, unref } from 'vue'
  import { useMapStore } from '@/stores/map'

  const props = defineProps({
    layer: {
      type: Object,
      default: () => ({}),
    },
  })

  const emit = defineEmits(['click'])

  const { map } = useMap()
  const mapStore = useMapStore()

  const isClickable = computed(() => mapStore.isLayerClickable(props.layer.id))

  function onLayerClicked(e) {
    if (isClickable.value) {
    emit('click', e.features[0])
    }
  }

  function onMouseenter() {
    if (isClickable.value) {
    unref(map).getCanvas().style.cursor = 'pointer'
    }
  }

  function onMouseleave() {
    unref(map).getCanvas().style.cursor = ''
  }
</script>
