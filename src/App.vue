<template>
  <v-app>
    <navigation-drawer />
    <v-main style="padding-inline: 0">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  import NavigationDrawer from '@/components/NavigationDrawer.vue'
</script>
