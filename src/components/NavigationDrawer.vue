<template>
  <v-navigation-drawer
    class="custom-navigation-drawer"
    width="200"
  >
    <v-list-item class="d-flex justify-center align-center pa-5">
      <v-img
        :src="config.logo"
        alt="DesirMED Logo"
        width="80px"
      />
    </v-list-item>
    <v-list-item
      v-for="menu in config.menus"
      :key="menu.id"
      :title="menu.title"
      :disabled="!store.isStepAvailable(menu)"
      :class="{ 'step-locked': !store.isStepAvailable(menu) }"
      @click="handleMenuClick(menu)"
    />
  </v-navigation-drawer>

  <sub-menu
    v-for="menu in config.menus"
    :key="menu.id"
    :menu-id="menu.id"
    :drawer-title="menu.drawerTitle"
    :components="menu.components || []"
    :completion-event="menu.completionEvent || null"
    :wps="menu.wps || null"
  />
</template>

<script setup>
  import { useAppStore } from '@/stores/app'
  import SubMenu from '@/components/SubMenu.vue'
  import config from '@/config/navigation.json'

  const store = useAppStore()

  function handleMenuClick (menu) {
    if (!store.isStepAvailable(menu)) return
    store.toggleMenu(menu.id)
  }
</script>

<style scoped>
.custom-navigation-drawer {
  max-height: calc(100% - 50px * 2);
  margin-top: 50px;
  margin-left: 10px;
  border-radius: 28px;
}

.step-locked {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
