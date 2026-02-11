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
      :is="contentComponent"
      v-if="contentComponent"
      v-bind="componentProps"
    />
  </v-navigation-drawer>
</template>

<script setup>
  import { computed, shallowRef, watch } from 'vue'
  import { useAppStore } from '@/stores/app'

  const props = defineProps({
    menuId: { type: String, required: true },
    drawerTitle: { type: String, required: true },
    component: { type: String, default: null },
    componentProps: { type: Object, default: () => ({}) },
  })

  const store = useAppStore()
  const contentComponent = shallowRef(null)

  const modules = import.meta.glob('@/components/*.vue')

  const loadComponent = async () => {
    if (props.component) {
      const path = `/src/components/${props.component}.vue`
      if (modules[path]) {
        const mod = await modules[path]()
        contentComponent.value = mod.default
      }
    }
  }

  watch(() => props.component, loadComponent, { immediate: true })

  const isOpen = computed({
    get: () => store.activeMenu === props.menuId,
    set: (value) => {
      if (!value && store.activeMenu === props.menuId) {
        store.closeMenu()
      }
    },
  })
</script>

<style scoped>
.sub-menu-drawer {
  position: absolute;
  left: 210px !important;
  max-height: calc(100% - 50px * 2);
  margin-top: 50px;
  border-radius: 28px;
}

.drawer-title {
  white-space: normal;
  margin-top: 10px;
}
</style>
