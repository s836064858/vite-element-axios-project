import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userInfo: '123',
    }
  },
  getters: {
    addGettersSign() {
      return this.userInfo + 'getters'
    },
  },
  actions: {
    addActionsSign() {
      this.userInfo += 'actions'
    },
  },
})

// <template>
//   {{ addGettersSign }}
// </template>
// <script setup>
// import { storeToRefs } from 'pinia'
// import { useUserStore } from '@stores/userStore'
// const userStore = useUserStore()
// userStore.addActionsSign()
// const { userInfo, addGettersSign } = storeToRefs(userStore)
// userInfo.value = 1234
// </script>
// <style lang="scss" scoped></style>
