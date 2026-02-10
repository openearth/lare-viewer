<template>
  <div class="layer-list">
    <v-list-subheader class="text-primary font-weight-bold">
      DATA LAYERS
    </v-list-subheader>

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
          class="mr-2"
        />
      </template>

      <v-list-item-title>{{ layer.name }}</v-list-item-title>

      <template #append>
        <v-icon size="small" color="grey">
          mdi-information-outline
        </v-icon>
      </template>
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
