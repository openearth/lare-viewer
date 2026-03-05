<template>
  <div class="selection-list pa-4">
    <v-select
      v-model="selected"
      :items="options"
      :label="label"
      item-title="name"
      item-value="id"
      variant="outlined"
      density="compact"
      clearable
      hide-details
    />
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { useAppStore } from '@/stores/app'

  const props = defineProps({
    label: { type: String, required: true },
    options: { type: Array, required: true },
    selectionKey: { type: String, default: null },
  })

  const emit = defineEmits(['step-complete'])
  const appStore = useAppStore()
  const selected = ref(null)

  onMounted(() => {
    if (props.selectionKey && appStore.selections[props.selectionKey] != null) {
      const stored = appStore.selections[props.selectionKey]
      selected.value = typeof stored === 'object' && stored?.id != null ? stored.id : stored
    }
  })

  watch(selected, (value) => {
    if (props.selectionKey) {
      const option = props.options.find(o => o.id === value)
      const toStore =
        option && option.layerName != null
          ? {
            id: option.id,
            layerName: option.layerName,
            ...(option.regionIdProperty != null && { regionIdProperty: option.regionIdProperty }),
            ...(option.layerNameForWPS != null && { layerNameForWPS: option.layerNameForWPS }),
          }
          : value
      appStore.setSelection(props.selectionKey, toStore)
    }
    if (value != null) {
      emit('step-complete', { value })
    }
  })
</script>
