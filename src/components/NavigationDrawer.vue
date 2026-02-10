<template>
  <v-navigation-drawer
    class="custom-navigation-drawer"
    width="200"
  >
    <v-list-item class="d-flex justify-center align-center pa-5">
      <v-img
        :src="logoPath"
        alt="DesirMED Logo"
        width="80px"
      />
    </v-list-item>
    <v-list-item
      title="Area"
      append-icon="mdi-checkbox-blank-outline"
      @click="handleMenuClick('area')"
    />
    <v-list-item
      title="Hazard"
      append-icon="mdi-checkbox-blank-outline"
      @click="handleMenuClick('hazard')"
    />
  </v-navigation-drawer>
  <area-menu />
  <hazard-menu />
</template>

<script setup>
  import { useAppStore } from '@/stores/app'
  import AreaMenu from '@/components/AreaMenu.vue'
  import HazardMenu from '@/components/HazardMenu.vue'

  const logoPath = '/desirmed_logo.png'
  const store = useAppStore()

  const handleMenuClick = (menuName) => {
    store.toggleMenu(menuName)
  }
</script>

<style scoped>
.custom-navigation-drawer {
  max-height: calc(100% - 50px * 2);
  margin-top: 50px;
  margin-left: 10px;
  border-radius: 28px;
}
</style>
