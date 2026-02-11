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
  import { unref } from 'vue'

  defineProps({
    layer: {
      type: Object,
      default: () => ({}),
    },
  })

  const emit = defineEmits(['click'])

  const { map } = useMap()

  function onLayerClicked(e) {
    emit('click', e.features[0])
  }

  function onMouseenter() {
    unref(map).getCanvas().style.cursor = 'pointer'
  }

  function onMouseleave() {
    unref(map).getCanvas().style.cursor = ''
  }
</script>
