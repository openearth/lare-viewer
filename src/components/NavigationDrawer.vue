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
      v-for="step in config.steps"
      :key="step.id"
      :title="step.title"
      :disabled="!store.isStepAvailable(step)"
      :class="{ 'step-locked': !store.isStepAvailable(step) }"
      @click="handleStepClick(step)"
    />
  </v-navigation-drawer>

  <sub-menu
    v-for="step in config.steps"
    :key="step.id"
    :menu-id="step.id"
    :drawer-title="step.drawerTitle"
    :components="step.components"
    :completion-event="step.completionEvent"
    :requires-confirmation="step.requiresConfirmation || false"
    :confirmation-source="step.confirmationSource || 'component'"
    :wps="step.wps || null"
  />
</template>

<script setup>
  import { useAppStore } from '@/stores/app'
  import SubMenu from '@/components/SubMenu.vue'
  import config from '@/config/workflow.json'

  const store = useAppStore()

  function handleStepClick (step) {
    if (!store.isStepAvailable(step)) return
    store.toggleMenu(step.id)
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
