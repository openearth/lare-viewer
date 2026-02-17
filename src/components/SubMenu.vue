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
  import sendWpsRequest from '@/lib/wps'

  const props = defineProps({
    menuId: { type: String, required: true },
    drawerTitle: { type: String, required: true },
    components: { type: Array, default: () => [] },
    completionEvent: { type: String, default: null },
    wps: { type: Object, default: null },
  })

  const store = useAppStore()
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

  watch(isOpen, (open) => {
    if (open && props.completionEvent === 'auto' && !store.isStepCompleted(props.menuId)) {
      completeCurrentStep()
    }
  })

  async function completeCurrentStep (payload = {}) {
    if (props.wps) {
      try {
        const baseUrl = import.meta.env.VITE_WPS_BASE_URL
        const inputs = payload?.value != null
          ? [{ id: props.menuId, type: 'LiteralData', value: payload.value }]
          : []

        await sendWpsRequest({
          baseUrl,
          identifier: props.wps.identifier,
          inputs,
        })
      } catch (error) {
        console.error(`WPS request failed for step "${ props.menuId }":`, error)
      }
    }

    store.completeStep(props.menuId)
  }

  function onStepComplete (payload) {
    if (store.isStepCompleted(props.menuId)) {
      store.resetStepsFrom(props.menuId)
    }
    completeCurrentStep(payload)
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
