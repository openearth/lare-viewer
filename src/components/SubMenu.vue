<template>
  <v-navigation-drawer
    v-if="isOpen"
    v-model="isOpen"
    class="sub-menu-drawer"
    width="250"
  >
    <v-list-item>
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

    <component
      :is="comp.component"
      v-for="(comp, index) in validComponents"
      :key="index"
      v-bind="comp.props"
      @step-complete="onStepComplete"
    />
  </v-navigation-drawer>
</template>

<script setup>
  import { computed, shallowRef, watch } from 'vue'
  import { useAppStore } from '@/stores/app'
  import { useMapStore } from '@/stores/map'
  import sendWpsRequest from '@/lib/wps'
  import { resolveInputs } from '@/lib/wps/resolve-input'
  import { handleOutputActions } from '@/lib/wps/handle-output'

  const props = defineProps({
    menuId: { type: String, required: true },
    drawerTitle: { type: String, required: true },
    components: { type: Array, default: () => [] },
    completionEvent: { type: String, default: null },
    wps: { type: Object, default: null },
  })

  const store = useAppStore()
  const mapStore = useMapStore()
  const loadedComponents = shallowRef([])

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
      }
    },
  })

  // --- Step completion (independent of WPS) ---

  watch(isOpen, (open) => {
    if (open && props.completionEvent === 'auto' && !store.isStepCompleted(props.menuId)) {
      completeStep()
    }
  })

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

  async function executeWps (payload = {}) {
    if (!props.wps) return

    try {
      const baseUrl = import.meta.env.VITE_WPS_BASE_URL
      const { identifier, outputActions, storeResultAs } = props.wps

      const stores = { app: store, map: mapStore }
      const context = { payload, stores }

      const inputs = resolveInputs(props.wps.inputs, context)
      const result = await sendWpsRequest({
        baseUrl,
        identifier,
        inputs,
      })

      if (storeResultAs) {
        store.setWpsResult(storeResultAs, result)
      }

      if (outputActions) {
        handleOutputActions(outputActions, result, stores)
      }

      addWpsLayers(result)
    } catch (error) {
      console.error(`WPS request failed for step "${ props.menuId }":`, error)
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

  function onStepComplete (payload) {
    if (wpsTrigger === 'stepComplete') {
      executeWps(payload)
    } else {
      completeStep()
    }
  }
</script>

<style scoped>
.sub-menu-drawer {
  position: absolute;
  left: 210px !important;
  height: fit-content !important;
  max-height: calc(100% - 50px * 2);
  margin-top: 50px;
  border-radius: 28px;
  padding-bottom: 10px;
}

.drawer-title {
  white-space: normal;
  margin-top: 10px;
}
</style>
