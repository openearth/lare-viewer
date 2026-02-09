// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    activeMenu: null,
  }),
  
  getters: {
    areaMenuIsOpen: (state) => state.activeMenu === 'area',
    hazardMenuIsOpen: (state) => state.activeMenu === 'hazard',
  },
  
  actions: {
    closeMenu() {
      this.activeMenu = null
    },
    
    toggleMenu(menuName) {
      this.activeMenu = this.activeMenu === menuName ? null : menuName
    },
  },
})
