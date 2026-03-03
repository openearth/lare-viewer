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
  import { ref, watch, computed } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { resolveInputValue } from '@/lib/wps/resolve-input'

  const props = defineProps({
    label: { type: String, required: true },
    suffix: { type: String, default: '' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10000 },
    step: { type: Number, default: 1 },
    defaultValue: { type: Number, default: 0 },
    defaultValueSource: { type: String, default: null },
  })

  const emit = defineEmits(['step-complete'])
  const appStore = useAppStore()

  const resolvedDefault = computed(() => {
    if (!props.defaultValueSource) return props.defaultValue
    const resolved = resolveInputValue(props.defaultValueSource, {
      payload: {},
      stores: { app: appStore },
    })
    return resolved != null ? Number(resolved) : props.defaultValue
  })

  const value = ref(resolvedDefault.value)

  watch(resolvedDefault, (newVal) => {
    if (newVal != null) {
      value.value = newVal
    }
  })

  function confirm () {
    emit('step-complete', { value: value.value })
  }
</script>
