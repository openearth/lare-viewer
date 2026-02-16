// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    activeMenu: null,
  }),

  actions: {
    closeMenu() {
      this.activeMenu = null
    },

    toggleMenu(menuName) {
      this.activeMenu = this.activeMenu === menuName ? null : menuName
    },
  },
})
