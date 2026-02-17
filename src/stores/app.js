import { defineStore } from 'pinia'
import config from '@/config/navigation.json'

export const useAppStore = defineStore('app', {
  state: () => ({
    activeMenu: null,
    completedSteps: [],
  }),

  getters: {
    isStepCompleted: (state) => (stepId) => {
      return state.completedSteps.includes(stepId)
    },

    isStepAvailable: (state) => (menu) => {
      if (!menu.requiredSteps || menu.requiredSteps.length === 0) {
        return true
      }
      return menu.requiredSteps.every(
        reqId => state.completedSteps.includes(reqId),
      )
    },
  },

  actions: {
    closeMenu () {
      this.activeMenu = null
    },

    toggleMenu (menuId) {
      this.activeMenu = this.activeMenu === menuId ? null : menuId
    },

    completeStep (stepId) {
      if (!this.completedSteps.includes(stepId)) {
        this.completedSteps.push(stepId)
      }
    },

    resetStepsFrom (stepId) {
      const menus = config.menus
      const index = menus.findIndex(m => m.id === stepId)
      if (index >= 0) {
        const toRemove = menus.slice(index + 1).map(m => m.id)
        this.completedSteps = this.completedSteps.filter(
          id => !toRemove.includes(id),
        )
      }
    },
  },
})
