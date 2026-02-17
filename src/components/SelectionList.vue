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
  import { ref, watch } from 'vue'

  defineProps({
    label: { type: String, required: true },
    options: { type: Array, required: true },
  })

  const emit = defineEmits(['step-complete'])
  const selected = ref(null)

  watch(selected, (value) => {
    if (value != null) {
      emit('step-complete', { value })
    }
  })
</script>
