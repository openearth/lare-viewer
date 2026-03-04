<template>
  <v-navigation-drawer
    v-if="isOpen"
    v-model="isOpen"
    class="sub-menu-drawer"
    width="250"
  >
    <div class="sub-menu-drawer__inner">
      <v-list-item class="sub-menu-drawer__header">
        <v-list-item-title class="font-weight-bold drawer-title">
          {{ drawerTitle }}
        </v-list-item-title>
        <template #append>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            style="margin-top: 10px;"
            @click="isOpen = false"
          />
        </template>
      </v-list-item>

      <div class="sub-menu-drawer__content">
        <component
          :is="comp.component"
          v-for="(comp, index) in validComponents"
          :key="index"
          v-bind="comp.props"
          @step-complete="onChildStepComplete"
          @step-ready="onStepReady"
          @run-wps="onRunWps"
        />
      </div>

      <div class="sub-menu-drawer__footer">
        <p
          v-if="props.explanation"
          class="sub-menu-drawer__explanation text-body-2 text-medium-emphasis"
        >
          {{ props.explanation }}
        </p>
        <v-btn
          class="sub-menu-drawer__confirm"
          color="primary"
          variant="tonal"
          block
          size="small"
          :disabled="props.requiresConfirmation && !stepReadyPayload"
          @click="onConfirmClick"
        >
          Confirm
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
  import { computed, shallowRef, watch } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { useMapStore } from '@/stores/map'
  import { executeWpsConfig } from '@/lib/wps/execute-config'

  const props = defineProps({
    menuId: { type: String, required: true },
    drawerTitle: { type: String, required: true },
    components: { type: Array, default: () => [] },
    completionEvent: { type: String, default: null },
    requiresConfirmation: { type: Boolean, default: false },
    confirmationSource: { type: String, default: 'component' },
    explanation: { type: String, default: '' },
    wps: { type: Object, default: null },
  })

  const store = useAppStore()
  const mapStore = useMapStore()
  const loadedComponents = shallowRef([])
  const stepReadyPayload = shallowRef(null)

  const modules = import.meta.glob('@/components/*.vue')

  const loadComponents = async () => {
    const loaded = []

    for (const compConfig of props.components) {
      if (compConfig.component) {
        const path = `/src/components/${compConfig.component}.vue`
        if (modules[path]) {
          const mod = await modules[path]()
          loaded.push({
            component: mod.default,
            props: compConfig.componentProps || {},
          })
        }
      }
    }

    loadedComponents.value = loaded
  }

  watch(() => props.components, loadComponents, { immediate: true, deep: true })

  const validComponents = computed(() => {
    return loadedComponents.value.filter(comp => comp.component)
  })

  const isOpen = computed({
    get: () => store.activeMenu === props.menuId,
    set: (value) => {
      if (!value && store.activeMenu === props.menuId) {
        store.closeMenu()
        stepReadyPayload.value = null
      }
    },
  })

  // --- Step completion (independent of WPS) ---

  watch(isOpen, async (open) => {
    if (open) {
      stepReadyPayload.value = null
    }
    if (open && props.completionEvent === 'auto' && !store.isStepCompleted(props.menuId)) {
      completeStep()
    }
    if (open && props.confirmationSource === 'wps' && props.wps?.trigger === 'stepOpen') {
      try {
        const result = await executeWpsOnly({})
        stepReadyPayload.value = result != null ? { result } : {}
      } catch (error) {
        console.error(`WPS request failed for step "${ props.menuId }" (stepOpen):`, error)
      }
    }
  })

  if (props.confirmationSource === 'mapClick') {
    watch([isOpen, () => mapStore.activeRegion], ([open, region]) => {
      if (open && region) {
        stepReadyPayload.value = { region }
      }
    })
  }

  function completeStep () {
    if (store.isStepCompleted(props.menuId)) {
      store.resetStepsFrom(props.menuId)
    }
    store.completeStep(props.menuId)
  }

  // --- WPS execution (driven by wps.trigger) ---

  const wpsTrigger = props.wps?.trigger

  if (wpsTrigger === 'mapClick') {
    watch(() => mapStore.activeRegion, (region) => {
      if (region && isOpen.value) {
        executeWps()
      }
    })
  }

  async function executeWpsOnly (payload = {}) {
    if (!props.wps) return null
    const result = await executeWpsConfig(props.wps, {
      payload,
      appStore: store,
      mapStore,
    })
    addWpsLayers(result)
    return result
  }

  async function executeWps (payload = {}) {
    try {
      await executeWpsOnly(payload)
    } catch (error) {
      console.error(`WPS request failed for step "${ props.menuId }":`, error)
      return
    }
    completeStep()
  }

  function addWpsLayers (result) {
    if (!result) return

    const layerData = result.layers ?? result
    const folders = Array.isArray(layerData) ? layerData : []

    for (const folder of folders) {
      if (!folder?.contents) continue
      for (const entry of folder.contents) {
        if (entry.layer && entry.url) {
          mapStore.addDynamicLayer({
            id: entry.layer,
            name: entry.name || entry.layer,
            layer: entry.layer,
            url: entry.url,
          })
        }
      }
    }
  }

  function onChildStepComplete (payload) {
    if (props.requiresConfirmation) {
      stepReadyPayload.value = payload || {}
    } else {
      onStepComplete(payload)
    }
  }

  function onStepReady (payload) {
    stepReadyPayload.value = payload || {}
  }

  async function onRunWps (payload) {
    if (props.wps?.trigger !== 'component') return
    try {
      const result = await executeWpsOnly(payload || {})
      stepReadyPayload.value = result != null ? { result } : {}
    } catch (error) {
      console.error(`WPS request failed for step "${ props.menuId }" (run-wps):`, error)
    }
  }

  async function onStepComplete (payload) {
    if (wpsTrigger === 'stepComplete') {
      await executeWps(payload)
    } else {
      completeStep()
    }
  }

  async function onConfirmClick () {
    if (props.requiresConfirmation && !stepReadyPayload.value) return
    const payload = stepReadyPayload.value || {}
    stepReadyPayload.value = null
    if (props.confirmationSource === 'wps' || props.confirmationSource === 'mapClick') {
      completeStep()
      store.openNextStep(props.menuId)
      return
    }
    await onStepComplete(payload)
    store.openNextStep(props.menuId)
  }
</script>

<style scoped>
.sub-menu-drawer {
  position: absolute;
  left: 210px !important;
  height: fit-content !important;
  max-height: calc(100vh - 100px);
  margin-top: 50px;
  border-radius: 28px;
}

.sub-menu-drawer :deep(.v-navigation-drawer__content) {
  display: block;
}

.sub-menu-drawer__inner {
  display: flex;
  flex-direction: column;
}

.sub-menu-drawer__header {
  flex-shrink: 0;
}

.sub-menu-drawer__content {
  overflow-y: auto;
  max-height: min(60vh, 400px);
}

.sub-menu-drawer__footer {
  flex-shrink: 0;
  padding: 12px 16px 16px;
}

.sub-menu-drawer__explanation {
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.sub-menu-drawer__confirm {
  margin: 0;
}

.drawer-title {
  white-space: normal;
  margin-top: 10px;
}
</style>
