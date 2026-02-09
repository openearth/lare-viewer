<template>
  <v-navigation-drawer
    v-if="hazardMenuIsOpen"
    v-model="hazardMenuIsOpen"
    class="custom-hazard-menu"
    width="250"
  >
    <v-list-item>
      <v-list-item-title>Select a hazard from the list</v-list-item-title>
    </v-list-item>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const hazardMenuIsOpen = computed({
  get: () => store.hazardMenuIsOpen,
  set: (value) => {
    if (!value && store.activeMenu === 'hazard') {
      store.closeMenu()
    }
  },
})
</script>

<style scoped>
.custom-hazard-menu {
  position: absolute;
  left: 220px;
  max-height: calc(100% - 50px * 2);
  margin-top: 50px;
  border-radius: 28px;
}
</style>
