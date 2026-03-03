import { defineStore } from 'pinia'
import config from '@/config/navigation.json'

export const useAppStore = defineStore('app', {
  state: () => ({
    activeMenu: null,
    completedSteps: [],
    wpsResults: {},
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

    setWpsResult (key, result) {
      this.wpsResults[key] = result
    },

    resetStepsFrom (stepId) {
      const menus = config.menus
      const index = menus.findIndex(m => m.id === stepId)
      if (index >= 0) {
        const toRemove = menus.slice(index + 1).map(m => m.id)
        this.completedSteps = this.completedSteps.filter(
          id => !toRemove.includes(id),
        )
        for (const id of toRemove) {
          delete this.wpsResults[id]
        }
      }
    },
  },
})
