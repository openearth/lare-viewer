<template>
  <v-app>
    <navigation-drawer />
    <v-main style="padding-inline: 0">
      <router-view />
      <layer-legend />
    </v-main>
  </v-app>
</template>

<script setup>
  import { onMounted } from 'vue'
  import NavigationDrawer from '@/components/NavigationDrawer.vue'
  import LayerLegend from '@/components/LayerLegend.vue'
  import workflowConfig from '@/config/workflow.json'
  import { useAppStore } from '@/stores/app'
  import { useMapStore } from '@/stores/map'
  import { executeWpsConfig } from '@/lib/wps/execute-config'

  const appStore = useAppStore()
  const mapStore = useMapStore()

  onMounted(async () => {
    const wps = workflowConfig.initialSetup?.wps
    if (wps?.trigger !== 'onStart') return

    try {
      await executeWpsConfig(wps, {
        payload: {},
        appStore,
        mapStore,
      })
    } catch (error) {
      console.error('Initial setup WPS request failed:', error)
    }
  })
</script>
