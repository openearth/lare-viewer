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
      selected.value = appStore.selections[props.selectionKey]
    }
  })

  watch(selected, (value) => {
    if (props.selectionKey) {
      appStore.setSelection(props.selectionKey, value)
    }
    if (value != null) {
      emit('step-complete', { value })
    }
  })
</script>
