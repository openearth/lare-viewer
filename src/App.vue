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
  import NavigationDrawer from '@/components/NavigationDrawer.vue'
  import LayerLegend from '@/components/LayerLegend.vue'
</script>
