<!--
 * @Author: your name
 * @Date: 2021-12-16 10:18:17
 * @LastEditTime: 2021-12-16 10:27:51
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vite-element-axios-project/src/components/login.vue
-->
<template>登陆中，请等待{{ count }}秒</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
let count = ref(5)
let router = useRouter()
onMounted(() => {
  setInterval(() => {
    count.value -= 1
    if (count.value === 0) {
      router.push('/home')
      localStorage.setItem('token', 1)
    }
  }, 1000)
})
</script>
