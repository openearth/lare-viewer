<template>
  <div class="number-input pa-4">
    <div class="number-input__row">
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
        class="number-input__field"
      />
      <v-btn
        v-if="showCalcButton"
        class="number-input__calc-btn"
        icon="mdi-calculator"
        variant="tonal"
        color="primary"
        size="small"
        :disabled="value == null || value < min || value > max"
        :title="calcButtonTitle"
        @click="onCalcClick"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { useMapStore } from '@/stores/map'
  import { resolveInputValue } from '@/lib/wps/resolve-input'

  const appStore = useAppStore()
  const mapStore = useMapStore()

  const props = defineProps({
    label: { type: String, required: true },
    suffix: { type: String, default: '' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10000 },
    step: { type: Number, default: 1 },
    defaultValue: { type: Number, default: 0 },
    defaultValueSource: { type: String, default: null },
    showCalcButton: { type: Boolean, default: false },
    calcButtonTitle: { type: String, default: 'Calculate' },
  })

  const emit = defineEmits(['step-ready', 'run-wps'])

  const resolvedDefault = computed(() => {
    if (!props.defaultValueSource) return props.defaultValue
    const resolved = resolveInputValue(props.defaultValueSource, {
      payload: {},
      stores: { app: appStore, map: mapStore },
    })
    return resolved != null ? Number(resolved) : props.defaultValue
  })

  const value = ref(resolvedDefault.value)

  watch(resolvedDefault, (newVal) => {
    if (newVal != null) {
      value.value = newVal
    }
  })

  watch(value, (newVal) => {
    if (newVal != null && newVal >= props.min && newVal <= props.max) {
      emit('step-ready', { value: newVal })
    }
  }, { immediate: true })

  function onCalcClick () {
    if (props.showCalcButton && value.value != null && value.value >= props.min && value.value <= props.max) {
      emit('run-wps', { value: value.value })
    }
  }
</script>

<style scoped>
.number-input__row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.number-input__field {
  flex: 1;
  min-width: 0;
}

.number-input__field :deep(.v-field__append-inner) {
  padding-left: 2px;
}

.number-input__field :deep(.v-field__input) {
  padding-right: 2px;
}

.number-input__calc-btn {
  flex-shrink: 0;
}
</style>
