<template>
  <div class="number-input pa-4">
    <v-text-field
      v-model.number="value"
      :label="label"
      :suffix="suffix"
      :min="min"
      :max="max"
      :step="step"
      type="number"
      variant="underlined"
      color="primary"
      hide-details
    />
    <v-btn
      class="mt-2"
      color="primary"
      variant="tonal"
      block
      size="small"
      @click="confirm"
    >
      Confirm
    </v-btn>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    label: { type: String, required: true },
    suffix: { type: String, default: '' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10000 },
    step: { type: Number, default: 1 },
    defaultValue: { type: Number, default: 0 },
  })

  const emit = defineEmits(['step-complete'])
  const value = ref(props.defaultValue)

  function confirm () {
    emit('step-complete', { value: value.value })
  }
</script>
