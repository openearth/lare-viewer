<template>
  <div class="selection-list pa-4">
    <v-select
      v-model="pending"
      :items="options"
      :label="label"
      item-title="name"
      item-value="id"
      variant="outlined"
      density="compact"
      clearable
      hide-details
    />
    <v-btn
      class="mt-3"
      color="primary"
      variant="flat"
      block
      :disabled="pending == null"
      @click="confirm"
    >
      Confirm
    </v-btn>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useAppStore } from '@/stores/app'

  const props = defineProps({
    label: { type: String, required: true },
    options: { type: Array, required: true },
    selectionKey: { type: String, default: null },
  })

  const emit = defineEmits(['step-complete'])
  const appStore = useAppStore()
  const pending = ref(null)

  onMounted(() => {
    if (props.selectionKey && appStore.selections[props.selectionKey] != null) {
      pending.value = appStore.selections[props.selectionKey]
    }
  })

  function confirm () {
    if (pending.value == null) return
    if (props.selectionKey) {
      appStore.setSelection(props.selectionKey, pending.value)
    }
    emit('step-complete', { value: pending.value })
  }
</script>
