<template>
  <div class="layer-list">
    <v-list-item class="data-layers-header text-decoration-underline text-subtitle-2">
      Data Layers
    </v-list-item>

    <v-list-item
      v-for="layer in layers"
      :key="layer.id"
    >
      <template #prepend>
        <v-switch
          v-model="layerStates[layer.id]"
          hide-details
          density="compact"
          color="primary"
          class="mr-4"
        />
      </template>

      <v-list-item-title class="layer-name">
        {{ layer.name }}
      </v-list-item-title>
    </v-list-item>
  </div>
</template>

<script setup>
  import { reactive } from 'vue'

  const props = defineProps({
    layers: { type: Array, required: true },
  })

  const layerStates = reactive(
    Object.fromEntries(props.layers.map((l) => [l.id, l.active ?? false]))
  )
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
